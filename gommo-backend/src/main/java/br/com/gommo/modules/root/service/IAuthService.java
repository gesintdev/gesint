package br.com.gommo.modules.root.service;

import java.util.Optional;

import br.com.gommo.modules.root.dto.ChangePasswordRequestDto;
import br.com.gommo.modules.root.dto.ForgotPasswordRequestDto;
import br.com.gommo.modules.root.dto.LoginRequestDto;
import br.com.gommo.modules.root.dto.PasswordSetupRequestDto;
import br.com.gommo.modules.root.dto.PasswordSetupValidateRequestDto;
import br.com.gommo.modules.root.dto.PasswordSetupValidateResponseDto;
import br.com.gommo.modules.root.dto.RefreshTokenRequestDto;
import br.com.gommo.modules.root.dto.TenantInfoResponseDto;
import br.com.gommo.modules.root.dto.TokenResponseDto;

public interface IAuthService {

    TokenResponseDto login(LoginRequestDto request);

    TokenResponseDto refresh(RefreshTokenRequestDto request);

    /** Valida se o refresh ainda está ativo, sem rotacionar tokens. */
    void assertRefreshSessionActive(RefreshTokenRequestDto request);

    Optional<TenantInfoResponseDto> currentTenant();

    PasswordSetupValidateResponseDto validatePasswordSetupToken(PasswordSetupValidateRequestDto request);

    void setupPassword(PasswordSetupRequestDto request);

    void forgotPassword(ForgotPasswordRequestDto request);

    void changePassword(ChangePasswordRequestDto request);
}
