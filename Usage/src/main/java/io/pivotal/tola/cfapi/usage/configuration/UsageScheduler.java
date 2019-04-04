package io.pivotal.tola.cfapi.usage.configuration;

import io.pivotal.tola.cfapi.usage.service.UsageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class UsageScheduler {

    @Autowired
    private UsageService usageService;

    @Scheduled(cron = "${usage.cronScheduleExpr:0 2 0 * * *}")
    public void scheduleAppUsage(){
        usageService.getAppUsageByFoundationOrg();
    }

    @Scheduled(cron = "${usage.cronScheduleExpr:0 2 0 * * *}")
    public void scheduleSIUsage(){
        usageService.getSIUsageByFoundationOrg();
    }
}
