package br.com.gommo.modules.payment.controller;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.payment.dto.PaymentPeriodRequestDto;
import br.com.gommo.modules.payment.dto.PaymentPeriodResponseDto;
import br.com.gommo.modules.payment.service.IPaymentPeriodService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payment-periods")
public class PaymentPeriodController extends BaseController<PaymentPeriodRequestDto, PaymentPeriodResponseDto> {

    public PaymentPeriodController(IPaymentPeriodService service) {
        super(service);
    }
}
