package br.com.gommo.modules.rh.person.occupationalexam.exam.service;

import java.util.List;
import java.util.UUID;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.rh.person.occupationalexam.exam.dto.OccupationalExamIndicatorsResponseDto;
import br.com.gommo.modules.rh.person.occupationalexam.exam.dto.OccupationalExamRegisterResultRequestDto;
import br.com.gommo.modules.rh.person.occupationalexam.exam.dto.OccupationalExamRequestDto;
import br.com.gommo.modules.rh.person.occupationalexam.exam.dto.OccupationalExamResponseDto;
import br.com.gommo.modules.rh.person.occupationalexam.exam.dto.OccupationalExamScheduleRequestDto;

public interface IOccupationalExamService
        extends IBaseService<OccupationalExamRequestDto, OccupationalExamResponseDto> {

    List<OccupationalExamResponseDto> findDue(int days);

    List<OccupationalExamResponseDto> findOverdue();

    int markOverdueInadimplente();

    OccupationalExamIndicatorsResponseDto indicators();

    OccupationalExamResponseDto schedule(UUID id, OccupationalExamScheduleRequestDto request);

    OccupationalExamResponseDto registerResult(UUID id, OccupationalExamRegisterResultRequestDto request);
}
