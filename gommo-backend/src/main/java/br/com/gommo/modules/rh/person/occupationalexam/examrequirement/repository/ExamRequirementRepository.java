package br.com.gommo.modules.rh.person.occupationalexam.examrequirement.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.occupationalexam.exam.entity.OccupationalExamTypeEnum;
import br.com.gommo.modules.rh.person.occupationalexam.examrequirement.entity.ExamRequirement;

@Repository
public interface ExamRequirementRepository extends IBaseRepository<ExamRequirement> {

    @Query(
            """
            SELECT e FROM ExamRequirement e
            WHERE e.status <> :deletedStatus
              AND e.jobPositionId = :jobPositionId
              AND e.examType = :examType
              AND e.validFrom <= :referenceDate
              AND (e.validUntil IS NULL OR e.validUntil >= :referenceDate)
            ORDER BY e.versionNumber DESC
            """)
    List<ExamRequirement> findVigenteCandidates(
            @Param("jobPositionId") UUID jobPositionId,
            @Param("examType") OccupationalExamTypeEnum examType,
            @Param("referenceDate") LocalDate referenceDate,
            @Param("deletedStatus") StatusEnum deletedStatus);

    default Optional<ExamRequirement> findVigente(
            UUID jobPositionId, OccupationalExamTypeEnum examType, LocalDate referenceDate) {
        return findVigenteCandidates(jobPositionId, examType, referenceDate, StatusEnum.DELETED).stream()
                .findFirst();
    }

    @Query(
            """
            SELECT COALESCE(MAX(e.versionNumber), 0) FROM ExamRequirement e
            WHERE e.status <> :deletedStatus
              AND e.jobPositionId = :jobPositionId
              AND e.examType = :examType
            """)
    Integer findMaxVersionNumber(
            @Param("jobPositionId") UUID jobPositionId,
            @Param("examType") OccupationalExamTypeEnum examType,
            @Param("deletedStatus") StatusEnum deletedStatus);

    List<ExamRequirement> findByJobPositionIdAndExamTypeAndValidUntilIsNullAndStatusNot(
            UUID jobPositionId, OccupationalExamTypeEnum examType, StatusEnum status);
}
