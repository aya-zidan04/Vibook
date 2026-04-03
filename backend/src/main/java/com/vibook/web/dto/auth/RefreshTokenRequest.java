package com.vibook.web.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RefreshTokenRequest(
        @NotBlank
        @Size(max = 2048)
        String refreshToken
) {
}
