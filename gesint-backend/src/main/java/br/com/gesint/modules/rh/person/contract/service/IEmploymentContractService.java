package br.com.gesint.modules.rh.person.contract.service;

import br.com.gesint.core.base.service.IBaseService;
import br.com.gesint.modules.rh.person.contract.dto.EmploymentContractRequestDto;
import br.com.gesint.modules.rh.person.contract.dto.EmploymentContractResponseDto;

public interface IEmploymentContractService
        extends IBaseService<EmploymentContractRequestDto, EmploymentContractResponseDto> {}
