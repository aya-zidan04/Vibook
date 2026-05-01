package com.vibook.backend.service.impl;

import com.vibook.backend.entity.RefreshToken;
import com.vibook.backend.entity.User;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.repository.RefreshTokenRepository;
import com.vibook.backend.service.RefreshTokenService;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenServiceImpl(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Override
    @Transactional
    public RefreshToken createRefreshToken(User user) {
        refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plus(30, ChronoUnit.DAYS));
        refreshToken.setRevoked(false);
        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    public RefreshToken verifyRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
            .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (refreshToken.isRevoked() || refreshToken.getExpiryDate().isBefore(Instant.now())) {
            throw new UnauthorizedException("Refresh token is expired or revoked");
        }
        return refreshToken;
    }

    @Override
    @Transactional
    public void revokeRefreshToken(String token) {
        refreshTokenRepository.findByToken(token.trim()).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    @Override
    @Transactional
    public void revokeAllRefreshTokensForUser(User user) {
        List<RefreshToken> tokens = refreshTokenRepository.findAllByUser(user);
        for (RefreshToken rt : tokens) {
            rt.setRevoked(true);
        }
        refreshTokenRepository.saveAll(tokens);
    }
}
