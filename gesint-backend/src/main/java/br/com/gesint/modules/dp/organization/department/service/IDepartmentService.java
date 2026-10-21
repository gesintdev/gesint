package br.com.gesint.modules.dp.organization.department.service;

import br.com.gesint.core.base.dto.PageableResponseDto;
import br.com.gesint.core.base.service.IBaseService;
import br.com.gesint.modules.dp.organization.department.dto.DepartmentRequestDto;
import br.com.gesint.modules.dp.organization.department.dto.DepartmentResponseDto;

public interface IDepartmentService extends IBaseService<DepartmentRequestDto, DepartmentResponseDto> {

    PageableResponseDto<DepartmentResponseDto> search(int page, int size, String name, String costCenter);
}
