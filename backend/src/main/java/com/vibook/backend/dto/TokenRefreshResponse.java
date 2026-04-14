package com.vibook.backend.dto;

public record TokenRefreshResponse(
    String token,
    String tokenType
) {
}
