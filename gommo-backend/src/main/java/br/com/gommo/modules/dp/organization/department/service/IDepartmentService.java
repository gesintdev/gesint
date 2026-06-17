package br.com.gommo.modules.dp.organization.department.service;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.dp.organization.department.dto.DepartmentRequestDto;
import br.com.gommo.modules.dp.organization.department.dto.DepartmentResponseDto;

public interface IDepartmentService extends IBaseService<DepartmentRequestDto, DepartmentResponseDto> {

    PageableResponseDto<DepartmentResponseDto> search(int page, int size, String name, String costCenter);
}
