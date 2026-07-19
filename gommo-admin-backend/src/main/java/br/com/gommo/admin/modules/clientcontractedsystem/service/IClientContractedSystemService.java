package br.com.gommo.admin.modules.clientcontractedsystem.service;

import java.util.List;
import java.util.UUID;

import br.com.gommo.admin.core.base.service.IBaseService;
import br.com.gommo.admin.modules.clientcontractedsystem.dto.ClientContractedSystemRequestDto;
import br.com.gommo.admin.modules.clientcontractedsystem.dto.ClientContractedSystemResponseDto;

public interface IClientContractedSystemService
        extends IBaseService<ClientContractedSystemRequestDto, ClientContractedSystemResponseDto> {

    List<ClientContractedSystemResponseDto> findAllByClientId(UUID clientId);
}
