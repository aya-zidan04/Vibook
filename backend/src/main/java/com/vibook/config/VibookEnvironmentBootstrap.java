package com.vibook.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.Arrays;
import java.util.Map;

/**
 * Runs before the context refreshes. Fills blank datasource / JWT properties for local development
 * so empty {@code DB_URL=} shell exports do not override YAML defaults with an empty string.
 * Skips fallbacks when the {@code prod} profile is active.
 */
public final class VibookEnvironmentBootstrap implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    private static final Logger log = LoggerFactory.getLogger(VibookEnvironmentBootstrap.class);

    private static final String LOCAL_JDBC =
            "jdbc:postgresql://localhost:5432/vibook?sslmode=disable&tcpKeepAlive=true";
    private static final String LOCAL_USER = "vibook";
    private static final String LOCAL_PASSWORD = "vibook";
    /** 64+ chars for HS256 comfort; dev only — override with JWT_SECRET in production. */
    private static final String LOCAL_JWT_SECRET =
            "vibook-local-dev-only-change-JWT_SECRET-in-production-min-32-bytes-required!!";

    @Override
    public void initialize(ConfigurableApplicationContext context) {
        ConfigurableEnvironment env = context.getEnvironment();
        if (isProdProfile(env)) {
            validateProdJwt(env);
            return;
        }
        applyIfBlank(env, "spring.datasource.url", LOCAL_JDBC, "JDBC URL");
        applyIfBlank(env, "spring.datasource.username", LOCAL_USER, "DB username");
        applyIfBlank(env, "spring.datasource.password", LOCAL_PASSWORD, "DB password");
        applyIfBlank(env, "vibook.security.jwt.secret", LOCAL_JWT_SECRET, "JWT signing secret");
    }

    private static boolean isProdProfile(ConfigurableEnvironment env) {
        return Arrays.asList(env.getActiveProfiles()).contains("prod");
    }

    private static void validateProdJwt(ConfigurableEnvironment env) {
        String jwt = env.getProperty("vibook.security.jwt.secret");
        if (jwt == null || jwt.isBlank()) {
            throw new IllegalStateException(
                    "Production profile is active but JWT secret is missing or blank. "
                            + "Set environment variable JWT_SECRET (or vibook.security.jwt.secret) to a long random string (at least 32 bytes).");
        }
        if (jwt.length() < 32) {
            log.warn("JWT secret is shorter than 32 characters; use a longer random value in production.");
        }
    }

    private static void applyIfBlank(ConfigurableEnvironment env, String key, String fallback, String label) {
        String current = env.getProperty(key);
        if (current != null && !current.isBlank()) {
            return;
        }
        log.warn(
                "Vibook: {} ({}) was missing or blank — using built-in local development default. "
                        + "Set DB_URL / DATABASE_URL, DB_USERNAME / DATABASE_USERNAME, DB_PASSWORD / DATABASE_PASSWORD, and JWT_SECRET for real deployments.",
                label,
                key
        );
        env.getPropertySources().addFirst(
                new MapPropertySource("vibook-local-fallback-" + key.replace('.', '-'), Map.of(key, fallback))
        );
    }
}
