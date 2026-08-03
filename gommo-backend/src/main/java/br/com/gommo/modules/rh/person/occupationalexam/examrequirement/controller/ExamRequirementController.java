package br.com.gommo.modules.rh.person.occupationalexam.examrequirement.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.rh.person.occupationalexam.examrequirement.dto.ExamRequirementRequestDto;
import br.com.gommo.modules.rh.person.occupationalexam.examrequirement.dto.ExamRequirementResponseDto;
import br.com.gommo.modules.rh.person.occupationalexam.examrequirement.service.IExamRequirementService;

@RestController
@RequestMapping("/api/v1/exam-requirements")
public class ExamRequirementController extends BaseController<ExamRequirementRequestDto, ExamRequirementResponseDto> {

    public ExamRequirementController(IExamRequirementService service) {
        super(service);
    }
}
