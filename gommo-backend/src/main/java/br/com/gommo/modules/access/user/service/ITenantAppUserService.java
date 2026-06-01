package br.com.gommo.modules.access.user.service;

import br.com.gommo.modules.access.user.dto.AppUserRequestDto;
import br.com.gommo.modules.access.user.dto.AppUserResponseDto;
import java.util.List;
import java.util.UUID;

public interface ITenantAppUserService {

    List<AppUserResponseDto> findAll();

    AppUserResponseDto findById(UUID id);

    AppUserResponseDto create(AppUserRequestDto request);

    AppUserResponseDto update(UUID id, AppUserRequestDto request);

    void delete(UUID id);
}
