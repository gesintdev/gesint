package br.com.gommo.modules.rh.person.leave.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.rh.person.leave.dto.LeaveRequestRequestDto;
import br.com.gommo.modules.rh.person.leave.dto.LeaveRequestResponseDto;
import br.com.gommo.modules.rh.person.leave.dto.VacationAbsenceSummaryDto;
import br.com.gommo.modules.rh.person.leave.dto.VacationEligibleCollaboratorDto;
import br.com.gommo.modules.rh.person.leave.dto.VacationReviewRequestDto;

public interface ILeaveRequestService extends IBaseService<LeaveRequestRequestDto, LeaveRequestResponseDto> {

    VacationAbsenceSummaryDto absenceSummary(UUID collaboratorId, LocalDate acquisitionStart, LocalDate acquisitionEnd);

    List<VacationEligibleCollaboratorDto> findVacationEligibleCollaborators();

    LeaveRequestResponseDto reviewVacation(UUID id, VacationReviewRequestDto request);
}
