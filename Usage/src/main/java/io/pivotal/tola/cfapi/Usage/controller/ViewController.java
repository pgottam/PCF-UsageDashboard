package io.pivotal.tola.cfapi.Usage.controller;

import io.pivotal.tola.cfapi.Usage.configuration.FoundationsConfig;
import io.pivotal.tola.cfapi.Usage.model.Organization;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.HashMap;
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
    private UsageController usageController;

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

        final Map<String, List<Organization>> foundationOrgMap = new HashMap<>();
        foundationOrgMap.put(foundation, usageController.getOrgs(foundation));
        model.addAttribute("usageType", "appusage");
        model.addAttribute("foundations", foundationOrgMap);

        return "foundationorgs";
    }

    @GetMapping("/svcusage")
    public String foundationSvcUsage(String foundation, Model model){

        final Map<String, List<Organization>> foundationOrgMap = new HashMap<>();
        foundationOrgMap.put(foundation, usageController.getOrgs(foundation));
        model.addAttribute("usageType", "svcusage");
        model.addAttribute("foundations", foundationOrgMap);

        return "foundationorgs";
    }

    @GetMapping("/appusage/{orgGuid}/{quarter}")
    public String orgAppUsage(String foundation, String orgName, @PathVariable String orgGuid, @PathVariable int quarter, Model model){

        model.addAttribute("orgName", orgName);
        model.addAttribute("foundation", foundation);
        model.addAttribute("orgAppUsage", usageController.appUsage(foundation,orgGuid,quarter));

        return "orgappusage";
    }

    @GetMapping("/svcusage/{orgGuid}/{quarter}")
    public String orgSvcUsage(String foundation, String orgName, @PathVariable String orgGuid, @PathVariable int quarter, Model model){

        model.addAttribute("orgName", orgName);
        model.addAttribute("foundation", foundation);
        model.addAttribute("orgSvcUsage", usageController.svcUsage(foundation,orgGuid,quarter));

        return "orgsvcusage";
    }

}
