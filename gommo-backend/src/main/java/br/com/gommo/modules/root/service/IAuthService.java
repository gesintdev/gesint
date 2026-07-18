package br.com.gommo.modules.root.service;

import java.util.Optional;

import br.com.gommo.modules.root.dto.LoginRequestDto;
import br.com.gommo.modules.root.dto.RefreshTokenRequestDto;
import br.com.gommo.modules.root.dto.TenantInfoResponseDto;
import br.com.gommo.modules.root.dto.TokenResponseDto;

public interface IAuthService {

    TokenResponseDto login(LoginRequestDto request);

    TokenResponseDto refresh(RefreshTokenRequestDto request);

    Optional<TenantInfoResponseDto> currentTenant();
}
