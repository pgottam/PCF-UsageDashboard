package io.pivotal.tola.cfapi.usage.model;

import java.util.HashMap;
import java.util.Map;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FoundationUsage {

    private String name;
    
    @Builder.Default
    private Map<Organization, OrgUsage[]> orgs = new HashMap<Organization, OrgUsage[]>();

    public void addOrgYearlyUsage(Organization org, OrgUsage[] usage) {
        orgs.put(org, usage);
    } 

}
