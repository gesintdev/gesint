package br.com.gesint.modules.dp.payment.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.core.base.controller.BaseController;
import br.com.gesint.modules.dp.payment.dto.PaymentPeriodRequestDto;
import br.com.gesint.modules.dp.payment.dto.PaymentPeriodResponseDto;
import br.com.gesint.modules.dp.payment.service.IPaymentPeriodService;

@RestController
@RequestMapping("/api/v1/payment-periods")
public class PaymentPeriodController extends BaseController<PaymentPeriodRequestDto, PaymentPeriodResponseDto> {

    public PaymentPeriodController(IPaymentPeriodService service) {
        super(service);
    }
}
