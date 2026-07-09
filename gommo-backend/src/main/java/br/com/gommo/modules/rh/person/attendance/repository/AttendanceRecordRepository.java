package br.com.gommo.modules.rh.person.attendance.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceOccurrenceOriginEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceRecord;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceSourceEnum;

@Repository
public interface AttendanceRecordRepository extends IBaseRepository<AttendanceRecord> {

    @Query(
            """
            SELECT a FROM AttendanceRecord a
            WHERE a.status <> :deletedStatus
              AND a.collaboratorId = :collaboratorId
              AND a.workDate BETWEEN :periodStart AND :periodEnd
            ORDER BY a.workDate
            """)
    List<AttendanceRecord> findByCollaboratorAndPeriod(
            @Param("collaboratorId") UUID collaboratorId,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd,
            @Param("deletedStatus") StatusEnum deletedStatus);
    @Query(
            """
            SELECT a FROM AttendanceRecord a
            WHERE a.status <> :deletedStatus
              AND a.collaboratorId = :collaboratorId
              AND a.workDate BETWEEN :periodStart AND :periodEnd
              AND a.requestStatus IS NULL
            ORDER BY a.workDate DESC
            """)
    List<AttendanceRecord> findWorkdayByCollaboratorAndPeriod(
            @Param("collaboratorId") UUID collaboratorId,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd,
            @Param("deletedStatus") StatusEnum deletedStatus);
    List<AttendanceRecord> findByOccurrenceOriginAndReferenceIdAndStatusNot(
            AttendanceOccurrenceOriginEnum occurrenceOrigin, UUID referenceId, StatusEnum status);

    Optional<AttendanceRecord> findByCollaboratorIdAndWorkDateAndRequestStatusIsNullAndStatusNot(
            UUID collaboratorId, LocalDate workDate, StatusEnum status);

    Optional<AttendanceRecord> findByCollaboratorIdAndWorkDateAndStatusNot(
            UUID collaboratorId, LocalDate workDate, StatusEnum status);

    Optional<AttendanceRecord> findBySourceAndClientRequestIdAndStatusNot(
            AttendanceSourceEnum source, String clientRequestId, StatusEnum status);

    List<AttendanceRecord> findByRequestStatusAndStatusNotOrderBySubmittedAtDesc(String requestStatus, StatusEnum status);

    @Query(
            """
            SELECT a FROM AttendanceRecord a
            WHERE a.status <> :deletedStatus
              AND a.collaboratorId = :collaboratorId
              AND a.requestStatus IS NOT NULL
              AND a.workDate BETWEEN :periodStart AND :periodEnd
            ORDER BY a.submittedAt DESC, a.workDate DESC
            """)
    List<AttendanceRecord> findRequestsByCollaboratorAndPeriod(
            @Param("collaboratorId") UUID collaboratorId,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd,
            @Param("deletedStatus") StatusEnum deletedStatus);
}
