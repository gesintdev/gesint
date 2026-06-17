package br.com.gommo.modules.rh.person.contract.service;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.rh.person.contract.dto.EmploymentContractRequestDto;
import br.com.gommo.modules.rh.person.contract.dto.EmploymentContractResponseDto;

public interface IEmploymentContractService
        extends IBaseService<EmploymentContractRequestDto, EmploymentContractResponseDto> {}
