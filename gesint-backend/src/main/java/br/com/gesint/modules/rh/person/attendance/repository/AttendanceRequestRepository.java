package br.com.gesint.modules.rh.person.attendance.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.attendance.entity.AttendanceRequest;
import br.com.gesint.modules.rh.person.attendance.entity.AttendanceRequestTypeEnum;
import br.com.gesint.modules.rh.person.attendance.entity.AttendanceSourceEnum;

@Repository
public interface AttendanceRequestRepository extends IBaseRepository<AttendanceRequest> {

    Optional<AttendanceRequest> findBySourceAndClientRequestIdAndStatusNot(
            AttendanceSourceEnum source, String clientRequestId, StatusEnum status);

    List<AttendanceRequest> findByRequestStatusAndStatusNotOrderBySubmittedAtDesc(
            String requestStatus, StatusEnum status);

    List<AttendanceRequest> findByStatusNotOrderBySubmittedAtDesc(StatusEnum status);

    @Query(
            """
            SELECT a FROM AttendanceRequest a
            WHERE a.status <> :deletedStatus
              AND a.collaboratorId = :collaboratorId
              AND a.workDate BETWEEN :periodStart AND :periodEnd
            ORDER BY a.submittedAt DESC, a.workDate DESC
            """)
    List<AttendanceRequest> findByCollaboratorAndPeriod(
            @Param("collaboratorId") UUID collaboratorId,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd,
            @Param("deletedStatus") StatusEnum deletedStatus);

    @Query(
            """
            SELECT a FROM AttendanceRequest a
            WHERE a.status <> :deletedStatus
              AND a.requestStatus = :requestStatus
              AND a.workDate BETWEEN :periodStart AND :periodEnd
            """)
    List<AttendanceRequest> findByRequestStatusAndPeriod(
            @Param("requestStatus") String requestStatus,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd,
            @Param("deletedStatus") StatusEnum deletedStatus);

    @Query(
            """
            SELECT DISTINCT a.collaboratorId FROM AttendanceRequest a
            WHERE a.status <> :deletedStatus
              AND a.collaboratorId IS NOT NULL
              AND a.workDate BETWEEN :periodStart AND :periodEnd
            """)
    List<UUID> findDistinctCollaboratorIdsByWorkDateBetween(
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd,
            @Param("deletedStatus") StatusEnum deletedStatus);

    Optional<AttendanceRequest> findFirstByCollaboratorIdAndWorkDateAndRequestTypeAndRequestStatusAndStatusNot(
            UUID collaboratorId,
            LocalDate workDate,
            AttendanceRequestTypeEnum requestType,
            String requestStatus,
            StatusEnum status);
}
