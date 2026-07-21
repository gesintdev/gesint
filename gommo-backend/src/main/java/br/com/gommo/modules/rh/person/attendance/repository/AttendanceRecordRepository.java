package br.com.gommo.modules.rh.person.attendance.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceOccurrenceOriginEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceRecord;

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
            ORDER BY a.workDate DESC
            """)
    List<AttendanceRecord> findWorkdayByCollaboratorAndPeriod(
            @Param("collaboratorId") UUID collaboratorId,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd,
            @Param("deletedStatus") StatusEnum deletedStatus);

    List<AttendanceRecord> findByOccurrenceOriginAndReferenceIdAndStatusNot(
            AttendanceOccurrenceOriginEnum occurrenceOrigin, UUID referenceId, StatusEnum status);

    Optional<AttendanceRecord> findByCollaboratorIdAndWorkDateAndStatusNot(
            UUID collaboratorId, LocalDate workDate, StatusEnum status);

    Page<AttendanceRecord> findByCollaboratorIdAndStatusNotOrderByWorkDateDesc(
            UUID collaboratorId, StatusEnum status, Pageable pageable);

    @Query(
            """
            SELECT a FROM AttendanceRecord a
            WHERE a.status <> :deletedStatus
              AND a.workDate BETWEEN :periodStart AND :periodEnd
            ORDER BY a.workDate DESC, a.createdAt DESC
            """)
    List<AttendanceRecord> findByWorkDateBetweenAndStatusNot(
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd,
            @Param("deletedStatus") StatusEnum deletedStatus);
}
