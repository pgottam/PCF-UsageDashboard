
package io.pivotal.tola.cfapi.response.model;

import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.ToString;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "space_guid",
    "space_name",
    "app_name",
    "app_guid",
    "instance_count",
    "memory_in_mb_per_instance",
    "duration_in_seconds"
})
@ToString
public class AppUsage_ {

    @JsonProperty("space_guid")
    private String spaceGuid;
    @JsonProperty("space_name")
    private String spaceName;
    @JsonProperty("app_name")
    private String appName;
    @JsonProperty("app_guid")
    private String appGuid;
    @JsonProperty("instance_count")
    private Integer instanceCount;
    @JsonProperty("memory_in_mb_per_instance")
    private Integer memoryInMbPerInstance;
    @JsonProperty("duration_in_seconds")
    private Integer durationInSeconds;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("space_guid")
    public String getSpaceGuid() {
        return spaceGuid;
    }

    @JsonProperty("space_guid")
    public void setSpaceGuid(String spaceGuid) {
        this.spaceGuid = spaceGuid;
    }

    public AppUsage_ withSpaceGuid(String spaceGuid) {
        this.spaceGuid = spaceGuid;
        return this;
    }

    @JsonProperty("space_name")
    public String getSpaceName() {
        return spaceName;
    }

    @JsonProperty("space_name")
    public void setSpaceName(String spaceName) {
        this.spaceName = spaceName;
    }

    public AppUsage_ withSpaceName(String spaceName) {
        this.spaceName = spaceName;
        return this;
    }

    @JsonProperty("app_name")
    public String getAppName() {
        return appName;
    }

    @JsonProperty("app_name")
    public void setAppName(String appName) {
        this.appName = appName;
    }

    public AppUsage_ withAppName(String appName) {
        this.appName = appName;
        return this;
    }

    @JsonProperty("app_guid")
    public String getAppGuid() {
        return appGuid;
    }

    @JsonProperty("app_guid")
    public void setAppGuid(String appGuid) {
        this.appGuid = appGuid;
    }

    public AppUsage_ withAppGuid(String appGuid) {
        this.appGuid = appGuid;
        return this;
    }

    @JsonProperty("instance_count")
    public Integer getInstanceCount() {
        return instanceCount;
    }

    @JsonProperty("instance_count")
    public void setInstanceCount(Integer instanceCount) {
        this.instanceCount = instanceCount;
    }

    public AppUsage_ withInstanceCount(Integer instanceCount) {
        this.instanceCount = instanceCount;
        return this;
    }

    @JsonProperty("memory_in_mb_per_instance")
    public Integer getMemoryInMbPerInstance() {
        return memoryInMbPerInstance;
    }

    @JsonProperty("memory_in_mb_per_instance")
    public void setMemoryInMbPerInstance(Integer memoryInMbPerInstance) {
        this.memoryInMbPerInstance = memoryInMbPerInstance;
    }

    public AppUsage_ withMemoryInMbPerInstance(Integer memoryInMbPerInstance) {
        this.memoryInMbPerInstance = memoryInMbPerInstance;
        return this;
    }

    @JsonProperty("duration_in_seconds")
    public Integer getDurationInSeconds() {
        return durationInSeconds;
    }

    @JsonProperty("duration_in_seconds")
    public void setDurationInSeconds(Integer durationInSeconds) {
        this.durationInSeconds = durationInSeconds;
    }

    public AppUsage_ withDurationInSeconds(Integer durationInSeconds) {
        this.durationInSeconds = durationInSeconds;
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

    public AppUsage_ withAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
        return this;
    }

}
