package com.vibook.backend.config;

import com.vibook.backend.migration.LegacyReapprovalDraftMigration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

@Configuration
public class LegacyReapprovalDraftMigrationConfig {

    private static final Logger log = LoggerFactory.getLogger(LegacyReapprovalDraftMigrationConfig.class);

    @Bean
    @Order(20)
    CommandLineRunner runLegacyReapprovalDraftMigration(LegacyReapprovalDraftMigration migration) {
        return args -> {
            int migrated = migration.migrate();
            if (migrated > 0) {
                log.info(
                    "Legacy re-approval migration: moved {} business profile(s) from DRAFT to PENDING_REVIEW",
                    migrated
                );
            } else {
                log.debug("Legacy re-approval migration: no DRAFT re-approval profiles to update");
            }
        };
    }
}
