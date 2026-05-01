package com.vibook.backend.config;

import com.vibook.backend.security.JwtAuthenticationFilter;
import com.vibook.backend.security.RestAuthenticationEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
/**
 * Central security configuration.
 *
 * <p>Flow:
 * <ol>
 *   <li>Public auth endpoints are whitelisted.</li>
 *   <li>JWT filter runs before username/password filter and loads user context.</li>
 *   <li>Role-based authorization is applied per endpoint.</li>
 * </ol>
 */
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;
    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;

    public SecurityConfig(
        JwtAuthenticationFilter jwtAuthenticationFilter,
        UserDetailsService userDetailsService,
        RestAuthenticationEntryPoint restAuthenticationEntryPoint
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
        this.restAuthenticationEntryPoint = restAuthenticationEntryPoint;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex.authenticationEntryPoint(restAuthenticationEntryPoint))
            .authorizeHttpRequests(auth -> auth
                // Public authentication endpoints (logout accepts refresh token without access token)
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/v1/auth/register",
                    "/api/v1/auth/login",
                    "/api/v1/auth/refresh",
                    "/api/v1/auth/logout"
                ).permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/categories", "/api/v1/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/governorates", "/api/v1/governorates/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/governorates").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/governorates/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/governorates/**").hasRole("ADMIN")
                // Event discovery + detail + ratings (authenticated — consistent with existing detail endpoint)
                .requestMatchers(HttpMethod.GET, "/api/v1/events").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/events/*").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/events/*/rate").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/files/profile-images/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/files/business-logos/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/files/business-banners/**").permitAll()
                // Bookings
                .requestMatchers("/api/v1/bookings/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/v1/business/bookings/**").hasAnyRole("USER", "ADMIN")
                // Admin business onboarding
                .requestMatchers("/api/v1/admin/business-profiles/**").hasRole("ADMIN")
                // Business profile (owner)
                .requestMatchers(HttpMethod.GET, "/api/v1/business-profile/me").hasRole("USER")
                .requestMatchers(HttpMethod.PUT, "/api/v1/business-profile/me").hasRole("USER")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/business-profile/me/submit").hasRole("USER")
                .requestMatchers(HttpMethod.POST, "/api/v1/business-profile/me/logo").hasRole("USER")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/business-profile/me/logo").hasRole("USER")
                .requestMatchers(HttpMethod.POST, "/api/v1/business-profile/me/banner").hasRole("USER")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/business-profile/me/banner").hasRole("USER")
                // Business events (owner or admin — enforced in service layer)
                .requestMatchers(HttpMethod.GET, "/api/v1/business/events").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/business/events").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/v1/business/events/**").hasAnyRole("USER", "ADMIN")
                // User profile (most specific first — before /api/v1/users/*)
                .requestMatchers(HttpMethod.GET, "/api/v1/users/me").hasRole("USER")
                .requestMatchers(HttpMethod.GET, "/api/v1/users/me/payment-methods").hasRole("USER")
                .requestMatchers(HttpMethod.POST, "/api/v1/users/me/payment-methods").hasRole("USER")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/users/me/payment-methods/**").hasRole("USER")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/users/me/payment-methods/**").hasRole("USER")
                .requestMatchers(HttpMethod.POST, "/api/v1/users/me/profile-image").hasRole("USER")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/users/me/profile-image").hasRole("USER")
                .requestMatchers(HttpMethod.POST, "/api/v1/auth/logout-all").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/v1/users").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/users/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/users/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/users/*").hasRole("USER")
                .requestMatchers("/error").permitAll()
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
