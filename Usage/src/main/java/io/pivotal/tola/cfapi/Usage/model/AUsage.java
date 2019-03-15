package io.pivotal.tola.cfapi.Usage.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AUsage {

    private String appGuid;
    private String appName;
    private String spaceGuid;
    private String spaceName;

    private long totalAis;
    private long totalMbPerAis;
    private long aiDurationInSecs;

}
