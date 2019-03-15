package io.pivotal.tola.cfapi.Usage.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SISpaceUsage {

    private String spaceGuid;
    private String spaceName;

    private long totalSvcs;
    private long totalSis;
    private double siDurationInSecs;

}
