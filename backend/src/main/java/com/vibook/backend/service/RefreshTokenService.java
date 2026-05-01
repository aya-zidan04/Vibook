package com.vibook.backend.service;

import com.vibook.backend.entity.RefreshToken;
import com.vibook.backend.entity.User;

public interface RefreshTokenService {
    RefreshToken createRefreshToken(User user);
    RefreshToken verifyRefreshToken(String token);

    /** Idempotent: unknown token is ignored (client-safe logout). */
    void revokeRefreshToken(String token);

    void revokeAllRefreshTokensForUser(User user);
}
