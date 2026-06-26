package br.com.gommo.modules.dp.offboarding.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.dp.offboarding.dto.OffboardingRequestDto;
import br.com.gommo.modules.dp.offboarding.dto.OffboardingResponseDto;
import br.com.gommo.modules.dp.offboarding.service.IOffboardingService;

@RestController
@RequestMapping("/api/v1/offboardings")
public class OffboardingController extends BaseController<OffboardingRequestDto, OffboardingResponseDto> {
    public OffboardingController(IOffboardingService service) {
        super(service);
    }
}
