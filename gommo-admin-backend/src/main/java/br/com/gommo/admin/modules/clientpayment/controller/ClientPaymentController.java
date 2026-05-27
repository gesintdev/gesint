package br.com.gommo.admin.modules.clientpayment.controller;

import br.com.gommo.admin.core.base.controller.BaseController;
import br.com.gommo.admin.modules.clientpayment.dto.ClientPaymentRequestDto;
import br.com.gommo.admin.modules.clientpayment.dto.ClientPaymentResponseDto;
import br.com.gommo.admin.modules.clientpayment.service.IClientPaymentService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/client-payments")
public class ClientPaymentController extends BaseController<ClientPaymentRequestDto, ClientPaymentResponseDto> {

    public ClientPaymentController(IClientPaymentService service) {
        super(service);
    }
}
