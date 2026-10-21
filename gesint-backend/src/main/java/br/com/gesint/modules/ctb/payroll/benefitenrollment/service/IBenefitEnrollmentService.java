package br.com.gesint.modules.ctb.payroll.benefitenrollment.service;

import br.com.gesint.core.base.service.IBaseService;
import br.com.gesint.modules.ctb.payroll.benefitenrollment.dto.BenefitEnrollmentRequestDto;
import br.com.gesint.modules.ctb.payroll.benefitenrollment.dto.BenefitEnrollmentResponseDto;

public interface IBenefitEnrollmentService
        extends IBaseService<BenefitEnrollmentRequestDto, BenefitEnrollmentResponseDto> {}
