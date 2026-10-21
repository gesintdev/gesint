package br.com.gesint.admin.modules.clientsubscription.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.admin.core.base.controller.BaseController;
import br.com.gesint.admin.modules.clientsubscription.dto.ClientSubscriptionRequestDto;
import br.com.gesint.admin.modules.clientsubscription.dto.ClientSubscriptionResponseDto;
import br.com.gesint.admin.modules.clientsubscription.service.IClientSubscriptionService;

@RestController
@RequestMapping("/api/v1/client-subscriptions")
public class ClientSubscriptionController
        extends BaseController<ClientSubscriptionRequestDto, ClientSubscriptionResponseDto> {

    public ClientSubscriptionController(IClientSubscriptionService service) {
        super(service);
    }
}
