package br.com.gommo.admin.modules.clientbranch.service;

import java.util.List;
import java.util.UUID;

import br.com.gommo.admin.modules.clientbranch.dto.ClientBranchRequestDto;
import br.com.gommo.admin.modules.clientbranch.dto.ClientBranchResponseDto;

public interface IClientBranchService {

    List<ClientBranchResponseDto> findAllByClientId(UUID clientId);

    ClientBranchResponseDto findById(UUID id);

    ClientBranchResponseDto create(ClientBranchRequestDto request);

    ClientBranchResponseDto update(UUID id, ClientBranchRequestDto request);

    void delete(UUID id);

    /** Reaplica o seed de company no schema do tenant para todas as filiais do cliente. */
    List<ClientBranchResponseDto> syncToTenant(UUID clientId);
}
