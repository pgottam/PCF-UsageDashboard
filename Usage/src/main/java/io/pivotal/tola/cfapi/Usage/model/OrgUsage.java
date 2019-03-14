package io.pivotal.tola.cfapi.Usage.model;

import lombok.Builder; 
import lombok.Data;

@Data
@Builder
public class OrgUsage {

    private String orgGuid;
    private int year;
    private int quarter;

    private int totalApps;
    private int totalAis;
    private int totalMbPerAis;
    private long aiDurationInSecs;

    public void addAiCount(int c) {
        totalAis += c;
    }

    public void addMb(int c) {
        totalMbPerAis += c;
    }

    public void addlDurationInSecs(long c) {
        aiDurationInSecs += c;
        // System.out.println("aiDurationInSecs: " + aiDurationInSecs);
    }
    

}