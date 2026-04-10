package com.phaiffer.clinic.shared.config.scoring;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.scoring")
public class ScoringProperties {

    private double moderateThreshold = 10.0;
    private double highThreshold = 20.0;

    public double getModerateThreshold() {
        return moderateThreshold;
    }

    public void setModerateThreshold(double moderateThreshold) {
        this.moderateThreshold = moderateThreshold;
    }

    public double getHighThreshold() {
        return highThreshold;
    }

    public void setHighThreshold(double highThreshold) {
        this.highThreshold = highThreshold;
    }
}
