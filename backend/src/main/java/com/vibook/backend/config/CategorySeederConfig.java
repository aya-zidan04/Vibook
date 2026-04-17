package com.vibook.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

@Configuration
public class CategorySeederConfig {

    @Bean
    @Order(2)
    CommandLineRunner seedCategories(CategoryDataLoader categoryDataLoader) {
        return args -> categoryDataLoader.seedIfEmpty();
    }
}
