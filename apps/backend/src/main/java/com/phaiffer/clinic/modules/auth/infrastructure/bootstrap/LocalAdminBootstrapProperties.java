package com.phaiffer.clinic.modules.auth.infrastructure.bootstrap;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security")
public class LocalAdminBootstrapProperties {

    private String bootstrapAdminEmail;
    private String bootstrapAdminPassword;
    private String bootstrapAdminFullName = "Local Administrator";

    public String getBootstrapAdminEmail() {
        return bootstrapAdminEmail;
    }

    public void setBootstrapAdminEmail(String bootstrapAdminEmail) {
        this.bootstrapAdminEmail = bootstrapAdminEmail;
    }

    public String getBootstrapAdminPassword() {
        return bootstrapAdminPassword;
    }

    public void setBootstrapAdminPassword(String bootstrapAdminPassword) {
        this.bootstrapAdminPassword = bootstrapAdminPassword;
    }

    public String getBootstrapAdminFullName() {
        return bootstrapAdminFullName;
    }

    public void setBootstrapAdminFullName(String bootstrapAdminFullName) {
        this.bootstrapAdminFullName = bootstrapAdminFullName;
    }
}
