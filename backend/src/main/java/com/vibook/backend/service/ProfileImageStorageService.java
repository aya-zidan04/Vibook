package com.vibook.backend.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Validates and persists images to disk; returns public URL paths stored on entities.
 */
public interface ProfileImageStorageService {

    /**
     * Saves under the profile-images directory; returns e.g. {@code /api/v1/files/profile-images/...}.
     */
    String saveProfileImage(MultipartFile file);

    /**
     * Saves under the business logos directory; returns e.g. {@code /api/v1/files/business-logos/...}.
     */
    String saveBusinessLogo(MultipartFile file);

    /**
     * Saves under the business banners directory; returns e.g. {@code /api/v1/files/business-banners/...}.
     */
    String saveBusinessBanner(MultipartFile file);

    /**
     * Deletes the file previously saved under this public path, if it matches a known storage root.
     */
    void tryDeleteStoredFile(String publicPath);
}
