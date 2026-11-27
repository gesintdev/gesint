package br.com.gesint.modules.gp.calendar.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.core.util.BrazilianBusinessCalendar;
import br.com.gesint.modules.gp.attendance.service.AttendanceEvaluationService;
import br.com.gesint.modules.gp.calendar.dto.AbsenceCalendarResponseDto;
import br.com.gesint.modules.rh.person.collaborators.people.entity.Collaborator;
import br.com.gesint.modules.rh.person.leave.entity.LeaveRequest;
import br.com.gesint.modules.rh.person.leave.entity.LeaveTypeEnum;
import br.com.gesint.modules.rh.person.leave.repository.LeaveRequestRepository;

/** Le ferias e afastamentos aprovados (cadastrados no RH/DP); a Gestao de Ponto nao os edita. */
@Service
public class AbsenceCalendarService implements IAbsenceCalendarService {

    private final AttendanceEvaluationService evaluationService;
    private final LeaveRequestRepository leaveRequestRepository;

    public AbsenceCalendarService(
            AttendanceEvaluationService evaluationService, LeaveRequestRepository leaveRequestRepository) {
        this.evaluationService = evaluationService;
        this.leaveRequestRepository = leaveRequestRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('attendance:read')")
    public AbsenceCalendarResponseDto calendar(LocalDate from, LocalDate to) {
        LocalDate today = evaluationService.today();
        LocalDate start = from != null ? from : today.withDayOfMonth(1);
        LocalDate end = to != null ? to : start.withDayOfMonth(start.lengthOfMonth());
        if (start.isAfter(end)) {
            LocalDate swap = start;
            start = end;
            end = swap;
        }
        Map<UUID, String> names = evaluationService.roster(null).stream()
                .collect(Collectors.toMap(Collaborator::getId, AttendanceEvaluationService::displayName, (a, b) -> a));
        List<AbsenceCalendarResponseDto.Event> events = new ArrayList<>();
        if (!names.isEmpty()) {
            List<UUID> ids = List.copyOf(names.keySet());
            List<LeaveRequest> leaves = new ArrayList<>();
            leaves.addAll(leaveRequestRepository.findApprovedByCollaboratorInAndTypeOverlapping(
                    ids, LeaveTypeEnum.VACATION, start, end, StatusEnum.DELETED));
            leaves.addAll(leaveRequestRepository.findApprovedAbsencesByCollaboratorInOverlapping(
                    ids, LeaveTypeEnum.VACATION, start, end, StatusEnum.DELETED));
            for (LeaveRequest leave : leaves) {
                if (leave.getStartDate() == null || leave.getEndDate() == null) {
                    continue;
                }
                events.add(AbsenceCalendarResponseDto.Event.builder()
                        .id(leave.getId().toString())
                        .collaboratorId(leave.getCollaboratorId())
                        .collaboratorName(names.get(leave.getCollaboratorId()))
                        .type(leave.getLeaveType() != null ? leave.getLeaveType().name() : null)
                        .category(category(leave.getLeaveType()))
                        .startDate(leave.getStartDate())
                        .endDate(leave.getEndDate())
                        .build());
            }
        }
        events.sort(Comparator.comparing(AbsenceCalendarResponseDto.Event::getStartDate)
                .thenComparing(event -> event.getCollaboratorName() != null ? event.getCollaboratorName() : "",
                        String.CASE_INSENSITIVE_ORDER));
        List<LocalDate> holidays = new ArrayList<>();
        for (int year = start.getYear(); year <= end.getYear(); year++) {
            for (LocalDate holiday : BrazilianBusinessCalendar.nationalHolidays(year)) {
                if (!holiday.isBefore(start) && !holiday.isAfter(end)) {
                    holidays.add(holiday);
                }
            }
        }
        holidays.sort(Comparator.naturalOrder());
        return AbsenceCalendarResponseDto.builder()
                .periodStart(start)
                .periodEnd(end)
                .events(events)
                .holidays(holidays)
                .build();
    }

    private static String category(LeaveTypeEnum type) {
        if (type == LeaveTypeEnum.VACATION) {
            return "VACATION";
        }
        if (type == LeaveTypeEnum.UNJUSTIFIED_ABSENCE) {
            return "ABSENCE";
        }
        return "LEAVE";
    }
}
