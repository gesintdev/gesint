package br.com.gommo.modules.cfg.settings.digitalcertificate.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.cfg.settings.digitalcertificate.dto.DigitalCertificateRequestDto;
import br.com.gommo.modules.cfg.settings.digitalcertificate.dto.DigitalCertificateResponseDto;
import br.com.gommo.modules.cfg.settings.digitalcertificate.service.IDigitalCertificateService;

@RestController
@RequestMapping("/api/v1/digital-certificates")
public class DigitalCertificateController
        extends BaseController<DigitalCertificateRequestDto, DigitalCertificateResponseDto> {

    public DigitalCertificateController(IDigitalCertificateService service) {
        super(service);
    }
}
