package br.com.gommo.modules.rh.person.occupationalexam.complementaryexam.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.occupationalexam.complementaryexam.dto.ComplementaryExamRequestDto;
import br.com.gommo.modules.rh.person.occupationalexam.complementaryexam.dto.ComplementaryExamResponseDto;
import br.com.gommo.modules.rh.person.occupationalexam.complementaryexam.service.IComplementaryExamService;

@RestController
@RequestMapping("/api/v1/complementary-exams")
public class ComplementaryExamController
        extends BaseController<ComplementaryExamRequestDto, ComplementaryExamResponseDto> {

    public ComplementaryExamController(IComplementaryExamService service) {
        super(service);
    }
}
