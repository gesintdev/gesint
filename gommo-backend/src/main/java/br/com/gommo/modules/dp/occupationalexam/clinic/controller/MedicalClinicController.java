package br.com.gommo.modules.dp.occupationalexam.clinic.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.dp.occupationalexam.clinic.dto.MedicalClinicRequestDto;
import br.com.gommo.modules.dp.occupationalexam.clinic.dto.MedicalClinicResponseDto;
import br.com.gommo.modules.dp.occupationalexam.clinic.service.IMedicalClinicService;

@RestController
@RequestMapping("/api/v1/medical-clinics")
public class MedicalClinicController extends BaseController<MedicalClinicRequestDto, MedicalClinicResponseDto> {

    public MedicalClinicController(IMedicalClinicService service) {
        super(service);
    }
}
