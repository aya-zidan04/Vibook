package com.vibook.backend.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * CORS settings for API clients (Expo / web dev). Widen carefully in production.
 */
@ConfigurationProperties(prefix = "vibook.cors")
public class CorsProperties {

    /**
     * Use {@link org.springframework.web.cors.CorsConfiguration#setAllowedOriginPatterns} entries,
     * e.g. {@code http://localhost:*} for local Expo.
     */
    private List<String> allowedOriginPatterns = List.of("http://localhost:*", "http://127.0.0.1:*");

    public List<String> getAllowedOriginPatterns() {
        return allowedOriginPatterns;
    }

    public void setAllowedOriginPatterns(List<String> allowedOriginPatterns) {
        this.allowedOriginPatterns = allowedOriginPatterns;
    }
}
