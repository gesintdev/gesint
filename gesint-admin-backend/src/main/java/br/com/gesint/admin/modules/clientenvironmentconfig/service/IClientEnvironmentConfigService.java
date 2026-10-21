package br.com.gesint.admin.modules.clientenvironmentconfig.service;

import java.util.UUID;

import br.com.gesint.admin.core.base.service.IBaseService;
import br.com.gesint.admin.modules.clientenvironmentconfig.dto.ClientEnvironmentConfigRequestDto;
import br.com.gesint.admin.modules.clientenvironmentconfig.dto.ClientEnvironmentConfigResponseDto;

public interface IClientEnvironmentConfigService
        extends IBaseService<ClientEnvironmentConfigRequestDto, ClientEnvironmentConfigResponseDto> {

    ClientEnvironmentConfigResponseDto findByClientId(UUID clientId);

    ClientEnvironmentConfigResponseDto upsertByClient(UUID clientId, ClientEnvironmentConfigRequestDto request);
}
