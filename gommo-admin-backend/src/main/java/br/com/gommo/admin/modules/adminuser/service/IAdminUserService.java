package br.com.gommo.admin.modules.adminuser.service;

import br.com.gommo.admin.core.base.dto.PageableResponseDto;
import br.com.gommo.admin.modules.adminuser.dto.AdminUserRequestDto;
import br.com.gommo.admin.modules.adminuser.dto.AdminUserResponseDto;
import java.util.List;
import java.util.UUID;

public interface IAdminUserService {

    List<AdminUserResponseDto> findAll();

    AdminUserResponseDto findById(UUID id);

    PageableResponseDto<AdminUserResponseDto> findPage(int page, int size);

    AdminUserResponseDto create(AdminUserRequestDto request);

    AdminUserResponseDto update(UUID id, AdminUserRequestDto request);

    void delete(UUID id);
}
