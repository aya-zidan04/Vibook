package com.vibook.service;

import com.vibook.config.JwtProperties;
import com.vibook.entity.RefreshToken;
import com.vibook.entity.Role;
import com.vibook.entity.User;
import com.vibook.entity.enums.PreferredLanguage;
import com.vibook.entity.enums.RoleName;
import com.vibook.exception.DuplicateEmailException;
import com.vibook.exception.InvalidRefreshTokenException;
import com.vibook.repository.RefreshTokenRepository;
import com.vibook.repository.RoleRepository;
import com.vibook.repository.UserRepository;
import com.vibook.security.JwtService;
import com.vibook.security.TokenHasher;
import com.vibook.web.dto.auth.AuthResponse;
import com.vibook.web.dto.auth.LoginRequest;
import com.vibook.web.dto.auth.RefreshTokenRequest;
import com.vibook.web.dto.auth.RegisterRequest;
import com.vibook.web.dto.user.UserResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            JwtProperties jwtProperties
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateEmailException();
        }
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setPhone(request.phone().trim());
        user.setPreferredLanguage(
                request.preferredLanguage() != null ? request.preferredLanguage() : PreferredLanguage.EN
        );
        Role userRole = roleRepository.findByName(RoleName.USER)
                .orElseThrow(() -> new IllegalStateException("USER role missing — check Flyway seed"));
        user.addRole(userRole);
        userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmailIgnoreCaseWithRoles(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        if (!user.isEnabled()) {
            throw new BadCredentialsException("Invalid email or password");
        }
        refreshTokenRepository.revokeAllActiveForUser(user.getId());
        return buildAuthResponse(user);
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        String hash = TokenHasher.sha256Hex(request.refreshToken());
        RefreshToken stored = refreshTokenRepository.findActiveWithUser(hash)
                .orElseThrow(InvalidRefreshTokenException::new);
        if (stored.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidRefreshTokenException();
        }
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);
        User user = stored.getUser();
        return buildAuthResponse(user);
    }

    public void logout(UUID userId) {
        refreshTokenRepository.revokeAllActiveForUser(userId);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.createAccessToken(user);
        String refreshRaw = createAndStoreRefreshToken(user);
        long expiresInSeconds = jwtProperties.getAccessTokenMinutes() * 60L;
        return new AuthResponse(
                accessToken,
                refreshRaw,
                "Bearer",
                expiresInSeconds,
                UserResponse.fromEntity(user)
        );
    }

    private String createAndStoreRefreshToken(User user) {
        byte[] bytes = new byte[48];
        secureRandom.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        String hash = TokenHasher.sha256Hex(raw);
        Instant expiresAt = Instant.now().plus(jwtProperties.getRefreshTokenDays(), ChronoUnit.DAYS);
        refreshTokenRepository.save(new RefreshToken(user, hash, expiresAt, false));
        return raw;
    }
}
