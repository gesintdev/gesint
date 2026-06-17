package br.com.gommo.modules.person.leave.service;

import java.time.LocalDate;
import java.util.UUID;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.person.leave.dto.LeaveRequestRequestDto;
import br.com.gommo.modules.person.leave.dto.LeaveRequestResponseDto;
import br.com.gommo.modules.person.leave.dto.VacationAbsenceSummaryDto;
import br.com.gommo.modules.person.leave.dto.VacationReviewRequestDto;

public interface ILeaveRequestService extends IBaseService<LeaveRequestRequestDto, LeaveRequestResponseDto> {

    VacationAbsenceSummaryDto absenceSummary(UUID collaboratorId, LocalDate acquisitionStart, LocalDate acquisitionEnd);

    LeaveRequestResponseDto reviewVacation(UUID id, VacationReviewRequestDto request);
}
