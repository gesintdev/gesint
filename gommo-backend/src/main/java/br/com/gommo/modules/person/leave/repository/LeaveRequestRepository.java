package br.com.gommo.modules.person.leave.repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.person.leave.entity.LeaveRequest;
import br.com.gommo.modules.person.leave.entity.LeaveTypeEnum;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LeaveRequestRepository extends IBaseRepository<LeaveRequest> {

    @Query("""
            SELECT l FROM LeaveRequest l
            WHERE l.status <> :deletedStatus
              AND l.collaboratorId = :collaboratorId
              AND l.approved = TRUE
              AND l.leaveType = :leaveType
              AND l.startDate <= :periodEnd
              AND l.endDate >= :periodStart
            """)
    List<LeaveRequest> findApprovedByCollaboratorAndTypeOverlapping(
            @Param("collaboratorId") UUID collaboratorId,
            @Param("leaveType") LeaveTypeEnum leaveType,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd,
            @Param("deletedStatus") StatusEnum deletedStatus);

    @Query("""
            SELECT l FROM LeaveRequest l
            WHERE l.status <> :deletedStatus
              AND l.collaboratorId = :collaboratorId
              AND l.leaveType <> :vacationType
              AND l.approved = TRUE
              AND l.startDate <= :periodEnd
              AND l.endDate >= :periodStart
            """)
    List<LeaveRequest> findApprovedAbsencesOverlapping(
            @Param("collaboratorId") UUID collaboratorId,
            @Param("vacationType") LeaveTypeEnum vacationType,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd,
            @Param("deletedStatus") StatusEnum deletedStatus);
}
