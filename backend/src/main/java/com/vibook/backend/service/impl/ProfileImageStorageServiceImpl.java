package com.vibook.backend.service.impl;

import com.vibook.backend.exception.BadRequestException;
import com.vibook.backend.service.ProfileImageStorageService;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProfileImageStorageServiceImpl implements ProfileImageStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif"
    );

    private static final Set<String> EVENT_PHOTO_CONTENT_TYPES = Set.of(
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    );

    private static final Map<String, String> EXTENSION_BY_TYPE = Map.of(
        "image/jpeg", ".jpg",
        "image/jpg", ".jpg",
        "image/png", ".png",
        "image/webp", ".webp",
        "image/gif", ".gif"
    );

    private static final Pattern STORED_NAME_PATTERN = Pattern.compile(
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\\.(jpg|jpeg|png|webp|gif)$"
    );

    private record StorageRoot(Path directory, String publicBasePath) {
        StorageRoot {
            String normalized = publicBasePath.endsWith("/")
                ? publicBasePath.substring(0, publicBasePath.length() - 1)
                : publicBasePath;
            publicBasePath = normalized;
        }
    }

    private final List<StorageRoot> allRoots;
    private final StorageRoot profileRoot;
    private final StorageRoot businessLogoRoot;
    private final StorageRoot businessBannerRoot;
    private final StorageRoot businessEventPhotoRoot;
    private final long maxImageBytes;

    public ProfileImageStorageServiceImpl(
        @Value("${app.upload.profile-images-dir:uploads/profile-images}") String profileDir,
        @Value("${app.upload.public-profile-image-path:/api/v1/files/profile-images}") String profilePublic,
        @Value("${app.upload.business-logos-dir:uploads/business-logos}") String businessLogoDir,
        @Value("${app.upload.public-business-logo-path:/api/v1/files/business-logos}") String businessLogoPublic,
        @Value("${app.upload.business-banners-dir:uploads/business-banners}") String businessBannerDir,
        @Value("${app.upload.public-business-banner-path:/api/v1/files/business-banners}") String businessBannerPublic,
        @Value("${app.upload.business-events-dir:uploads/business-events}") String businessEventDir,
        @Value("${app.upload.public-business-event-path:/api/v1/files/business-events}") String businessEventPublic,
        @Value("${app.upload.max-image-bytes:5242880}") long maxImageBytes
    ) {
        this.maxImageBytes = maxImageBytes;
        this.profileRoot = new StorageRoot(Path.of(profileDir).toAbsolutePath().normalize(), profilePublic);
        this.businessLogoRoot = new StorageRoot(Path.of(businessLogoDir).toAbsolutePath().normalize(), businessLogoPublic);
        this.businessBannerRoot = new StorageRoot(
            Path.of(businessBannerDir).toAbsolutePath().normalize(),
            businessBannerPublic
        );
        this.businessEventPhotoRoot = new StorageRoot(
            Path.of(businessEventDir).toAbsolutePath().normalize(),
            businessEventPublic
        );
        this.allRoots = List.of(profileRoot, businessLogoRoot, businessBannerRoot, businessEventPhotoRoot);
    }

    @PostConstruct
    void ensureUploadDirectoryExists() throws IOException {
        for (StorageRoot root : allRoots) {
            Files.createDirectories(root.directory);
        }
    }

    @Override
    public String saveProfileImage(MultipartFile file) {
        return save(file, profileRoot, ALLOWED_CONTENT_TYPES);
    }

    @Override
    public String saveBusinessLogo(MultipartFile file) {
        return save(file, businessLogoRoot, ALLOWED_CONTENT_TYPES);
    }

    @Override
    public String saveBusinessBanner(MultipartFile file) {
        return save(file, businessBannerRoot, ALLOWED_CONTENT_TYPES);
    }

    @Override
    public String saveBusinessEventPhoto(MultipartFile file) {
        return save(file, businessEventPhotoRoot, EVENT_PHOTO_CONTENT_TYPES);
    }

    private String save(MultipartFile file, StorageRoot root, Set<String> allowedTypes) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file is required");
        }
        if (file.getSize() > maxImageBytes) {
            throw new BadRequestException("Image file is too large");
        }
        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType)) {
            throw new BadRequestException("Image must have a content type");
        }
        String normalizedType = contentType.toLowerCase(Locale.ROOT).split(";")[0].trim();
        if (!allowedTypes.contains(normalizedType)) {
            throw new BadRequestException(
                allowedTypes == EVENT_PHOTO_CONTENT_TYPES
                    ? "Only JPEG, PNG, or WebP images are allowed"
                    : "Only JPEG, PNG, WebP, or GIF images are allowed"
            );
        }
        String extension = EXTENSION_BY_TYPE.get(normalizedType);
        if (extension == null) {
            throw new BadRequestException(
                allowedTypes == EVENT_PHOTO_CONTENT_TYPES
                    ? "Only JPEG, PNG, or WebP images are allowed"
                    : "Only JPEG, PNG, WebP, or GIF images are allowed"
            );
        }
        String storedName = UUID.randomUUID() + extension;
        Path target = root.directory.resolve(storedName).normalize();
        if (!target.startsWith(root.directory)) {
            throw new BadRequestException("Invalid storage path");
        }
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BadRequestException("Could not save image: " + e.getMessage());
        }
        return root.publicBasePath + "/" + storedName;
    }

    @Override
    public void tryDeleteStoredFile(String publicPath) {
        if (!StringUtils.hasText(publicPath)) {
            return;
        }
        String normalized = publicPath.trim();
        for (StorageRoot root : allRoots) {
            tryDeleteIfMatches(normalized, root);
        }
    }

    private void tryDeleteIfMatches(String normalizedPublicPath, StorageRoot root) {
        String prefix = root.publicBasePath + "/";
        if (!normalizedPublicPath.startsWith(prefix)) {
            return;
        }
        String filename = normalizedPublicPath.substring(prefix.length());
        if (!STORED_NAME_PATTERN.matcher(filename).matches()) {
            return;
        }
        Path target = root.directory.resolve(filename).normalize();
        if (!target.startsWith(root.directory)) {
            return;
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException ignored) {
            // optional cleanup — do not fail user flow
        }
    }
}
