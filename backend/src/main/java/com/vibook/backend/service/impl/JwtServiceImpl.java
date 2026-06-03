package com.vibook.backend.service.impl;

import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
/**
 * Handles access-token generation and validation.
 *
 * <p>JWT subject is user email and includes a "roles" claim for client-side context.
 *
 * <p>{@code app.jwt.secret} is treated as a plain UTF-8 string by default. For a Base64-encoded
 * key, prefix the value with {@code base64:} (see {@code backend/.env.example}).
 */
public class JwtServiceImpl implements JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtServiceImpl.class);

    /** HS256 requires at least 256 bits (32 bytes). */
    private static final int MIN_HMAC_KEY_BYTES = 32;

    private static final String BASE64_PREFIX = "base64:";

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    private SecretKey signingKey;

    @PostConstruct
    void initSigningKey() {
        logJwtSecretSources();

        if (!StringUtils.hasText(jwtSecret)) {
            throw new IllegalStateException(
                "JWT secret is not configured. Set JWT_SECRET (at least 32 characters) in the environment."
            );
        }
        byte[] keyBytes = resolveKeyBytes(jwtSecret.trim());
        if (keyBytes.length < MIN_HMAC_KEY_BYTES) {
            throw new IllegalStateException(
                "JWT secret is too short for HS256: need at least "
                    + MIN_HMAC_KEY_BYTES
                    + " bytes, got "
                    + keyBytes.length
                    + ". Update JWT_SECRET in backend/.env (not only .env.example) to at least 32 characters."
            );
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        log.info("JWT secret loaded successfully. Length={} bytes", keyBytes.length);
    }

    /** Logs where JWT_SECRET may come from — lengths only, never secret values. */
    private void logJwtSecretSources() {
        String osEnv = System.getenv("JWT_SECRET");
        if (osEnv != null) {
            log.info("JWT_SECRET OS environment variable present. Length={}", osEnv.trim().length());
        }
        if (StringUtils.hasText(jwtSecret)) {
            log.info("app.jwt.secret resolved property present. Length={}", jwtSecret.trim().length());
        }
    }

    @Override
    public String generateToken(AuthenticatedUser user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
            .subject(user.getUsername())
            .issuedAt(now)
            .expiration(expiry)
            .claim(
                "roles",
                user.getUser().getRoles().stream()
                    .map(r -> r.getName().authority())
                    .sorted()
                    .toList()
            )
            .signWith(signingKey)
            .compact();
    }

    @Override
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    @Override
    public boolean isTokenValid(String token, AuthenticatedUser user) {
        String username = extractUsername(token);
        return username.equals(user.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
        return claimsResolver.apply(claims);
    }

    static byte[] resolveKeyBytes(String secret) {
        if (secret.regionMatches(true, 0, BASE64_PREFIX, 0, BASE64_PREFIX.length())) {
            String encoded = secret.substring(BASE64_PREFIX.length()).trim();
            if (!StringUtils.hasText(encoded)) {
                throw new IllegalStateException("JWT secret uses base64: prefix but no Base64 value was provided.");
            }
            try {
                return Decoders.BASE64.decode(encoded);
            } catch (RuntimeException ex) {
                throw new IllegalStateException(
                    "JWT secret has base64: prefix but the value is not valid Base64: " + ex.getMessage(),
                    ex
                );
            }
        }
        return secret.getBytes(StandardCharsets.UTF_8);
    }
}
