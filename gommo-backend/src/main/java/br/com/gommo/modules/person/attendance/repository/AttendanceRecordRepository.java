package br.com.gommo.modules.person.attendance.repository;
import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.modules.person.attendance.entity.AttendanceRecord;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface AttendanceRecordRepository extends IBaseRepository<AttendanceRecord> {

    @Query("""
            SELECT a FROM AttendanceRecord a
            WHERE a.status <> br.com.gommo.core.entity.StatusEnum.DELETED
              AND a.collaboratorId = :collaboratorId
              AND a.workDate BETWEEN :periodStart AND :periodEnd
            ORDER BY a.workDate
            """)
    List<AttendanceRecord> findByCollaboratorAndPeriod(
            @Param("collaboratorId") UUID collaboratorId,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd);
}
