package br.com.gesint.admin.modules.adminuser.service;

import java.util.List;
import java.util.UUID;

import br.com.gesint.admin.core.base.dto.PageableResponseDto;
import br.com.gesint.admin.modules.adminuser.dto.AdminUserRequestDto;
import br.com.gesint.admin.modules.adminuser.dto.AdminUserResponseDto;

public interface IAdminUserService {

    List<AdminUserResponseDto> findAll();

    AdminUserResponseDto findById(UUID id);

    PageableResponseDto<AdminUserResponseDto> findPage(int page, int size);

    AdminUserResponseDto create(AdminUserRequestDto request);

    AdminUserResponseDto update(UUID id, AdminUserRequestDto request);

    AdminUserResponseDto resetAccess(UUID id);

    void delete(UUID id);
}
