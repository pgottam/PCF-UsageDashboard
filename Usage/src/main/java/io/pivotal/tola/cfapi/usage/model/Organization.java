package io.pivotal.tola.cfapi.usage.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Organization {
    private String guid;
    private String name;

}