package br.com.gommo.modules.cfg.access.user.service;

import java.util.List;
import java.util.UUID;

import br.com.gommo.modules.cfg.access.user.dto.AppUserRequestDto;
import br.com.gommo.modules.cfg.access.user.dto.AppUserResponseDto;

public interface ITenantAppUserService {

    List<AppUserResponseDto> findAll();

    AppUserResponseDto findById(UUID id);

    AppUserResponseDto create(AppUserRequestDto request);

    AppUserResponseDto update(UUID id, AppUserRequestDto request);

    void delete(UUID id);
}
