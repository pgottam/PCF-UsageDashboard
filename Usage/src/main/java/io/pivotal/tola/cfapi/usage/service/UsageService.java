package io.pivotal.tola.cfapi.usage.service;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.pivotal.tola.cfapi.usage.utils.DateUtils;
import io.pivotal.tola.cfapi.usage.model.*;
import io.pivotal.tola.cfapi.usage.utils.UsageUtils;
import io.pivotal.tola.cfapi.response.model.*;
import org.cloudfoundry.operations.CloudFoundryOperations;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import io.pivotal.tola.cfapi.usage.configuration.FoundationsConfig;
import reactor.core.publisher.Mono;

@Component
public class UsageService {


    private static final Logger LOG = LoggerFactory.getLogger(UsageService.class);

    private final String[] START_DATES = new String[] { "01-01", "04-01", "07-01", "10-01" };
    private final String[] END_DATES = new String[] { "03-31", "06-30", "09-30", "12-31" };

    @Autowired
    private FoundationsConfig config;

    public List<Organization> getOrgs(String foundation) {
        CloudFoundryOperations operations = config.getOperations(foundation);

        Mono<List<Organization>> orgs = operations.organizations().list().filter(organizationSummary -> !config.getExcludedOrgs().contains(organizationSummary.getName()))
                .map(organizationSummary -> Organization.builder().guid(organizationSummary.getId()).name(organizationSummary.getName()).build()).collectList();


        return orgs.block();

    }

    public OrgUsage appUsage(String foundation, String orgGuid, Date start, Date end) {
        DateUtils dt = new DateUtils();
        return generateAppUsage(foundation, orgGuid, dt.converttoyyyyMMdd(start), dt.converttoyyyyMMdd(end));
    }

    public OrgUsage appUsage(String foundation, String orgGuid, int year, int quarter) {
        DateUtils dt = new DateUtils();
        int currentQuarter = dt.getQuarter(year, dt.getCurrentDate());
        if(currentQuarter == quarter){
            return generateAppUsage(foundation, orgGuid, year + "-"+ START_DATES[quarter-1], dt.converttoyyyyMMdd(dt.getCurrentDate()));
        }else{
            return generateAppUsage(foundation, orgGuid, year + "-"+ START_DATES[quarter-1], year + "-" + END_DATES[quarter-1]);
        }
    }

    private OrgUsage generateAppUsage(String foundation, String orgGuid, String start, String end){

        String result = callAppUsageApi(foundation, orgGuid, start, end).getBody();

        DateUtils dt = new DateUtils();
        int year = dt.getYear();
        int quarter = dt.getQuarter(year, dt.getDayStart(start));

        ObjectMapper objectMapper = new ObjectMapper();
        AppUsage appUsage = null;
        try {
            appUsage = objectMapper.readValue(result, AppUsage.class);
        }catch (JsonParseException |JsonMappingException jme){
            LOG.error("Encountered exception response to AppUsage", jme.getMessage());
        }catch (IOException e){
            LOG.error("Encountered IO exception response to AppUsage", e);
        }

        OrgUsage orgUsage = OrgUsage.builder().orgGuid(orgGuid).year(year).quarter(quarter).build();

        //Space calculations
        Map<String, List<AppUsage_>> spaceMap = appUsage.getAppUsages().stream().collect(Collectors.groupingBy(AppUsage_::getSpaceGuid));
        Map<String, SpaceUsage> spaceUsageMap = new HashMap<>();
        Map<String, AUsage> aUsageMap = new HashMap<>();
        spaceMap.forEach((k,v)->{

            if(v != null && v.size() > 0) {
                final SpaceUsage su = SpaceUsage.builder().build();
                su.setSpaceGuid(k);
                su.setSpaceName(v.get(0).getSpaceName());
                su.setTotalApps(UsageUtils.getUniqueApps(v).size());
                su.setTotalAis(v.size());
                su.setTotalMbPerAis(UsageUtils.computeTotalMbPerAis(v));
                su.setAiDurationInSecs(UsageUtils.computeTotalDurationInSecs(v, dt.getNoOfDaysElapsed(start, end)));


                Map<String, List<AppUsage_>> appMap = v.stream().collect(Collectors.groupingBy(AppUsage_::getAppName));
                appMap.forEach((ak, av) -> {

                    if(av != null && av.size() > 0) {
                        final AUsage a = AUsage.builder().build();
                        a.setSpaceGuid(su.getSpaceGuid());
                        a.setSpaceName(su.getSpaceName());
                        a.setAppGuid(av.get(0).getAppGuid());
                        a.setAppName(av.get(0).getAppName());
                        a.setTotalAis(av.size());
                        a.setTotalMbPerAis(UsageUtils.computeTotalMbPerAis(av));
                        a.setAiDurationInSecs(UsageUtils.computeTotalDurationInSecs(av, dt.getNoOfDaysElapsed(start, end)));
                        aUsageMap.put(ak + "-" + su.getSpaceName(), a);
                    }
                });
                spaceUsageMap.put(k, su);
            }
        });
        orgUsage.setAUsage(aUsageMap);
        orgUsage.setSpaceUsage(spaceUsageMap);
        return orgUsage;
    }

