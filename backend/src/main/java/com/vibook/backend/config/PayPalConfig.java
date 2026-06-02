package com.vibook.backend.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(PayPalProperties.class)
public class PayPalConfig {

    @Bean
    RestClient paypalRestClient(PayPalProperties properties) {
        return RestClient.builder().baseUrl(properties.baseUrl()).build();
    }
}
