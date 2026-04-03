package com.vibook.config;

import com.vibook.security.JwtAuthenticationFilter;
import com.vibook.security.RestAccessDeniedHandler;
import com.vibook.security.RestAuthenticationEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            RestAuthenticationEntryPoint authenticationEntryPoint,
            RestAccessDeniedHandler accessDeniedHandler
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(c -> c.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/refresh")
                        .permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/business/leads")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/cities", "/api/v1/cities/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories", "/api/v1/categories/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/cuisines", "/api/v1/cuisines/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/organizers", "/api/v1/organizers/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/events", "/api/v1/events/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/restaurants", "/api/v1/restaurants/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/experiences", "/api/v1/experiences/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/hotels", "/api/v1/hotels/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/flights", "/api/v1/flights/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/packages", "/api/v1/packages/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/offers", "/api/v1/offers/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/membership/plans", "/api/v1/membership/plans/**")
                        .permitAll()
                        .requestMatchers("/actuator/health", "/actuator/health/**")
                        .permitAll()
                        .anyRequest()
                        .authenticated()
                )
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(false);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
