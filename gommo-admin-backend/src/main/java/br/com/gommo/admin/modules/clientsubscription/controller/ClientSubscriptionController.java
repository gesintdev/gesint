package br.com.gommo.admin.modules.clientsubscription.controller;

import br.com.gommo.admin.core.base.controller.BaseController;
import br.com.gommo.admin.modules.clientsubscription.dto.ClientSubscriptionRequestDto;
import br.com.gommo.admin.modules.clientsubscription.dto.ClientSubscriptionResponseDto;
import br.com.gommo.admin.modules.clientsubscription.service.IClientSubscriptionService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/client-subscriptions")
public class ClientSubscriptionController
        extends BaseController<ClientSubscriptionRequestDto, ClientSubscriptionResponseDto> {

    public ClientSubscriptionController(IClientSubscriptionService service) {
        super(service);
    }
}
