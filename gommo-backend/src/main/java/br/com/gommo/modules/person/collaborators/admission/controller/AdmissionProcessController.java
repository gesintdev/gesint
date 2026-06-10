package br.com.gommo.modules.person.collaborators.admission.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.person.collaborators.admission.dto.AdmissionProcessRequestDto;
import br.com.gommo.modules.person.collaborators.admission.dto.AdmissionProcessResponseDto;
import br.com.gommo.modules.person.collaborators.admission.service.IAdmissionProcessService;

@RestController
@RequestMapping("/api/v1/admissions")
public class AdmissionProcessController
        extends BaseController<AdmissionProcessRequestDto, AdmissionProcessResponseDto> {
    public AdmissionProcessController(IAdmissionProcessService service) {
        super(service);
    }
}
