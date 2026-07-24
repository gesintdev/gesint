package br.com.gommo.admin.modules.root.service;

import br.com.gommo.admin.modules.root.dto.ForgotPasswordRequestDto;
import br.com.gommo.admin.modules.root.dto.LoginRequestDto;
import br.com.gommo.admin.modules.root.dto.PasswordSetupRequestDto;
import br.com.gommo.admin.modules.root.dto.PasswordSetupValidateRequestDto;
import br.com.gommo.admin.modules.root.dto.PasswordSetupValidateResponseDto;
import br.com.gommo.admin.modules.root.dto.RefreshTokenRequestDto;
import br.com.gommo.admin.modules.root.dto.TokenResponseDto;

public interface IAuthService {

    TokenResponseDto login(LoginRequestDto request);

    TokenResponseDto refresh(RefreshTokenRequestDto request);

    PasswordSetupValidateResponseDto validatePasswordSetupToken(PasswordSetupValidateRequestDto request);

    void setupPassword(PasswordSetupRequestDto request);

    void forgotPassword(ForgotPasswordRequestDto request);
}
