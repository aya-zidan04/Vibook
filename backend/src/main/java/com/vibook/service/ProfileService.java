package com.vibook.service;

import com.vibook.entity.User;
import com.vibook.exception.CityNotFoundException;
import com.vibook.repository.CityRepository;
import com.vibook.repository.UserRepository;
import com.vibook.web.dto.profile.PatchProfileRequest;
import com.vibook.web.dto.user.UserResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final CityRepository cityRepository;

    public ProfileService(UserRepository userRepository, CityRepository cityRepository) {
        this.userRepository = userRepository;
        this.cityRepository = cityRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(UUID userId) {
        User user = userRepository.findByIdWithCity(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse patchProfile(UUID userId, PatchProfileRequest request) {
        User user = userRepository.findByIdWithCity(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (Boolean.TRUE.equals(request.unsetCity()) && request.cityId() != null) {
            throw new IllegalArgumentException("Cannot set both cityId and unsetCity");
        }
        if (Boolean.TRUE.equals(request.unsetCity())) {
            user.setCity(null);
        } else if (request.cityId() != null) {
            user.setCity(cityRepository.findById(request.cityId())
                    .orElseThrow(CityNotFoundException::new));
        }

        if (request.firstName() != null) {
            String v = request.firstName().trim();
            if (v.isEmpty()) {
                throw new IllegalArgumentException("firstName cannot be blank");
            }
            user.setFirstName(v);
        }
        if (request.lastName() != null) {
            String v = request.lastName().trim();
            if (v.isEmpty()) {
                throw new IllegalArgumentException("lastName cannot be blank");
            }
            user.setLastName(v);
        }
        if (request.nameAr() != null) {
            String v = request.nameAr().trim();
            user.setNameAr(v.isEmpty() ? null : v);
        }
        if (request.phone() != null) {
            user.setPhone(request.phone().trim());
        }
        if (request.preferredLanguage() != null) {
            user.setPreferredLanguage(request.preferredLanguage());
        }
        if (request.avatarUrl() != null) {
            String v = request.avatarUrl().trim();
            user.setAvatarUrl(v.isEmpty() ? null : v);
        }

        return UserResponse.fromEntity(userRepository.save(user));
    }
}
