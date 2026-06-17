package br.com.gommo.modules.dp.organization.company.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.dp.organization.company.dto.CompanyRequestDto;
import br.com.gommo.modules.dp.organization.company.dto.CompanyResponseDto;
import br.com.gommo.modules.dp.organization.company.service.ICompanyService;

@RestController
@RequestMapping("/api/v1/companies")
public class CompanyController extends BaseController<CompanyRequestDto, CompanyResponseDto> {

    public CompanyController(ICompanyService service) {
        super(service);
    }
}
