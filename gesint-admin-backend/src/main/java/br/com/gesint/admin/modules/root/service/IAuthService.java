package br.com.gesint.admin.modules.root.service;

import br.com.gesint.admin.modules.root.dto.ForgotPasswordRequestDto;
import br.com.gesint.admin.modules.root.dto.LoginRequestDto;
import br.com.gesint.admin.modules.root.dto.PasswordSetupRequestDto;
import br.com.gesint.admin.modules.root.dto.PasswordSetupValidateRequestDto;
import br.com.gesint.admin.modules.root.dto.PasswordSetupValidateResponseDto;
import br.com.gesint.admin.modules.root.dto.RefreshTokenRequestDto;
import br.com.gesint.admin.modules.root.dto.TokenResponseDto;

public interface IAuthService {

    TokenResponseDto login(LoginRequestDto request);

    TokenResponseDto refresh(RefreshTokenRequestDto request);

    PasswordSetupValidateResponseDto validatePasswordSetupToken(PasswordSetupValidateRequestDto request);

    void setupPassword(PasswordSetupRequestDto request);

    void forgotPassword(ForgotPasswordRequestDto request);
}
