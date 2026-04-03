package com.vibook.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "vibook.security.jwt")
public class JwtProperties {

    /**
     * HMAC secret; if shorter than 32 bytes, services may derive a key — prefer a 32+ byte env secret in production.
     */
    private String secret = "";

    private int accessTokenMinutes = 15;

    private int refreshTokenDays = 7;

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public int getAccessTokenMinutes() {
        return accessTokenMinutes;
    }

    public void setAccessTokenMinutes(int accessTokenMinutes) {
        this.accessTokenMinutes = accessTokenMinutes;
    }

    public int getRefreshTokenDays() {
        return refreshTokenDays;
    }

    public void setRefreshTokenDays(int refreshTokenDays) {
        this.refreshTokenDays = refreshTokenDays;
    }
}
