package br.com.gesint.modules.dp.occupationalexam.exam.service;

import java.util.List;
import java.util.UUID;

import br.com.gesint.core.base.service.IBaseService;
import br.com.gesint.modules.dp.occupationalexam.exam.dto.OccupationalExamIndicatorsResponseDto;
import br.com.gesint.modules.dp.occupationalexam.exam.dto.OccupationalExamRegisterResultRequestDto;
import br.com.gesint.modules.dp.occupationalexam.exam.dto.OccupationalExamRequestDto;
import br.com.gesint.modules.dp.occupationalexam.exam.dto.OccupationalExamResponseDto;
import br.com.gesint.modules.dp.occupationalexam.exam.dto.OccupationalExamScheduleRequestDto;

public interface IOccupationalExamService
        extends IBaseService<OccupationalExamRequestDto, OccupationalExamResponseDto> {

    List<OccupationalExamResponseDto> findDue(int days);

    List<OccupationalExamResponseDto> findOverdue();

    int markOverdueInadimplente();

    OccupationalExamIndicatorsResponseDto indicators();

    OccupationalExamResponseDto schedule(UUID id, OccupationalExamScheduleRequestDto request);

    OccupationalExamResponseDto registerResult(UUID id, OccupationalExamRegisterResultRequestDto request);

    List<OccupationalExamResponseDto> findByCollaboratorId(UUID collaboratorId);
}
