package br.com.gommo.modules.rh.person.leave.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.leave.entity.LeaveAbsenceStatusEnum;
import br.com.gommo.modules.rh.person.leave.entity.LeaveRequest;
import br.com.gommo.modules.rh.person.leave.entity.LeaveTypeEnum;

@Repository
public interface LeaveRequestRepository extends IBaseRepository<LeaveRequest> {

    @Query(
            """
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

    @Query(
            """
            SELECT l FROM LeaveRequest l
            WHERE l.status <> :deletedStatus
              AND l.collaboratorId IN :collaboratorIds
              AND l.approved = TRUE
              AND l.leaveType = :leaveType
              AND l.startDate <= :periodEnd
              AND l.endDate >= :periodStart
            """)
    List<LeaveRequest> findApprovedByCollaboratorInAndTypeOverlapping(
            @Param("collaboratorIds") List<UUID> collaboratorIds,
            @Param("leaveType") LeaveTypeEnum leaveType,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd,
            @Param("deletedStatus") StatusEnum deletedStatus);

    @Query(
            """
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

    @Query(
            """
            SELECT l FROM LeaveRequest l
            WHERE l.status <> :deletedStatus
              AND l.collaboratorId IN :collaboratorIds
              AND l.leaveType <> :vacationType
              AND l.approved = TRUE
              AND l.startDate <= :periodEnd
              AND l.endDate >= :periodStart
            """)
    List<LeaveRequest> findApprovedAbsencesByCollaboratorInOverlapping(
            @Param("collaboratorIds") List<UUID> collaboratorIds,
            @Param("vacationType") LeaveTypeEnum vacationType,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd,
            @Param("deletedStatus") StatusEnum deletedStatus);

    @Query(
            """
            SELECT l FROM LeaveRequest l
            WHERE l.status <> :deletedStatus
              AND l.collaboratorId IN :collaboratorIds
              AND l.leaveType <> :vacationType
              AND (l.approved = TRUE OR l.absenceStatus IN :approvedStatuses)
              AND l.startDate <= :periodEnd
              AND l.endDate >= :periodStart
            """)
    List<LeaveRequest> findActiveAbsencesByCollaboratorInOverlapping(
            @Param("collaboratorIds") List<UUID> collaboratorIds,
            @Param("vacationType") LeaveTypeEnum vacationType,
            @Param("approvedStatuses") List<LeaveAbsenceStatusEnum> approvedStatuses,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd,
            @Param("deletedStatus") StatusEnum deletedStatus);

    @Query(
            """
            SELECT l FROM LeaveRequest l
            WHERE l.status <> :deletedStatus
              AND l.collaboratorId = :collaboratorId
              AND l.leaveType <> :vacationType
              AND (:ignoredId IS NULL OR l.id <> :ignoredId)
              AND (l.absenceStatus IS NULL OR l.absenceStatus <> br.com.gommo.modules.rh.person.leave.entity.LeaveAbsenceStatusEnum.CANCELLED)
              AND l.startDate <= :periodEnd
              AND l.endDate >= :periodStart
            """)
    List<LeaveRequest> findConflictingAbsences(
            @Param("collaboratorId") UUID collaboratorId,
            @Param("vacationType") LeaveTypeEnum vacationType,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd,
            @Param("ignoredId") UUID ignoredId,
            @Param("deletedStatus") StatusEnum deletedStatus);

    @Query(
            """
            SELECT l FROM LeaveRequest l
            WHERE l.status <> :deletedStatus
              AND l.collaboratorId = :collaboratorId
              AND l.leaveType <> :vacationType
              AND (:ignoredId IS NULL OR l.id <> :ignoredId)
              AND l.approved = TRUE
              AND l.cid = :cid
              AND l.startDate >= :periodStart
              AND l.endDate <= :periodEnd
            """)
    List<LeaveRequest> findApprovedAbsencesByCidWithinPeriod(
            @Param("collaboratorId") UUID collaboratorId,
            @Param("vacationType") LeaveTypeEnum vacationType,
            @Param("cid") String cid,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd,
            @Param("ignoredId") UUID ignoredId,
            @Param("deletedStatus") StatusEnum deletedStatus);
}
