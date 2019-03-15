package io.pivotal.tola.cfapi.Usage.model;

import lombok.Builder;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
@Builder
public class SpaceUsage {

    private String spaceGuid;
    private String spaceName;

    private long totalApps;
    private long totalAis;
    private long totalMbPerAis;
    private long aiDurationInSecs;

    @Builder.Default
    private Map<String, AUsage> aUsage = new HashMap<>();

}
