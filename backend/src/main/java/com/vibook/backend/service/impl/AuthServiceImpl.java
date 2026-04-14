package com.vibook.backend.service.impl;

import com.vibook.backend.dto.AuthResponse;
import com.vibook.backend.dto.LoginRequest;
import com.vibook.backend.dto.RefreshTokenRequest;
import com.vibook.backend.dto.RegisterRequest;
import com.vibook.backend.dto.TokenRefreshResponse;
import com.vibook.backend.entity.RefreshToken;
import com.vibook.backend.entity.Role;
import com.vibook.backend.entity.RoleName;
import com.vibook.backend.entity.User;
import com.vibook.backend.exception.BadRequestException;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.mapper.UserMapper;
import com.vibook.backend.repository.RoleRepository;
import com.vibook.backend.repository.UserRepository;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.AuthService;
import com.vibook.backend.service.JwtService;
import com.vibook.backend.service.RefreshTokenService;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
/**
 * Authentication orchestration service.
 *
 * <p>Uses AuthenticationManager for login, BCrypt for password storage,
 * JWT for short-lived access tokens, and DB-backed refresh tokens.
 */
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserMapper userMapper;

    public AuthServiceImpl(
        UserRepository userRepository,
        RoleRepository roleRepository,
        PasswordEncoder passwordEncoder,
        AuthenticationManager authenticationManager,
        JwtService jwtService,
        RefreshTokenService refreshTokenService,
        UserMapper userMapper
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("Email is already registered");
        }

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
            .orElseThrow(() -> new BadRequestException("Default role is not configured"));

        User user = new User();
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setEmail(normalizedEmail);
        user.setPhone(request.phone().trim());
        // Password hashing is handled via configured BCrypt PasswordEncoder.
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setEnabled(true);
        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        user.setRoles(roles);

        User saved = userRepository.save(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(saved);
        String token = jwtService.generateToken(new AuthenticatedUser(saved));
        return new AuthResponse(token, "Bearer", refreshToken.getToken(), userMapper.toResponse(saved));
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
            );
        } catch (AuthenticationException ex) {
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!user.isEnabled()) {
            throw new UnauthorizedException("Account is disabled");
        }

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        String token = jwtService.generateToken(new AuthenticatedUser(user));
        return new AuthResponse(token, "Bearer", refreshToken.getToken(), userMapper.toResponse(user));
    }

    @Override
    public TokenRefreshResponse refreshAccessToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(request.refreshToken().trim());
        User user = refreshToken.getUser();
        if (!user.isEnabled()) {
            throw new UnauthorizedException("Account is disabled");
        }
        String token = jwtService.generateToken(new AuthenticatedUser(user));
        return new TokenRefreshResponse(token, "Bearer");
    }
}
