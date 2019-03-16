package io.pivotal.tola.cfapi.Usage.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ServiceInstanceUsage {

    private String spaceName;
    private String serviceName;
    private String serviceInstanceName;
    private double durationInSecs;
}
