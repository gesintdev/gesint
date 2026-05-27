package br.com.gommo.admin.modules.client.service;

import br.com.gommo.admin.core.base.service.IBaseService;
import br.com.gommo.admin.modules.client.dto.ClientRequestDto;
import br.com.gommo.admin.modules.client.dto.ClientResponseDto;
import br.com.gommo.admin.modules.client.dto.TenantDatabaseTestResultDto;
import java.util.UUID;

public interface IClientService extends IBaseService<ClientRequestDto, ClientResponseDto> {

    TenantDatabaseTestResultDto testDatabaseConnection(UUID id);

    ClientResponseDto startProvisioning(UUID id);
}
