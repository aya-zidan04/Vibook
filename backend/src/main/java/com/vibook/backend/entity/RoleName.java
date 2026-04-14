package com.vibook.backend.entity;

/**
 * Application roles. Persisted with JPA as {@link jakarta.persistence.EnumType#STRING}.
 * Authority strings for Spring Security match the enum constant names (e.g. {@code ROLE_USER}).
 */
public enum RoleName {
    ROLE_USER,
    ROLE_BUSINESS,
    ROLE_ADMIN;

    /**
     * Spring Security {@link org.springframework.security.core.GrantedAuthority} value.
     */
    public String authority() {
        return name();
    }
}
