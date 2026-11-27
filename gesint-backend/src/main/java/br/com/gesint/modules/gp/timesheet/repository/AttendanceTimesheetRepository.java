package br.com.gesint.modules.gp.timesheet.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.gp.timesheet.entity.AttendanceTimesheet;
import br.com.gesint.modules.gp.timesheet.entity.TimesheetClosingStatusEnum;

@Repository
public interface AttendanceTimesheetRepository extends IBaseRepository<AttendanceTimesheet> {

    Optional<AttendanceTimesheet> findByCollaboratorIdAndPeriodStartAndPeriodEndAndStatusNot(
            UUID collaboratorId, LocalDate periodStart, LocalDate periodEnd, StatusEnum status);

    List<AttendanceTimesheet> findByPeriodStartAndPeriodEndAndStatusNot(
            LocalDate periodStart, LocalDate periodEnd, StatusEnum status);

    /** Espelho fechado que cobre a data: as marcacoes desse dia ficam travadas. */
    @Query(
            """
            SELECT COUNT(t) > 0 FROM AttendanceTimesheet t
            WHERE t.status <> :deleted
              AND t.collaboratorId = :collaboratorId
              AND t.closingStatus = :closed
              AND t.periodStart <= :date
              AND t.periodEnd >= :date
            """)
    boolean existsClosedCovering(
            @Param("collaboratorId") UUID collaboratorId,
            @Param("date") LocalDate date,
            @Param("closed") TimesheetClosingStatusEnum closed,
            @Param("deleted") StatusEnum deleted);
}
