package br.com.gommo.modules.person.contract.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.person.contract.dto.EmploymentContractRequestDto;
import br.com.gommo.modules.person.contract.dto.EmploymentContractResponseDto;
import br.com.gommo.modules.person.contract.service.IEmploymentContractService;

@RestController
@RequestMapping("/api/v1/contracts")
public class EmploymentContractController
        extends BaseController<EmploymentContractRequestDto, EmploymentContractResponseDto> {
    public EmploymentContractController(IEmploymentContractService service) {
        super(service);
    }
}
