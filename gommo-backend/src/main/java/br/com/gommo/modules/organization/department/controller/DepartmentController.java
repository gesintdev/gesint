package br.com.gommo.modules.organization.department.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.modules.organization.department.dto.DepartmentRequestDto;
import br.com.gommo.modules.organization.department.dto.DepartmentResponseDto;
import br.com.gommo.modules.organization.department.service.IDepartmentService;

@RestController
@RequestMapping("/api/v1/departments")
public class DepartmentController extends BaseController<DepartmentRequestDto, DepartmentResponseDto> {

    private final IDepartmentService departmentService;

    public DepartmentController(IDepartmentService service) {
        super(service);
        this.departmentService = service;
    }

    @GetMapping("/search")
    public ResponseEntity<PageableResponseDto<DepartmentResponseDto>> search(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String costCenter) {
        return ResponseEntity.ok(departmentService.search(page, size, name, costCenter));
    }
}
