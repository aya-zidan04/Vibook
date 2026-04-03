package com.vibook;

import com.vibook.config.VibookEnvironmentBootstrap;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
@ConfigurationPropertiesScan
public class VibookApplication {

    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(VibookApplication.class);
        application.addInitializers(new VibookEnvironmentBootstrap());
        application.run(args);
    }
}
