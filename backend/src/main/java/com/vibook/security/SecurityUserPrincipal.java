package com.vibook.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Authenticated principal for JWT requests. Carries user id and authorities without reloading the entity on each call.
 */
public class SecurityUserPrincipal implements UserDetails {

    private final UUID id;
    private final String email;
    private final Collection<? extends GrantedAuthority> authorities;

    public SecurityUserPrincipal(UUID id, String email, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.authorities = authorities;
    }

    public static SecurityUserPrincipal fromJwt(UUID id, String email, List<String> roleNames) {
        List<GrantedAuthority> auths = roleNames.stream()
                .map(r -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + r))
                .toList();
        return new SecurityUserPrincipal(id, email, auths);
    }

    public UUID getId() {
        return id;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
