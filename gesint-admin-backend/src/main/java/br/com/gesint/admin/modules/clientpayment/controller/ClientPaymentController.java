package br.com.gesint.admin.modules.clientpayment.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.admin.core.base.controller.BaseController;
import br.com.gesint.admin.modules.clientpayment.dto.ClientPaymentRequestDto;
import br.com.gesint.admin.modules.clientpayment.dto.ClientPaymentResponseDto;
import br.com.gesint.admin.modules.clientpayment.service.IClientPaymentService;

@RestController
@RequestMapping("/api/v1/client-payments")
public class ClientPaymentController extends BaseController<ClientPaymentRequestDto, ClientPaymentResponseDto> {

    public ClientPaymentController(IClientPaymentService service) {
        super(service);
    }
}
