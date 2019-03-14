package io.pivotal.tola.cfapi.Usage.controller;

import java.util.Calendar;
import java.util.List;

import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;

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
import io.pivotal.tola.cfapi.Usage.model.FoundationUsage;
import io.pivotal.tola.cfapi.Usage.model.OrgUsage;
import io.pivotal.tola.cfapi.Usage.model.Organization;
import io.pivotal.tola.cfapi.Usage.model.SIUsage;
import reactor.core.publisher.Mono;

import lombok.Builder;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class UsageController {

    private static final Logger LOG = LoggerFactory.getLogger(UsageController.class);

    private final String[] START_DATES = new String[] { "01-01", "04-01", "07-01", "10-01" };
    private final String[] END_DATES = new String[] { "03-01", "06-01", "09-01", "12-01" };

    @Autowired
    private FoundationsConfig config;

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

        DocumentContext jsonContext = JsonPath.parse(result);

        // MMB: I could not get the functions to work, like sum(). Notice I used length below
        // List<Integer> instanceCount = jsonContext.read("$.app_usages[*].instance_count");
        // List<Integer> memInMbPerInstance = jsonContext.read("$.app_usages[*].memory_in_mb_per_instance");
        // LOG.info("Total instanceCount {}, memInMbPerInstance {}", instanceCount, memInMbPerInstance);

        int totalApps = jsonContext.read("$.app_usages.length()");
        LOG.info("Total Apps {}", totalApps);

        OrgUsage orgUsage = OrgUsage.builder().orgGuid(orgGuid).year(year).quarter(quarter).totalApps(totalApps).build();
        for (int i = 0; i < totalApps; i++) {
            orgUsage.addAiCount(jsonContext.read("$.app_usages[" + i + "].instance_count"));
            orgUsage.addMb(jsonContext.read("$.app_usages[" + i + "].memory_in_mb_per_instance"));
            orgUsage.addlDurationInSecs(jsonContext.read("$.app_usages[" + i + "].duration_in_seconds", Long.class));
        }

        return orgUsage;
    }

    /**
     * svcUsage - One quarter usage for one organization
     */
    @GetMapping(value = "/org/{orgGuid}/svcusage/{quarter}")
    public SIUsage svcUsage(String foundation, @PathVariable String orgGuid, @PathVariable int quarter) {

        int year = Calendar.getInstance().get(Calendar.YEAR);

        String result = callSvcUsageApi(foundation, orgGuid, year, quarter).getBody();

        DocumentContext jsonContext = JsonPath.parse(result);

        // MMB: I could not get the functions to work, like sum(). Notice I used length below
        // List<Integer> instanceCount = jsonContext.read("$.app_usages[*].instance_count");
        // List<Integer> memInMbPerInstance = jsonContext.read("$.app_usages[*].memory_in_mb_per_instance");
        // LOG.info("Total instanceCount {}, memInMbPerInstance {}", instanceCount, memInMbPerInstance);

        int totalSvcs = jsonContext.read("$.service_usages.length()");
        LOG.info("Total Svcs {}", totalSvcs);

        SIUsage siUsage = SIUsage.builder().orgGuid(orgGuid).year(year).quarter(quarter).totalSvcs(totalSvcs).build();
        for (int i = 0; i < totalSvcs; i++) {
            // siUsage.addSiCount(jsonContext.read("$.service_usages[" + i + "].instance_count"));  NO instance_count exists for service_usages JSON
            // siUsage.addMb(jsonContext.read("$.service_usages[" + i + "].memory_in_mb_per_instance"));
            siUsage.addlDurationInSecs(jsonContext.read("$.service_usages[" + i + "].duration_in_seconds", Long.class));
        }

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

/*
{"organization_guid":"ca878858-3271-47bf-9e4b-8f223bfaa3f5",
"period_start":"2019-01-01T00:00:00Z",
"period_end":"2019-03-01T23:59:59Z",
"app_usages":[
    {"space_guid":"e613cbf5-0dab-4b1a-bd8c-795670fec5f3",
                "space_name":"test",
                "app_name":"simple-php",
                "app_guid":"3fe77bb8-b23e-4865-b1b5-e98921697f05",
                "instance_count":1,"memory_in_mb_per_instance":128,"duration_in_seconds":5184000},
              {"space_guid":"e613cbf5-0dab-4b1a-bd8c-795670fec5f3",
                "space_name":"test",
                "app_name":"laravel",
                "app_guid":"51cf500c-80dd-400a-b635-a6b83c389859",
                "instance_count":2,
                "memory_in_mb_per_instance":128,
                "duration_in_seconds":5184000},
              {"space_guid":"e613cbf5-0dab-4b1a-bd8c-795670fec5f3",
                "space_name":"test",
                "app_name":"cf-ex-phpmyadmin",
                "app_guid":"90e321e8-a5b7-41c5-98db-caa24644cd11",
                "instance_count":1,
                "memory_in_mb_per_instance":128,
                "duration_in_seconds":5184000}
                ]
            }
*/
