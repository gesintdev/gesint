package br.com.gommo.admin.modules.clientuser.service;

import br.com.gommo.admin.core.base.dto.PageableResponseDto;
import br.com.gommo.admin.modules.clientuser.dto.ClientUserRequestDto;
import br.com.gommo.admin.modules.clientuser.dto.ClientUserResponseDto;
import java.util.List;
import java.util.UUID;

public interface IClientUserService {

    List<ClientUserResponseDto> findAll();

    ClientUserResponseDto findById(UUID id);

    PageableResponseDto<ClientUserResponseDto> findPage(int page, int size);

    ClientUserResponseDto create(ClientUserRequestDto request);

    ClientUserResponseDto update(UUID id, ClientUserRequestDto request);

    void delete(UUID id);
}