    public SIUsage svcUsage(String foundation, String orgGuid, Date start , Date end) {
        DateUtils dt = new DateUtils();
        return generateSvcUsage(foundation, orgGuid, dt.converttoyyyyMMdd(start), dt.converttoyyyyMMdd(end));
    }

    public SIUsage svcUsage(String foundation, String orgGuid, int year, int quarter) {
        DateUtils dt = new DateUtils();
        int currentQuarter = dt.getQuarter(year, dt.getCurrentDate());
        if(currentQuarter == quarter){
            return generateSvcUsage(foundation, orgGuid, year + "-"+ START_DATES[quarter-1], dt.converttoyyyyMMdd(dt.getCurrentDate()));
        }else{
            return generateSvcUsage(foundation, orgGuid, year + "-"+ START_DATES[quarter-1], year + "-" + END_DATES[quarter-1]);
        }
    }


    public SIUsage generateSvcUsage(String foundation, String orgGuid, String start, String end) {

        String result = callSvcUsageApi(foundation, orgGuid, start, end).getBody();

        DateUtils dt = new DateUtils();
        int year = dt.getYear();
        int quarter = dt.getQuarter(year, dt.getDayStart(start));

        ObjectMapper objectMapper = new ObjectMapper();
        ServiceUsage serviceUsage = null;
        try {
            serviceUsage = objectMapper.readValue(result, ServiceUsage.class);
        }catch (JsonParseException |JsonMappingException jme){
            LOG.error("Encountered exception response to ServiceUsage", jme.getMessage());
        }catch (IOException e){
            LOG.error("Encountered IO exception response to ServiceUsage ", e);
        }

        SIUsage siUsage = SIUsage.builder().orgGuid(orgGuid).year(year).quarter(quarter).build();

        //Service instances per space calculation
        Map<String, List<ServiceUsage_>> siSpaceMap = serviceUsage.getServiceUsages().stream()
                .filter(su -> !config.getExcludedServices().contains(su.getServiceName()))
                .collect(Collectors.groupingBy(ServiceUsage_::getSpaceGuid));
        Map<String, SISpaceUsage> siSpaceUsageMap = new HashMap<>();
        Map<String, ServiceInstanceUsage> serviceInstanceUsageMap = new HashMap<>();

        siSpaceMap.forEach((k,v)->{

            if(v != null && v.size() > 0) {

                if(LOG.isDebugEnabled()){
                    v.stream().forEach(uu -> {
                        LOG.debug(uu.toString());
                    });
                }

                final SISpaceUsage su = SISpaceUsage.builder().build();
                su.setSpaceGuid(k);
                su.setSpaceName(v.get(0).getSpaceName());
                su.setTotalSis(v.size());
                su.setTotalSvcs(UsageUtils.getUniqueServices(v).size());
                su.setSiDurationInSecs(UsageUtils.computeTotalSIDurationInSecs(v, dt.getNoOfDaysElapsed(start, end)));
                siSpaceUsageMap.put(k, su);
            }

        });

        siSpaceMap.forEach((k,v) -> {

            if(v != null && v.size() > 0) {

                v.stream().forEach((sv) -> {

                    final ServiceInstanceUsage su = ServiceInstanceUsage.builder().build();
                    su.setSpaceName(sv.getSpaceName());
                    su.setDurationInSecs(sv.getDurationInSeconds() / (86400* dt.getNoOfDaysElapsed(start, end)));
                    su.setServiceInstanceName(sv.getServiceInstanceName());
                    su.setServiceName(sv.getServiceName());
                    serviceInstanceUsageMap.put(sv.getServiceInstanceGuid(), su);

                });
            }

        });

        siUsage.setServiceInstanceUsage(serviceInstanceUsageMap);
        siUsage.setSiSpaceUsage(siSpaceUsageMap);
        return siUsage;
    }

    /**
     *
     * @param foundation
     * @param orgGuid
     * @param start -- date in format of yyyy-MM-dd
     * @param end -- date in format of yyyy-MM-dd
     * @return
     */

    private ResponseEntity<String> callAppUsageApi(String foundation, String orgGuid, String start, String end) {

        String uri = String.format("%s/organizations/%s/app_usages?start=%s&end=%s",
                config.getAppUsageBaseUrl(foundation), orgGuid, start, end);
        LOG.info(uri);

        RestTemplate restTemplate = new RestTemplate();

        // Sets Authorization token as header needed for CF API calls
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", config.getFoundationToken(foundation));

        HttpEntity<String> entity = new HttpEntity<String>("parameters", headers);
        ResponseEntity<String> result = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);

        return result;
    }

    /**
     *
     * @param foundation
     * @param orgGuid
     * @param start -- date in format of yyyy-MM-dd
     * @param end -- date in format of yyyy-MM-dd
     * @return
     */

    private ResponseEntity<String> callSvcUsageApi(String foundation, String orgGuid, String start, String end) {

        String uri = String.format("%s/organizations/%s/service_usages?start=%s&end=%s",
                config.getAppUsageBaseUrl(foundation), orgGuid, start, end);
        LOG.info(uri);

        RestTemplate restTemplate = new RestTemplate();

        // Sets Authorization token as header needed for CF API calls
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", config.getFoundationToken(foundation));

        HttpEntity<String> entity = new HttpEntity<String>("parameters", headers);
        ResponseEntity<String> result = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);

        return result;
    }

}
