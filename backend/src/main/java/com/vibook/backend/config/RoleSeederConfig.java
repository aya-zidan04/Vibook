package com.vibook.backend.config;

import com.vibook.backend.entity.Role;
import com.vibook.backend.entity.RoleName;
import com.vibook.backend.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RoleSeederConfig {

    @Bean
    CommandLineRunner seedRoles(RoleRepository roleRepository) {
        return args -> {
            for (RoleName roleName : RoleName.values()) {
                roleRepository.findByName(roleName).orElseGet(() -> roleRepository.save(new Role(roleName)));
            }
        };
    }
}
