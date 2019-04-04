package io.pivotal.tola.cfapi.usage.model;

import lombok.Builder;
import lombok.Data;

import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.Map;


@Data
@Builder
public class OrgUsage {

    private String orgGuid;
    private int year;
    private int quarter;

    private long totalApps;
    private double totalMbPerAis;
    private String totalGbPerAis;
    private double aiDurationInSecs;
    private String avgAICount;

    @Builder.Default
    private Map<String, SpaceUsage> spaceUsage = new HashMap<>();

    @Builder.Default
    private Map<String, AUsage> aUsage = new HashMap<>();

    public long getTotalApps() {

        long count = 0L;
        if (spaceUsage != null && spaceUsage.size() > 0) {
            count = spaceUsage.values().stream().map(o -> o.getTotalApps()).mapToLong(Long::longValue).sum();
        }
        return count;
    }

    public double getTotalMbPerAis() {

        double count = 0.0;
        if (spaceUsage != null && spaceUsage.size() > 0) {
            count = spaceUsage.values().stream().map(o -> o.getTotalMbPerAis()).mapToDouble(Double::doubleValue).sum();
        }
        return count;
    }

    public double getAiDurationInSecs() {

        double count = 0L;
        if (spaceUsage != null && spaceUsage.size() > 0) {
            count = spaceUsage.values().stream().map(o -> o.getAiDurationInSecs()).mapToDouble(Double::doubleValue).sum();
        }
        return count;
    }

    public String getAvgAICount(){

        DecimalFormat df = new DecimalFormat("#.###");
        return df.format(this.getAiDurationInSecs());

    }

    public String getTotalGbPerAis(){

        DecimalFormat df = new DecimalFormat("#.###");
        return df.format( (double) this.getTotalMbPerAis() / 1024);

    }

}