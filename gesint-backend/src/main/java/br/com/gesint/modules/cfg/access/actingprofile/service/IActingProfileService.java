package br.com.gesint.modules.cfg.access.actingprofile.service;

import java.util.List;
import java.util.UUID;

import br.com.gesint.modules.cfg.access.actingprofile.dto.ActingProfileRequestDto;
import br.com.gesint.modules.cfg.access.actingprofile.dto.ActingProfileResponseDto;
import br.com.gesint.modules.cfg.access.entity.SystemScopeEnum;

public interface IActingProfileService {

    List<ActingProfileResponseDto> findAll(SystemScopeEnum system, boolean includeInactive);

    ActingProfileResponseDto findById(UUID id);

    ActingProfileResponseDto create(ActingProfileRequestDto request);

    ActingProfileResponseDto update(UUID id, ActingProfileRequestDto request);

    void activate(UUID id);

    void deactivate(UUID id);

    void delete(UUID id);
}
