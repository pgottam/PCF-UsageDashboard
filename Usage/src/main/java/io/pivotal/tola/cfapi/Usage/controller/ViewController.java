package io.pivotal.tola.cfapi.Usage.controller;

import io.pivotal.tola.cfapi.Usage.configuration.FoundationsConfig;
import io.pivotal.tola.cfapi.Usage.model.OrgUsage;
import io.pivotal.tola.cfapi.Usage.model.Organization;
import io.pivotal.tola.cfapi.Usage.model.SIUsage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
@CrossOrigin(origins = "*")
@RequestMapping("/view")
public class ViewController {

    @Autowired
    private FoundationsConfig config;

    @Autowired
    private UsageService usageService;

    private static final Logger LOG = LoggerFactory.getLogger(ViewController.class);


    @GetMapping("/foundations")
    public String foundations(Model model){

        final Map<String, String> foundationOrgMap = new ConcurrentHashMap<>();
        config.getFoundations().stream().forEach(f -> {
            foundationOrgMap.put(f.getName(), f.getName());
        });
        model.addAttribute("foundations", foundationOrgMap);

        return "foundation";
    }


    @GetMapping("/appusage")
    public String foundationAppUsage(String foundation, Model model){

        final Map<String, List<Organization>> foundationOrgMap = new LinkedHashMap<>();
        foundationOrgMap.put(foundation, usageService.getOrgs(foundation));
        model.addAttribute("foundations", foundationOrgMap);

        List<String> quarters = new DateUtils().getQuartersInCurrentYear();
        model.addAttribute("quarters", quarters);

        Map<String, Map<String, OrgUsage>> quarterlyOrgUsageMap = new LinkedHashMap<>();

        foundationOrgMap.values().forEach(v -> {
            if(v != null && v.size() > 0){
                v.stream().forEach(vi -> {
                    LOG.info("Org GUID : " + vi.getGuid());
                    LOG.info("Org Name : " + vi.getName());

                    Map<String, OrgUsage> quarterlyOrgUsage = new LinkedHashMap<>();
                    quarters.stream().forEach(qu -> {

                        String[] d = qu.split("-Q");
                        int year = Integer.parseInt(d[0]);
                        int quarter = Integer.parseInt(d[1]);

                        quarterlyOrgUsage.put(qu, usageService.appUsage(foundation, vi.getGuid(), year, quarter));
                    });

                    quarterlyOrgUsageMap.put(vi.getName(), quarterlyOrgUsage);

                });
            }
        });
        model.addAttribute("quarterlyOrgUsageMap", quarterlyOrgUsageMap);

        return "foundationorgapp";
    }

    @GetMapping("/svcusage")
    public String foundationSvcUsage(String foundation, Model model){

        final Map<String, List<Organization>> foundationOrgMap = new LinkedHashMap<>();
        foundationOrgMap.put(foundation, usageService.getOrgs(foundation));
        model.addAttribute("foundations", foundationOrgMap);

        List<String> quarters = new DateUtils().getQuartersInCurrentYear();
        model.addAttribute("quarters", quarters);

        Map<String, Map<String, SIUsage>> quarterlyOrgUsageMap = new LinkedHashMap<>();

        foundationOrgMap.values().forEach(v -> {
            if(v != null && v.size() > 0){
                v.stream().forEach(vi -> {
                    LOG.info("Org GUID : " + vi.getGuid());
                    LOG.info("Org Name : " + vi.getName());

                    Map<String, SIUsage> quarterlyOrgUsage = new LinkedHashMap<>();
                    quarters.stream().forEach(qu -> {

                        String[] d = qu.split("-Q");
                        int year = Integer.parseInt(d[0]);
                        int quarter = Integer.parseInt(d[1]);

                        quarterlyOrgUsage.put(qu, usageService.svcUsage(foundation, vi.getGuid(), year, quarter));
                    });

                    quarterlyOrgUsageMap.put(vi.getName(), quarterlyOrgUsage);

                });
            }
        });
        model.addAttribute("quarterlyOrgUsageMap", quarterlyOrgUsageMap);


        return "foundationorgsvc";
    }

    @GetMapping("/appusage/{orgGuid}/{yearQuarter}")
    public String orgAppUsage(String foundation, String orgName, @PathVariable String orgGuid, @PathVariable String yearQuarter, Model model){

        model.addAttribute("orgName", orgName);
        model.addAttribute("foundation", foundation);

        String[] d = yearQuarter.split("-Q");
        int year = Integer.parseInt(d[0]);
        int quarter = Integer.parseInt(d[1]);

        model.addAttribute("orgAppUsage", usageService.appUsage(foundation,orgGuid, year, quarter));
        model.addAttribute("yearQuarter", yearQuarter);

        return "orgappusage";
    }

    @GetMapping("/svcusage/{orgGuid}/{yearQuarter}")
    public String orgSvcUsage(String foundation, String orgName, @PathVariable String orgGuid, @PathVariable String yearQuarter, Model model){

        model.addAttribute("orgName", orgName);
        model.addAttribute("foundation", foundation);

        String[] d = yearQuarter.split("-Q");
        int year = Integer.parseInt(d[0]);
        int quarter = Integer.parseInt(d[1]);

        model.addAttribute("orgSvcUsage", usageService.svcUsage(foundation,orgGuid, year, quarter));
        model.addAttribute("yearQuarter", yearQuarter);

        return "orgsvcusage";
    }

}
