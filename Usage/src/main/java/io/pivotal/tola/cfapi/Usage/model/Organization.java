package io.pivotal.tola.cfapi.Usage.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Organization {
    private String guid;
    private String name;

}