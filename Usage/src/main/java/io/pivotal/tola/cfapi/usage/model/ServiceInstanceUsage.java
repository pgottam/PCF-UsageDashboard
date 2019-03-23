package io.pivotal.tola.cfapi.usage.model;

import lombok.Builder;
import lombok.Data;

import java.text.DecimalFormat;

@Data
@Builder
public class ServiceInstanceUsage {

    private String spaceName;
    private String serviceName;
    private String serviceInstanceName;
    private double durationInSecs;
    private String avgSICount;

    public String getAvgSICount(){

        DecimalFormat df = new DecimalFormat("#.###");
        return df.format(this.getDurationInSecs());

    }
}
