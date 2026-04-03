package com.vibook.web.dto.auth;

import com.vibook.web.dto.user.UserResponse;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresInSeconds,
        UserResponse user
) {
}
