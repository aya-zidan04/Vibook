package com.vibook.backend.service;

import com.vibook.backend.dto.AuthResponse;
import com.vibook.backend.dto.LoginRequest;
import com.vibook.backend.dto.RefreshTokenRequest;
import com.vibook.backend.dto.RegisterRequest;
import com.vibook.backend.dto.TokenRefreshResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    TokenRefreshResponse refreshAccessToken(RefreshTokenRequest request);
}
