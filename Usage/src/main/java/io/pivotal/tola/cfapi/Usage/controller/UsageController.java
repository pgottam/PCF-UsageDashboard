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
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import io.pivotal.tola.cfapi.Usage.configuration.FoundationsConfig;
import reactor.core.publisher.Mono;

import lombok.Builder;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class UsageController {


    private static final Logger LOG = LoggerFactory.getLogger(UsageController.class);

    private final String[] START_DATES = new String[] { "01-01", "04-01", "07-01", "10-01" };
    private final String[] END_DATES = new String[] { "03-31", "06-30", "09-30", "12-31" };

    @Autowired
    private FoundationsConfig config;

    /**
     * getFoundations - List all fundations available in an customer environment
     */
    @GetMapping(value = "/foundations")
    public List<String> getFoundations(){
        return config.getFoundationNames();
    }


    /**
     * getOrgs - list all organizations for the foundation
     */
    @GetMapping(value = "/orgs")
    public List<Organization> getOrgs(String foundation) {
        CloudFoundryOperations operations = config.getOperations(foundation);

        Mono<List<Organization>> orgs = operations.organizations().list().map(organizationSummary -> Organization
                .builder().guid(organizationSummary.getId()).name(organizationSummary.getName()).build()).collectList();

        return orgs.block();

    }

    /**
     * appUsage - One quarter usage for one organization
     */
    @GetMapping(value = "/org/{orgGuid}/appusage/{quarter}")
    public OrgUsage appUsage(String foundation, @PathVariable String orgGuid, @PathVariable int quarter) {

        int year = Calendar.getInstance().get(Calendar.YEAR);

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
        spaceMap.forEach((k,v)->{

            if(v != null && v.size() > 0) {
                final SpaceUsage su = SpaceUsage.builder().build();
                su.setSpaceGuid(k);
                su.setSpaceName(v.get(0).getSpaceName());
                su.setTotalApps(UsageUtils.getUniqueApps(v).size());
                su.setTotalAis(v.size());
                su.setTotalMbPerAis(UsageUtils.computeTotalMbPerAis(v));
                su.setAiDurationInSecs(UsageUtils.computeTotalDurationInSecs(v));


                Map<String, List<AppUsage_>> appMap = v.stream().collect(Collectors.groupingBy(AppUsage_::getAppGuid));
                Map<String, AUsage> aUsageMap = new HashMap<>();
                appMap.forEach((ak, av) -> {

                    if(av != null && av.size() > 0) {
                        final AUsage a = AUsage.builder().build();
                        a.setAppGuid(av.get(0).getAppGuid());
                        a.setAppName(av.get(0).getAppName());
                        a.setTotalAis(av.size());
                        a.setTotalMbPerAis(UsageUtils.computeTotalMbPerAis(av));
                        a.setAiDurationInSecs(UsageUtils.computeTotalDurationInSecs(av));
                        aUsageMap.put(ak, a);
                    }
                });
                su.setAUsage(aUsageMap);
                spaceUsageMap.put(k, su);
            }
        });

        orgUsage.setSpaceUsage(spaceUsageMap);
        return orgUsage;
    }

    /**
     * svcUsage - One quarter usage for one organization
     */
    @GetMapping(value = "/org/{orgGuid}/svcusage/{quarter}")
    public SIUsage svcUsage(String foundation, @PathVariable String orgGuid, @PathVariable int quarter) {

        int year = Calendar.getInstance().get(Calendar.YEAR);

        String result = callSvcUsageApi(foundation, orgGuid, year, quarter).getBody();

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
        Map<String, List<ServiceUsage_>> siSpaceMap = serviceUsage.getServiceUsages().stream().collect(Collectors.groupingBy(ServiceUsage_::getSpaceGuid));
        Map<String, SISpaceUsage> siSpaceUsageMap = new HashMap<>();
        siSpaceMap.forEach((k,v)->{

            if(v != null && v.size() > 0) {
                final SISpaceUsage su = SISpaceUsage.builder().build();
                su.setSpaceGuid(k);
                su.setSpaceName(v.get(0).getSpaceName());
                su.setTotalSis(v.size());
                su.setTotalSvcs(UsageUtils.getUniqueServices(v).size());
                su.setSiDurationInSecs(UsageUtils.computeTotalSIDurationInSecs(v));
                siSpaceUsageMap.put(k, su);
            }

        });
        siUsage.setSiSpaceUsage(siSpaceUsageMap);
        return siUsage;
    }


    /**
     * appUsage - AppUsage by org and by quarter for the requested foundation
     */
    @GetMapping(value = "/appusage")
    public FoundationUsage appUsage(String foundation) {

        FoundationUsage foundationUsage = FoundationUsage.builder().name(foundation).build();
        List<Organization> orgs = getOrgs(foundation);
        for(Organization org: orgs) {
            OrgUsage[] usage = appUsage(foundation, org.getGuid());
            foundationUsage.addOrgYearlyUsage(org, usage);
        }
        return foundationUsage;

    }


    //////////////////////////////////////////////////////////////////////
    // Helper methods
    //////////////////////////////////////////////////////////////////////

    private OrgUsage[] appUsage(String foundation, @PathVariable String orgGuid) {
        OrgUsage[] orgUsages = new OrgUsage[4];
        for(int i=0; i < orgUsages.length; i++) {
            orgUsages[i] = appUsage(foundation, orgGuid, i+1);
        }
        return orgUsages;

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
