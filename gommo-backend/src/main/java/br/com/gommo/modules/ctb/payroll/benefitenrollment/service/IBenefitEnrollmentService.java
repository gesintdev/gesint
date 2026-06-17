package br.com.gommo.modules.ctb.payroll.benefitenrollment.service;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.ctb.payroll.benefitenrollment.dto.BenefitEnrollmentRequestDto;
import br.com.gommo.modules.ctb.payroll.benefitenrollment.dto.BenefitEnrollmentResponseDto;

public interface IBenefitEnrollmentService
        extends IBaseService<BenefitEnrollmentRequestDto, BenefitEnrollmentResponseDto> {}
