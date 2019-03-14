package io.pivotal.tola.cfapi.Usage.model;

import lombok.Builder; 
import lombok.Data;

@Data
@Builder
public class SIUsage {

    private String orgGuid;
    private int year;
    private int quarter;

    private int totalSvcs;
    private int totalSis;
    private int totalMbPerSis;
    private long siDurationInSecs;

    // not needed for SI calculations    
    /*public void addSiCount(int c) {
        totalSis += c;
    }*/

    // not needed for SI calculation
    /*public void addMb(int c) {
        totalMbPerSis += c;
    }*/

    public void addlDurationInSecs(long c) {
        siDurationInSecs += c;
    }

}