package br.com.gommo.modules.payroll.benefitenrollment.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.payroll.benefitenrollment.dto.BenefitEnrollmentRequestDto;
import br.com.gommo.modules.payroll.benefitenrollment.dto.BenefitEnrollmentResponseDto;
import br.com.gommo.modules.payroll.benefitenrollment.service.IBenefitEnrollmentService;

@RestController
@RequestMapping("/api/v1/benefit-enrollments")
public class BenefitEnrollmentController
        extends BaseController<BenefitEnrollmentRequestDto, BenefitEnrollmentResponseDto> {
    public BenefitEnrollmentController(IBenefitEnrollmentService service) {
        super(service);
    }
}
