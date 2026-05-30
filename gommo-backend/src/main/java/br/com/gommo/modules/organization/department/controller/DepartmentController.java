package br.com.gommo.modules.organization.department.controller;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.organization.department.dto.DepartmentRequestDto;
import br.com.gommo.modules.organization.department.dto.DepartmentResponseDto;
import br.com.gommo.modules.organization.department.service.IDepartmentService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/departments")
public class DepartmentController extends BaseController<DepartmentRequestDto, DepartmentResponseDto> {

    public DepartmentController(IDepartmentService service) {
        super(service);
    }
}
