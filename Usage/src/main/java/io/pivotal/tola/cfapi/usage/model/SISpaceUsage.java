package io.pivotal.tola.cfapi.usage.model;

import lombok.Builder;
import lombok.Data;

import java.text.DecimalFormat;

@Data
@Builder
public class SISpaceUsage {

    private String spaceGuid;
    private String spaceName;

    private long totalSvcs;
    private long totalSis;
    private double siDurationInSecs;
    private String avgSICount;

    public String getAvgSICount(){

        DecimalFormat df = new DecimalFormat("#.###");
        return df.format(this.getSiDurationInSecs());

    }

}
