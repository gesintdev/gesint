package br.com.gommo.modules.payroll.benefitenrollment.service;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.payroll.benefitenrollment.dto.BenefitEnrollmentRequestDto;
import br.com.gommo.modules.payroll.benefitenrollment.dto.BenefitEnrollmentResponseDto;

public interface IBenefitEnrollmentService
        extends IBaseService<BenefitEnrollmentRequestDto, BenefitEnrollmentResponseDto> {}
