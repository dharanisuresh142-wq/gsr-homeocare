package com.gsr.homeocare.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.mongodb")
public class MongoProperties {

    private String organizationId = "6a126d53e091a2b24b63a82c";

    public String getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(String organizationId) {
        this.organizationId = organizationId;
    }
}
