package com.vibook.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

@Configuration
public class GovernorateSeederConfig {

    @Bean
    @Order(3)
    CommandLineRunner seedGovernorates(GovernorateDataLoader governorateDataLoader) {
        return args -> governorateDataLoader.seedIfEmpty();
    }
}
