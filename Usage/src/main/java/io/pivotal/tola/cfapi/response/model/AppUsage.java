
package io.pivotal.tola.cfapi.response.model;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "organization_guid",
    "period_start",
    "period_end",
    "app_usages"
})
public class AppUsage {

    @JsonProperty("organization_guid")
    private String organizationGuid;
    @JsonProperty("period_start")
    private String periodStart;
    @JsonProperty("period_end")
    private String periodEnd;
    @JsonProperty("app_usages")
    private List<AppUsage_> appUsages = null;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("organization_guid")
    public String getOrganizationGuid() {
        return organizationGuid;
    }

    @JsonProperty("organization_guid")
    public void setOrganizationGuid(String organizationGuid) {
        this.organizationGuid = organizationGuid;
    }

    public AppUsage withOrganizationGuid(String organizationGuid) {
        this.organizationGuid = organizationGuid;
        return this;
    }

    @JsonProperty("period_start")
    public String getPeriodStart() {
        return periodStart;
    }

    @JsonProperty("period_start")
    public void setPeriodStart(String periodStart) {
        this.periodStart = periodStart;
    }

    public AppUsage withPeriodStart(String periodStart) {
        this.periodStart = periodStart;
        return this;
    }

    @JsonProperty("period_end")
    public String getPeriodEnd() {
        return periodEnd;
    }

    @JsonProperty("period_end")
    public void setPeriodEnd(String periodEnd) {
        this.periodEnd = periodEnd;
    }

    public AppUsage withPeriodEnd(String periodEnd) {
        this.periodEnd = periodEnd;
        return this;
    }

    @JsonProperty("app_usages")
    public List<AppUsage_> getAppUsages() {
        return appUsages;
    }

    @JsonProperty("app_usages")
    public void setAppUsages(List<AppUsage_> appUsages) {
        this.appUsages = appUsages;
    }

    public AppUsage withAppUsages(List<AppUsage_> appUsages) {
        this.appUsages = appUsages;
        return this;
    }

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    @JsonAnySetter
    public void setAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
    }

    public AppUsage withAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
        return this;
    }

}
