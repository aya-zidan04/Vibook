package com.vibook.backend.dto;

public record AuthResponse(
    String token,
    String tokenType,
    String refreshToken,
    UserResponse user
) {
}
