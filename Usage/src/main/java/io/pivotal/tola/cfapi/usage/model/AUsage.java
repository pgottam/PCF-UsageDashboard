package io.pivotal.tola.cfapi.usage.model;

import lombok.Builder;
import lombok.Data;

import java.text.DecimalFormat;

@Data
@Builder
public class AUsage {

    private String appGuid;
    private String appName;
    private String spaceGuid;
    private String spaceName;

    private long totalAis;
    private long totalMbPerAis;
    private double aiDurationInSecs;
    private String avgAICount;

    public String getAvgAICount(){

        DecimalFormat df = new DecimalFormat("#.###");
        return df.format(this.getAiDurationInSecs());

    }

}