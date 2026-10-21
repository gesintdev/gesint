package br.com.gesint.modules.careers.candidateportal.service;

import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.core.security.JwtProperties;
import br.com.gesint.core.security.JwtService;
import br.com.gesint.core.tenant.TenantContext;
import br.com.gesint.core.tenant.TenantContextHolder;
import br.com.gesint.modules.careers.candidateportal.auth.GoogleIdTokenVerifier;
import br.com.gesint.modules.careers.candidateportal.dto.CandidatePortalGoogleLoginRequestDto;
import br.com.gesint.modules.careers.candidateportal.dto.CandidatePortalLoginRequestDto;
import br.com.gesint.modules.careers.candidateportal.dto.CandidatePortalRefreshRequestDto;
import br.com.gesint.modules.careers.candidateportal.dto.CandidatePortalRegisterRequestDto;
import br.com.gesint.modules.careers.candidateportal.dto.CandidatePortalTokenResponseDto;
import br.com.gesint.modules.careers.candidateportal.entity.CandidateAccount;
import br.com.gesint.modules.careers.candidateportal.exception.CandidatePortalException;
import br.com.gesint.modules.careers.candidateportal.repository.CandidateAccountRepository;
import br.com.gesint.modules.rh.person.candidate.entity.Candidate;
import br.com.gesint.modules.rh.person.candidate.repository.CandidateRepository;
import io.jsonwebtoken.Claims;

@Service
public class CandidatePortalAuthService {

    private final CandidateAccountRepository accountRepository;
    private final CandidateRepository candidateRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;
    private final JwtProperties jwtProperties;

    public CandidatePortalAuthService(
            CandidateAccountRepository accountRepository,
            CandidateRepository candidateRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            GoogleIdTokenVerifier googleIdTokenVerifier,
            JwtProperties jwtProperties) {
        this.accountRepository = accountRepository;
        this.candidateRepository = candidateRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleIdTokenVerifier = googleIdTokenVerifier;
        this.jwtProperties = jwtProperties;
    }

    @Transactional
    public CandidatePortalTokenResponseDto register(CandidatePortalRegisterRequestDto request) {
        String email = normalizeEmail(request.getEmail());
        String fullName = trimRequired(request.getFullName());
        if (fullName.isBlank()) {
            throw CandidatePortalException.nameRequired();
        }
        if (email.isBlank()) {
            throw CandidatePortalException.emailRequired();
        }
        if (request.getPassword() == null || request.getPassword().length() < 8) {
            throw CandidatePortalException.passwordRequired();
        }
        if (accountRepository.findByEmailIgnoreCaseAndStatusNot(email, StatusEnum.DELETED).isPresent()) {
            throw CandidatePortalException.emailInUse();
        }

        Candidate candidate = resolveOrCreateCandidate(email, fullName, blankToNull(request.getPhone()));
        CandidateAccount account = CandidateAccount.builder()
                .status(StatusEnum.ACTIVE)
                .candidateId(candidate.getId())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(fullName)
                .phone(blankToNull(request.getPhone()))
                .emailVerified(false)
                .lastLoginAt(OffsetDateTime.now())
                .build();
        account = accountRepository.save(account);
        return issueTokens(account);
    }

    @Transactional
    public CandidatePortalTokenResponseDto login(CandidatePortalLoginRequestDto request) {
        String email = normalizeEmail(request.getEmail());
        CandidateAccount account = accountRepository
                .findByEmailIgnoreCaseAndStatusNot(email, StatusEnum.DELETED)
                .orElseThrow(CandidatePortalException::invalidCredentials);
        if (account.getPasswordHash() == null
                || request.getPassword() == null
                || !passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            throw CandidatePortalException.invalidCredentials();
        }
        account.setLastLoginAt(OffsetDateTime.now());
        accountRepository.save(account);
        return issueTokens(account);
    }

    @Transactional
    public CandidatePortalTokenResponseDto loginWithGoogle(CandidatePortalGoogleLoginRequestDto request) {
        GoogleIdTokenVerifier.GoogleIdentity identity = googleIdTokenVerifier.verify(request.getIdToken());
        CandidateAccount account = accountRepository
                .findByGoogleSubAndStatusNot(identity.subject(), StatusEnum.DELETED)
                .or(() -> accountRepository.findByEmailIgnoreCaseAndStatusNot(identity.email(), StatusEnum.DELETED))
                .orElseGet(() -> createGoogleAccount(identity));

        if (account.getGoogleSub() == null) {
            account.setGoogleSub(identity.subject());
        }
        if (!account.isEmailVerified()) {
            account.setEmailVerified(true);
        }
        account.setLastLoginAt(OffsetDateTime.now());
        accountRepository.save(account);
        return issueTokens(account);
    }

    @Transactional(readOnly = true)
    public CandidatePortalTokenResponseDto refresh(CandidatePortalRefreshRequestDto request) {
        if (!jwtService.isCandidateRefreshToken(request.getRefreshToken())) {
            throw CandidatePortalException.unauthorized();
        }
        Claims claims = jwtService.parseClaims(request.getRefreshToken());
        UUID accountId = UUID.fromString(claims.getSubject());
        CandidateAccount account = accountRepository
                .findByIdAndStatusNot(accountId, StatusEnum.DELETED)
                .orElseThrow(CandidatePortalException::unauthorized);
        return issueTokens(account);
    }

    private CandidateAccount createGoogleAccount(GoogleIdTokenVerifier.GoogleIdentity identity) {
        Candidate candidate = resolveOrCreateCandidate(identity.email(), identity.fullName(), null);
        CandidateAccount account = CandidateAccount.builder()
                .status(StatusEnum.ACTIVE)
                .candidateId(candidate.getId())
                .email(identity.email())
                .googleSub(identity.subject())
                .fullName(identity.fullName())
                .emailVerified(true)
                .lastLoginAt(OffsetDateTime.now())
                .build();
        return accountRepository.save(account);
    }

    private Candidate resolveOrCreateCandidate(String email, String fullName, String phone) {
        return candidateRepository
                .findFirstByEmailIgnoreCaseAndStatusNotOrderByCreatedAtAsc(email, StatusEnum.DELETED)
                .orElseGet(() -> candidateRepository.save(Candidate.builder()
                        .status(StatusEnum.ACTIVE)
                        .fullName(fullName)
                        .email(email)
                        .phone(phone)
                        .build()));
    }

    private CandidatePortalTokenResponseDto issueTokens(CandidateAccount account) {
        TenantContext tenant = TenantContextHolder.getOptional().orElse(null);
        UUID tenantId = tenant != null ? tenant.clientId() : null;
        String tenantSlug = tenant != null ? tenant.slug() : null;
        String tenantName = tenant != null ? tenant.name() : null;
        String access = jwtService.generateCandidateAccessToken(
                account.getId(), account.getEmail(), tenantId, tenantSlug);
        String refresh = jwtService.generateCandidateRefreshToken(account.getId(), tenantId, tenantSlug);
        return CandidatePortalTokenResponseDto.builder()
                .accessToken(access)
                .refreshToken(refresh)
                .tokenType("Bearer")
                .expiresInSeconds(jwtProperties.accessTokenMinutes() * 60L)
                .fullName(account.getFullName())
                .email(account.getEmail())
                .tenantSlug(tenantSlug)
                .tenantName(tenantName)
                .build();
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private static String trimRequired(String value) {
        return value == null ? "" : value.trim();
    }

    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
