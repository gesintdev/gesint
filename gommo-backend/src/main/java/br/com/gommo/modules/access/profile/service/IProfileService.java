package br.com.gommo.modules.access.profile.service;

import br.com.gommo.modules.access.profile.dto.ProfileRequestDto;
import br.com.gommo.modules.access.profile.dto.ProfileResponseDto;
import br.com.gommo.modules.access.entity.SystemScopeEnum;
import java.util.List;
import java.util.UUID;

public interface IProfileService {

    List<ProfileResponseDto> findAll(SystemScopeEnum system);

    ProfileResponseDto findById(UUID id);

    ProfileResponseDto create(ProfileRequestDto request);

    ProfileResponseDto update(UUID id, ProfileRequestDto request);

    void delete(UUID id);
}
