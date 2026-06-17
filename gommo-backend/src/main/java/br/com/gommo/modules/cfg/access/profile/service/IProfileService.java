package br.com.gommo.modules.cfg.access.profile.service;

import java.util.List;
import java.util.UUID;

import br.com.gommo.modules.cfg.access.entity.SystemScopeEnum;
import br.com.gommo.modules.cfg.access.profile.dto.ProfileRequestDto;
import br.com.gommo.modules.cfg.access.profile.dto.ProfileResponseDto;

public interface IProfileService {

    List<ProfileResponseDto> findAll(SystemScopeEnum system, boolean includeInactive);

    ProfileResponseDto findById(UUID id);

    ProfileResponseDto create(ProfileRequestDto request);

    ProfileResponseDto update(UUID id, ProfileRequestDto request);

    void activate(UUID id);

    void deactivate(UUID id);

    void delete(UUID id);
}
