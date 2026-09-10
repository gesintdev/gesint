package br.com.gommo.modules.dp.occupationalexam.exam.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.occupationalexam.exam.entity.OccupationalExam;
import br.com.gommo.modules.dp.occupationalexam.exam.entity.OccupationalExamLifecycleStatusEnum;
import br.com.gommo.modules.dp.occupationalexam.exam.entity.OccupationalExamResultEnum;
import br.com.gommo.modules.dp.occupationalexam.exam.entity.OccupationalExamTypeEnum;

@Repository
public interface OccupationalExamRepository extends IBaseRepository<OccupationalExam> {

    List<OccupationalExam> findByCollaboratorIdAndStatusNotOrderByDueDateDesc(UUID collaboratorId, StatusEnum status);

    List<OccupationalExam> findByCollaboratorIdAndStatusNotOrderByClinicalExamDateDesc(
            UUID collaboratorId, StatusEnum status);

    List<OccupationalExam> findByCollaboratorIdAndExamTypeAndStatusNot(
            UUID collaboratorId, OccupationalExamTypeEnum examType, StatusEnum status);

    List<OccupationalExam> findByCollaboratorIdInAndExamTypeAndStatusNot(
            List<UUID> collaboratorIds, OccupationalExamTypeEnum examType, StatusEnum status);

    List<OccupationalExam> findByCollaboratorIdAndExamTypeAndResultAndStatusNot(
            UUID collaboratorId,
            OccupationalExamTypeEnum examType,
            OccupationalExamResultEnum result,
            StatusEnum status);

    List<OccupationalExam> findByExamTypeAndDismissalWaiverAppliedAndStatusNot(
            OccupationalExamTypeEnum examType, Boolean dismissalWaiverApplied, StatusEnum status);

    List<OccupationalExam> findByLifecycleStatusAndDueDateBeforeAndStatusNot(
            OccupationalExamLifecycleStatusEnum lifecycleStatus, LocalDate dueDate, StatusEnum status);

    @Query(
            """
            SELECT e FROM OccupationalExam e
            WHERE e.status <> :deletedStatus
              AND e.dueDate IS NOT NULL
              AND e.dueDate >= :from
              AND e.dueDate <= :to
              AND e.lifecycleStatus IN :statuses
            ORDER BY e.dueDate ASC
            """)
    List<OccupationalExam> findDueInWindow(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("statuses") List<OccupationalExamLifecycleStatusEnum> statuses,
            @Param("deletedStatus") StatusEnum deletedStatus);

    @Query(
            """
            SELECT e FROM OccupationalExam e
            WHERE e.status <> :deletedStatus
              AND e.dueDate IS NOT NULL
              AND e.dueDate < :referenceDate
              AND e.lifecycleStatus NOT IN :closedStatuses
            ORDER BY e.dueDate ASC
            """)
    List<OccupationalExam> findOverdue(
            @Param("referenceDate") LocalDate referenceDate,
            @Param("closedStatuses") List<OccupationalExamLifecycleStatusEnum> closedStatuses,
            @Param("deletedStatus") StatusEnum deletedStatus);
}
