package br.com.gesint.modules.rh.person.candidate.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.core.base.controller.BaseController;
import br.com.gesint.modules.rh.person.candidate.dto.CandidateRequestDto;
import br.com.gesint.modules.rh.person.candidate.dto.CandidateResponseDto;
import br.com.gesint.modules.rh.person.candidate.service.ICandidateService;

@RestController
@RequestMapping("/api/v1/candidates")
public class CandidateController extends BaseController<CandidateRequestDto, CandidateResponseDto> {
    public CandidateController(ICandidateService service) {
        super(service);
    }
}
