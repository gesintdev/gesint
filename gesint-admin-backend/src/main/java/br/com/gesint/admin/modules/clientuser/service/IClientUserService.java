package br.com.gesint.admin.modules.clientuser.service;

import java.util.List;
import java.util.UUID;

import br.com.gesint.admin.core.base.dto.PageableResponseDto;
import br.com.gesint.admin.modules.clientuser.dto.ClientUserRequestDto;
import br.com.gesint.admin.modules.clientuser.dto.ClientUserResponseDto;

public interface IClientUserService {

    List<ClientUserResponseDto> findAll();

    List<ClientUserResponseDto> findAllByClientId(UUID clientId);

    ClientUserResponseDto findById(UUID id);

    PageableResponseDto<ClientUserResponseDto> findPage(int page, int size);

    ClientUserResponseDto create(ClientUserRequestDto request);

    ClientUserResponseDto update(UUID id, ClientUserRequestDto request);

    ClientUserResponseDto resetAccess(UUID id);

    void delete(UUID id);
}
