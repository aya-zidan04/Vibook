package com.vibook.backend.service;

import com.vibook.backend.security.AuthenticatedUser;

public interface JwtService {
    String generateToken(AuthenticatedUser user);
    String extractUsername(String token);
    boolean isTokenValid(String token, AuthenticatedUser user);
}
