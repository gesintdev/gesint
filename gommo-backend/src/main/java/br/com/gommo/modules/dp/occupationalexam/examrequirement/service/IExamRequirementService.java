package br.com.gommo.modules.dp.occupationalexam.examrequirement.service;

import java.util.List;
import java.util.UUID;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.dp.occupationalexam.examrequirement.dto.ExamRequirementRequestDto;
import br.com.gommo.modules.dp.occupationalexam.examrequirement.dto.ExamRequirementResponseDto;

public interface IExamRequirementService extends IBaseService<ExamRequirementRequestDto, ExamRequirementResponseDto> {

    List<ExamRequirementResponseDto> findByJobPositionId(UUID jobPositionId);
}
