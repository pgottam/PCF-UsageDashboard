package io.pivotal.tola.cfapi.usage.model;

import lombok.Builder;
import lombok.Data;

import java.text.DecimalFormat;

@Data
@Builder
public class SpaceUsage {

    private String spaceGuid;
    private String spaceName;

    private long totalApps;
    private double totalMbPerAis = 0.0;
    private String totalGbPerAis;
    private double aiDurationInSecs;
    private String avgAICount;

    public String getAvgAICount(){

        DecimalFormat df = new DecimalFormat("#.###");
        return df.format(this.getAiDurationInSecs());

    }

    public String getTotalGbPerAis(){

        DecimalFormat df = new DecimalFormat("#.###");
        return df.format( (double)this.getTotalMbPerAis() / 1024);

    }

    public void computeTotalMbPerAis(double memory, double avgAI){

        if(avgAI < 1.0){
            avgAI = 1.0;
        }
        this.totalMbPerAis = this.totalMbPerAis + (memory * avgAI);
    }

}
