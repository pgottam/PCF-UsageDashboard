
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
    "deleted",
    "duration_in_seconds",
    "space_guid",
    "space_name",
    "service_instance_guid",
    "service_instance_name",
    "service_instance_type",
    "service_plan_guid",
    "service_plan_name",
    "service_name",
    "service_guid",
    "service_instance_creation",
    "service_instance_deletion"
})
@ToString
public class ServiceUsage_ {

    @JsonProperty("deleted")
    private Boolean deleted;
    @JsonProperty("duration_in_seconds")
    private Double durationInSeconds;
    @JsonProperty("space_guid")
    private String spaceGuid;
    @JsonProperty("space_name")
    private String spaceName;
    @JsonProperty("service_instance_guid")
    private String serviceInstanceGuid;
    @JsonProperty("service_instance_name")
    private String serviceInstanceName;
    @JsonProperty("service_instance_type")
    private String serviceInstanceType;
    @JsonProperty("service_plan_guid")
    private String servicePlanGuid;
    @JsonProperty("service_plan_name")
    private String servicePlanName;
    @JsonProperty("service_name")
    private String serviceName;
    @JsonProperty("service_guid")
    private String serviceGuid;
    @JsonProperty("service_instance_creation")
    private String serviceInstanceCreation;
    @JsonProperty("service_instance_deletion")
    private String serviceInstanceDeletion;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("deleted")
    public Boolean getDeleted() {
        return deleted;
    }

    @JsonProperty("deleted")
    public void setDeleted(Boolean deleted) {
        this.deleted = deleted;
    }

    public ServiceUsage_ withDeleted(Boolean deleted) {
        this.deleted = deleted;
        return this;
    }

    @JsonProperty("duration_in_seconds")
    public Double getDurationInSeconds() {
        return durationInSeconds;
    }

    @JsonProperty("duration_in_seconds")
    public void setDurationInSeconds(Double durationInSeconds) {
        this.durationInSeconds = durationInSeconds;
    }

    public ServiceUsage_ withDurationInSeconds(Double durationInSeconds) {
        this.durationInSeconds = durationInSeconds;
        return this;
    }

    @JsonProperty("space_guid")
    public String getSpaceGuid() {
        return spaceGuid;
    }

    @JsonProperty("space_guid")
    public void setSpaceGuid(String spaceGuid) {
        this.spaceGuid = spaceGuid;
    }

    public ServiceUsage_ withSpaceGuid(String spaceGuid) {
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

    public ServiceUsage_ withSpaceName(String spaceName) {
        this.spaceName = spaceName;
        return this;
    }

    @JsonProperty("service_instance_guid")
    public String getServiceInstanceGuid() {
        return serviceInstanceGuid;
    }

    @JsonProperty("service_instance_guid")
    public void setServiceInstanceGuid(String serviceInstanceGuid) {
        this.serviceInstanceGuid = serviceInstanceGuid;
    }

    public ServiceUsage_ withServiceInstanceGuid(String serviceInstanceGuid) {
        this.serviceInstanceGuid = serviceInstanceGuid;
        return this;
    }

    @JsonProperty("service_instance_name")
    public String getServiceInstanceName() {
        return serviceInstanceName;
    }

    @JsonProperty("service_instance_name")
    public void setServiceInstanceName(String serviceInstanceName) {
        this.serviceInstanceName = serviceInstanceName;
    }

    public ServiceUsage_ withServiceInstanceName(String serviceInstanceName) {
        this.serviceInstanceName = serviceInstanceName;
        return this;
    }

    @JsonProperty("service_instance_type")
    public String getServiceInstanceType() {
        return serviceInstanceType;
    }

    @JsonProperty("service_instance_type")
    public void setServiceInstanceType(String serviceInstanceType) {
        this.serviceInstanceType = serviceInstanceType;
    }

    public ServiceUsage_ withServiceInstanceType(String serviceInstanceType) {
        this.serviceInstanceType = serviceInstanceType;
        return this;
    }

    @JsonProperty("service_plan_guid")
    public String getServicePlanGuid() {
        return servicePlanGuid;
    }

    @JsonProperty("service_plan_guid")
    public void setServicePlanGuid(String servicePlanGuid) {
        this.servicePlanGuid = servicePlanGuid;
    }

    public ServiceUsage_ withServicePlanGuid(String servicePlanGuid) {
        this.servicePlanGuid = servicePlanGuid;
        return this;
    }

    @JsonProperty("service_plan_name")
    public String getServicePlanName() {
        return servicePlanName;
    }

    @JsonProperty("service_plan_name")
    public void setServicePlanName(String servicePlanName) {
        this.servicePlanName = servicePlanName;
    }

    public ServiceUsage_ withServicePlanName(String servicePlanName) {
        this.servicePlanName = servicePlanName;
        return this;
    }

    @JsonProperty("service_name")
    public String getServiceName() {
        return serviceName;
    }

    @JsonProperty("service_name")
    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public ServiceUsage_ withServiceName(String serviceName) {
        this.serviceName = serviceName;
        return this;
    }

    @JsonProperty("service_guid")
    public String getServiceGuid() {
        return serviceGuid;
    }

    @JsonProperty("service_guid")
    public void setServiceGuid(String serviceGuid) {
        this.serviceGuid = serviceGuid;
    }

    public ServiceUsage_ withServiceGuid(String serviceGuid) {
        this.serviceGuid = serviceGuid;
        return this;
    }

    @JsonProperty("service_instance_creation")
    public String getServiceInstanceCreation() {
        return serviceInstanceCreation;
    }

    @JsonProperty("service_instance_creation")
    public void setServiceInstanceCreation(String serviceInstanceCreation) {
        this.serviceInstanceCreation = serviceInstanceCreation;
    }

    public ServiceUsage_ withServiceInstanceCreation(String serviceInstanceCreation) {
        this.serviceInstanceCreation = serviceInstanceCreation;
        return this;
    }

    @JsonProperty("service_instance_deletion")
    public String getServiceInstanceDeletion() {
        return serviceInstanceDeletion;
    }

    @JsonProperty("service_instance_deletion")
    public void setServiceInstanceDeletion(String serviceInstanceDeletion) {
        this.serviceInstanceDeletion = serviceInstanceDeletion;
    }

    public ServiceUsage_ withServiceInstanceDeletion(String serviceInstanceDeletion) {
        this.serviceInstanceDeletion = serviceInstanceDeletion;
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

    public ServiceUsage_ withAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
        return this;
    }

}
