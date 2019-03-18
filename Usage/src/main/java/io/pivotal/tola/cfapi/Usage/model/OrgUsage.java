package io.pivotal.tola.cfapi.Usage.model;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.Builder; 
import lombok.Data;
import lombok.Getter;


@Data
@Builder
public class OrgUsage {

    private String orgGuid;
    private int year;
    private int quarter;

    private long totalApps;
    private long totalAis;
    private long totalMbPerAis;
    private double aiDurationInSecs;

    @Builder.Default
    private Map<String, SpaceUsage> spaceUsage = new HashMap<>();

    @Builder.Default
    private Map<String, AUsage> aUsage = new HashMap<>();

    public long getTotalApps(){

        long count = 0L;
        if(spaceUsage != null && spaceUsage.size() > 0){
            count = spaceUsage.values().stream().map(o-> o.getTotalApps()).mapToLong(Long::longValue).sum();
        }
        return count;
    }

    public long getTotalAis(){

        long count = 0L;
        if(spaceUsage != null && spaceUsage.size() > 0){
            count = spaceUsage.values().stream().map(o-> o.getTotalAis()).mapToLong(Long::longValue).sum();
        }
        return count;
    }

    public long getTotalMbPerAis(){

        long count = 0L;
        if(spaceUsage != null && spaceUsage.size() > 0){
            count = spaceUsage.values().stream().map(o-> o.getTotalMbPerAis()).mapToLong(Long::longValue).sum();
        }
        return count;
    }

    public double getAiDurationInSecs(){

        double count = 0L;
        if(spaceUsage != null && spaceUsage.size() > 0){
            count = spaceUsage.values().stream().map(o-> o.getAiDurationInSecs()).mapToDouble(Double::doubleValue).sum();
        }
        return count;
    }


}