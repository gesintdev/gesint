package br.com.gesint.modules.dp.occupationalexam.examrequirement.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.core.base.controller.BaseController;
import br.com.gesint.modules.dp.occupationalexam.examrequirement.dto.ExamRequirementRequestDto;
import br.com.gesint.modules.dp.occupationalexam.examrequirement.dto.ExamRequirementResponseDto;
import br.com.gesint.modules.dp.occupationalexam.examrequirement.service.IExamRequirementService;

@RestController
@RequestMapping("/api/v1/exam-requirements")
public class ExamRequirementController extends BaseController<ExamRequirementRequestDto, ExamRequirementResponseDto> {

    private final IExamRequirementService examRequirementService;

    public ExamRequirementController(IExamRequirementService service) {
        super(service);
        this.examRequirementService = service;
    }

    @GetMapping("/by-job-position/{jobPositionId}")
    public List<ExamRequirementResponseDto> byJobPosition(@PathVariable UUID jobPositionId) {
        return examRequirementService.findByJobPositionId(jobPositionId);
    }
}
