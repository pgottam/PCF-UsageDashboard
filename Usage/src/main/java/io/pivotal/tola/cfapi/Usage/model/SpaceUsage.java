package io.pivotal.tola.cfapi.Usage.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SpaceUsage {

    private String spaceGuid;
    private String spaceName;

    private long totalApps;
    private long totalAis;
    private long totalMbPerAis;
    private long aiDurationInSecs;

}
