package io.pivotal.tola.cfapi.Usage.controller;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.pivotal.tola.cfapi.Usage.model.*;
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

import io.pivotal.tola.cfapi.Usage.configuration.FoundationsConfig;
import reactor.core.publisher.Mono;

import lombok.Builder;

@Component
public class UsageService {


    private static final Logger LOG = LoggerFactory.getLogger(UsageService.class);

    private final String[] START_DATES = new String[] { "01-01", "04-01", "07-01", "10-01" };
    private final String[] END_DATES = new String[] { "03-31", "06-30", "09-30", "12-31" };
    private final int[] NO_OF_DAYS_NON_LEAP_YEAR = new int[] {90, 91, 92, 92};
    private final int[] NO_OF_DAYS_LEAP_YEAR = new int[] {91, 91, 92, 92};


    @Autowired
    private FoundationsConfig config;

    public List<Organization> getOrgs(String foundation) {
        CloudFoundryOperations operations = config.getOperations(foundation);

        Mono<List<Organization>> orgs = operations.organizations().list().filter(organizationSummary -> !config.getExcludedOrgs().contains(organizationSummary.getName()))
                .map(organizationSummary -> Organization.builder().guid(organizationSummary.getId()).name(organizationSummary.getName()).build()).collectList();


        return orgs.block();

    }

    public OrgUsage appUsage(String foundation, String orgGuid, int year, int quarter) {

        String result = callAppUsageApi(foundation, orgGuid, year, quarter).getBody();

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

                if(year % 4 == 0){
                    su.setAiDurationInSecs(UsageUtils.computeTotalDurationInSecs(v, NO_OF_DAYS_LEAP_YEAR[quarter-1]));
                }else{
                    su.setAiDurationInSecs(UsageUtils.computeTotalDurationInSecs(v, NO_OF_DAYS_NON_LEAP_YEAR[quarter-1]));
                }

                Map<String, List<AppUsage_>> appMap = v.stream().collect(Collectors.groupingBy(AppUsage_::getAppGuid));
                appMap.forEach((ak, av) -> {

                    if(av != null && av.size() > 0) {
                        final AUsage a = AUsage.builder().build();
                        a.setSpaceGuid(su.getSpaceGuid());
                        a.setSpaceName(su.getSpaceName());
                        a.setAppGuid(av.get(0).getAppGuid());
                        a.setAppName(av.get(0).getAppName());
                        a.setTotalAis(av.size());
                        a.setTotalMbPerAis(UsageUtils.computeTotalMbPerAis(av));
                        if(year % 4 == 0) {
                            a.setAiDurationInSecs(UsageUtils.computeTotalDurationInSecs(av, NO_OF_DAYS_LEAP_YEAR[quarter-1]));
                        }else{
                            a.setAiDurationInSecs(UsageUtils.computeTotalDurationInSecs(av, NO_OF_DAYS_NON_LEAP_YEAR[quarter-1]));
                        }
                        aUsageMap.put(ak, a);
                    }
                });
                spaceUsageMap.put(k, su);
            }
        });
        orgUsage.setAUsage(aUsageMap);
        orgUsage.setSpaceUsage(spaceUsageMap);
        return orgUsage;
    }


    public SIUsage svcUsage(String foundation, String orgGuid, int year, int quarter) {

        String result = callSvcUsageApi(foundation, orgGuid, year, quarter).getBody();
        LOG.info(result);

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
        Map<String, List<ServiceUsage_>> siSpaceMap = serviceUsage.getServiceUsages().stream().filter(su -> !config.getExcludedServices().contains(su.getServiceName()))
                .collect(Collectors.groupingBy(ServiceUsage_::getSpaceGuid));
        Map<String, SISpaceUsage> siSpaceUsageMap = new HashMap<>();
        Map<String, ServiceInstanceUsage> serviceInstanceUsageMap = new HashMap<>();

        siSpaceMap.forEach((k,v)->{

            if(v != null && v.size() > 0) {
                final SISpaceUsage su = SISpaceUsage.builder().build();
                su.setSpaceGuid(k);
                su.setSpaceName(v.get(0).getSpaceName());
                su.setTotalSis(v.size());
                su.setTotalSvcs(UsageUtils.getUniqueServices(v).size());
                if(year % 4 ==0) {
                    su.setSiDurationInSecs(UsageUtils.computeTotalSIDurationInSecs(v, NO_OF_DAYS_LEAP_YEAR[quarter-1]));
                }else{
                    su.setSiDurationInSecs(UsageUtils.computeTotalSIDurationInSecs(v, NO_OF_DAYS_NON_LEAP_YEAR[quarter-1]));
                }
                siSpaceUsageMap.put(k, su);
            }

        });

        siSpaceMap.forEach((k,v) -> {

            if(v != null && v.size() > 0) {

                v.stream().forEach((sv) -> {

                    final ServiceInstanceUsage su = ServiceInstanceUsage.builder().build();
                    su.setSpaceName(sv.getSpaceName());
                    if(year % 4 ==0) {
                        su.setDurationInSecs(sv.getDurationInSeconds() / (86400*NO_OF_DAYS_LEAP_YEAR[quarter-1]));
                    }else{
                        su.setDurationInSecs(sv.getDurationInSeconds() / (86400*NO_OF_DAYS_NON_LEAP_YEAR[quarter-1]));
                    }
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



    private ResponseEntity<String> callAppUsageApi(String foundation, String orgGuid, int year, int quarter) {

        int qi = quarter - 1;

        String uri = String.format("%s/organizations/%s/app_usages?start=%d-%s&end=%d-%s",
                config.getAppUsageBaseUrl(foundation), orgGuid, year, START_DATES[qi], year, END_DATES[qi]);
        LOG.info(uri);

        RestTemplate restTemplate = new RestTemplate();

        // Sets Authorization token as header needed for CF API calls
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", config.getFoundationToken(foundation));

        HttpEntity<String> entity = new HttpEntity<String>("parameters", headers);
        ResponseEntity<String> result = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);

        return result;
    }

    private ResponseEntity<String> callSvcUsageApi(String foundation, String orgGuid, int year, int quarter) {

        int qi = quarter - 1;

        String uri = String.format("%s/organizations/%s/service_usages?start=%d-%s&end=%d-%s",
                config.getAppUsageBaseUrl(foundation), orgGuid, year, START_DATES[qi], year, END_DATES[qi]);
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
