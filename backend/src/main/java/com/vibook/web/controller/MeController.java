package com.vibook.web.controller;

import com.vibook.security.SecurityUserPrincipal;
import com.vibook.service.ProfileService;
import com.vibook.web.dto.profile.PatchProfileRequest;
import com.vibook.web.dto.user.UserResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me")
public class MeController {

    private final ProfileService profileService;

    public MeController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public UserResponse getMe(@AuthenticationPrincipal SecurityUserPrincipal principal) {
        return profileService.getProfile(principal.getId());
    }

    @PatchMapping
    public UserResponse patchMe(
            @AuthenticationPrincipal SecurityUserPrincipal principal,
            @Valid @RequestBody PatchProfileRequest request
    ) {
        return profileService.patchProfile(principal.getId(), request);
    }
}
