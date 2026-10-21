package br.com.gesint.admin.modules.client.service;

import java.util.List;
import java.util.UUID;

import br.com.gesint.admin.core.base.service.IBaseService;
import br.com.gesint.admin.modules.client.dto.ClientRequestDto;
import br.com.gesint.admin.modules.client.dto.ClientResponseDto;
import br.com.gesint.admin.modules.client.dto.TenantDatabaseTestResultDto;
import br.com.gesint.admin.modules.client.dto.TenantSchemaSyncResultDto;

public interface IClientService extends IBaseService<ClientRequestDto, ClientResponseDto> {

    TenantDatabaseTestResultDto testDatabaseConnection(UUID id);

    ClientResponseDto startProvisioning(UUID id);

    TenantSchemaSyncResultDto syncSchema(UUID id);

    List<TenantSchemaSyncResultDto> syncAllSchemas();
}
