package br.com.gommo.modules.ctb.payroll.integration;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.leave.entity.LeaveRequest;
import br.com.gommo.modules.rh.person.leave.entity.LeaveTypeEnum;
import br.com.gommo.modules.rh.person.leave.repository.LeaveRequestRepository;

@Component
public class LeaveDataProviderImpl implements LeaveDataProvider {

    private final LeaveRequestRepository leaveRequestRepository;

    public LeaveDataProviderImpl(LeaveRequestRepository leaveRequestRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
    }

    @Override
    public LeaveDataSnapshot loadLeaveData(UUID collaboratorId, LocalDate periodStart, LocalDate periodEnd) {
        int unpaidDays = 0;
        for (LeaveTypeEnum type : List.of(LeaveTypeEnum.UNPAID, LeaveTypeEnum.UNPAID_LEAVE, LeaveTypeEnum.SUSPENSION)) {
            List<LeaveRequest> unpaidLeaves = leaveRequestRepository.findApprovedByCollaboratorAndTypeOverlapping(
                    collaboratorId, type, periodStart, periodEnd, StatusEnum.DELETED);
            for (LeaveRequest leave : unpaidLeaves) {
                LocalDate overlapStart =
                        leave.getStartDate().isBefore(periodStart) ? periodStart : leave.getStartDate();
                LocalDate overlapEnd = leave.getEndDate().isAfter(periodEnd) ? periodEnd : leave.getEndDate();
                if (!overlapEnd.isBefore(overlapStart)) {
                    unpaidDays += (int) ChronoUnit.DAYS.between(overlapStart, overlapEnd) + 1;
                }
            }
        }
        return new LeaveDataSnapshot(collaboratorId, unpaidDays);
    }
}
