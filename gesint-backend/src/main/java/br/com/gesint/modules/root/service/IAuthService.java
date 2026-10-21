package br.com.gesint.modules.root.service;

import java.util.Optional;

import br.com.gesint.modules.root.dto.ChangePasswordRequestDto;
import br.com.gesint.modules.root.dto.ForgotPasswordRequestDto;
import br.com.gesint.modules.root.dto.LoginRequestDto;
import br.com.gesint.modules.root.dto.PasswordSetupRequestDto;
import br.com.gesint.modules.root.dto.PasswordSetupValidateRequestDto;
import br.com.gesint.modules.root.dto.PasswordSetupValidateResponseDto;
import br.com.gesint.modules.root.dto.RefreshTokenRequestDto;
import br.com.gesint.modules.root.dto.SessionBootstrapDto;
import br.com.gesint.modules.root.dto.TenantInfoResponseDto;
import br.com.gesint.modules.root.dto.TokenResponseDto;

public interface IAuthService {

    TokenResponseDto login(LoginRequestDto request);

    TokenResponseDto refresh(RefreshTokenRequestDto request);

    /** Valida se o refresh ainda está ativo, sem rotacionar tokens. */
    void assertRefreshSessionActive(RefreshTokenRequestDto request);

    /** Perfis, permissoes, filiais e sistemas contratados — fora do cookie de sessao. */
    SessionBootstrapDto currentSession();

    Optional<TenantInfoResponseDto> currentTenant();

    PasswordSetupValidateResponseDto validatePasswordSetupToken(PasswordSetupValidateRequestDto request);

    void setupPassword(PasswordSetupRequestDto request);

    void forgotPassword(ForgotPasswordRequestDto request);

    void changePassword(ChangePasswordRequestDto request);
}
