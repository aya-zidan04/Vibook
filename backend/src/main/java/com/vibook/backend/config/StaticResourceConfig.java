package com.vibook.backend.config;

import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    private final String profileUploadDir;
    private final String profilePublicPath;
    private final String businessLogoUploadDir;
    private final String businessLogoPublicPath;
    private final String businessBannerUploadDir;
    private final String businessBannerPublicPath;

    public StaticResourceConfig(
        @Value("${app.upload.profile-images-dir:uploads/profile-images}") String profileUploadDir,
        @Value("${app.upload.public-profile-image-path:/api/v1/files/profile-images}") String profilePublicPath,
        @Value("${app.upload.business-logos-dir:uploads/business-logos}") String businessLogoUploadDir,
        @Value("${app.upload.public-business-logo-path:/api/v1/files/business-logos}") String businessLogoPublicPath,
        @Value("${app.upload.business-banners-dir:uploads/business-banners}") String businessBannerUploadDir,
        @Value("${app.upload.public-business-banner-path:/api/v1/files/business-banners}") String businessBannerPublicPath
    ) {
        this.profileUploadDir = profileUploadDir;
        this.profilePublicPath = profilePublicPath;
        this.businessLogoUploadDir = businessLogoUploadDir;
        this.businessLogoPublicPath = businessLogoPublicPath;
        this.businessBannerUploadDir = businessBannerUploadDir;
        this.businessBannerPublicPath = businessBannerPublicPath;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registerMappedDirectory(registry, profileUploadDir, profilePublicPath);
        registerMappedDirectory(registry, businessLogoUploadDir, businessLogoPublicPath);
        registerMappedDirectory(registry, businessBannerUploadDir, businessBannerPublicPath);
    }

    private static void registerMappedDirectory(ResourceHandlerRegistry registry, String uploadDir, String publicPath) {
        Path dir = Path.of(uploadDir).toAbsolutePath().normalize();
        String pattern = publicPath.endsWith("/") ? publicPath + "**" : publicPath + "/**";
        String location = dir.toUri().toString();
        registry.addResourceHandler(pattern).addResourceLocations(location);
    }
}
