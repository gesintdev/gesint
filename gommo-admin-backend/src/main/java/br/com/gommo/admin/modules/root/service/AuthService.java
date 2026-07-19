package br.com.gommo.admin.modules.root.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.core.security.JwtProperties;
import br.com.gommo.admin.core.security.JwtService;
import br.com.gommo.admin.modules.adminuser.entity.AdminUser;
import br.com.gommo.admin.modules.adminuser.repository.AdminUserRepository;
import br.com.gommo.admin.modules.integration.repository.PublicPermissionRepository;
import br.com.gommo.admin.modules.root.dto.LoginRequestDto;
import br.com.gommo.admin.modules.root.dto.RefreshTokenRequestDto;
import br.com.gommo.admin.modules.root.dto.TokenResponseDto;
import br.com.gommo.admin.modules.root.entity.AdminRefreshToken;
import br.com.gommo.admin.modules.root.entity.AdminRefreshTokenBlacklist;
import br.com.gommo.admin.modules.root.exception.AuthException;
import br.com.gommo.admin.modules.root.repository.AdminRefreshTokenBlacklistRepository;
import br.com.gommo.admin.modules.root.repository.AdminRefreshTokenRepository;

@Service
public class AuthService implements IAuthService {

    private static final String PLATFORM_ADMIN_PERMISSION = "platform:admin";
    private static final int REFRESH_REPLAY_GRACE_SECONDS = 10;

    private final AdminUserRepository adminUserRepository;
    private final AdminRefreshTokenRepository refreshTokenRepository;
    private final AdminRefreshTokenBlacklistRepository blacklistRepository;
    private final PublicPermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    public AuthService(
            AdminUserRepository adminUserRepository,
            AdminRefreshTokenRepository refreshTokenRepository,
            AdminRefreshTokenBlacklistRepository blacklistRepository,
            PublicPermissionRepository permissionRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            JwtProperties jwtProperties) {
        this.adminUserRepository = adminUserRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.blacklistRepository = blacklistRepository;
        this.permissionRepository = permissionRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
    }

    @Override
    @Transactional
    public TokenResponseDto login(LoginRequestDto request) {
        AdminUser user = adminUserRepository
                .findActiveByUsername(request.getUsername(), StatusEnum.DELETED)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        user.setLastLogin(OffsetDateTime.now());
        adminUserRepository.save(user);

        return buildTokenResponse(user);
    }

    @Override
    @Transactional
    public TokenResponseDto refresh(RefreshTokenRequestDto request) {
        String rawRefresh = request.getRefreshToken();
        if (!jwtService.isRefreshToken(rawRefresh)) {
            throw AuthException.invalidRefresh();
        }

        OffsetDateTime now = OffsetDateTime.now();
        String tokenHash = hashToken(rawRefresh);
        AdminRefreshTokenBlacklist blacklisted = blacklistRepository.findByTokenHash(tokenHash).orElse(null);
        boolean replayGrace = isWithinReplayGrace(blacklisted, now);

        if (blacklisted != null && !replayGrace) {
            throw AuthException.revokedRefresh();
        }

        AdminRefreshToken stored = refreshTokenRepository.findByTokenHash(tokenHash).orElse(null);
        if (stored == null) {
            throw AuthException.invalidRefresh();
        }

        if (stored.isRevoked() && !replayGrace) {
            throw AuthException.revokedRefresh();
        }

        if (stored.getExpiresAt().isBefore(now)) {
            throw AuthException.expiredRefresh();
        }

        UUID userId = jwtService.extractUserId(rawRefresh);
        AdminUser user =
                adminUserRepository.findActiveById(userId, StatusEnum.DELETED).orElseThrow(AuthException::userNotFound);

        // Race de refresh concorrente: token ja rotacionado ha poucos segundos → emite novo par.
        if (stored.isRevoked()) {
            return buildTokenResponse(user);
        }

        stored.setRevoked(true);
        refreshTokenRepository.save(stored);
        blacklistRepository.save(AdminRefreshTokenBlacklist.builder()
                .tokenHash(tokenHash)
                .revokedAt(now)
                .build());

        return buildTokenResponse(user);
    }

    private boolean isWithinReplayGrace(AdminRefreshTokenBlacklist blacklisted, OffsetDateTime now) {
        if (blacklisted == null) {
            return false;
        }
        return !now.isAfter(blacklisted.getRevokedAt().plusSeconds(REFRESH_REPLAY_GRACE_SECONDS));
    }

    private TokenResponseDto buildTokenResponse(AdminUser user) {
        List<String> permissions = new ArrayList<>();
        permissions.add(PLATFORM_ADMIN_PERMISSION);
        permissionRepository.findAll().forEach(p -> permissions.add(p.getAuthority()));

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getUsername(), permissions);
        String refreshToken = jwtService.generateRefreshToken(user.getId());
        persistRefreshToken(user.getId(), refreshToken);

        return TokenResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresInSeconds(jwtProperties.accessTokenMinutes() * 60)
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    private void persistRefreshToken(UUID userId, String rawToken) {
        refreshTokenRepository.save(AdminRefreshToken.builder()
                .userId(userId)
                .tokenHash(hashToken(rawToken))
                .expiresAt(OffsetDateTime.now().plusDays(jwtProperties.refreshTokenDays()))
                .revoked(false)
                .createdAt(OffsetDateTime.now())
                .build());
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
