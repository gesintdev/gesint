package br.com.gommo.modules.rh.person.occupationalexam.examrequirement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.entity.AuditEntity;
import br.com.gommo.modules.rh.person.occupationalexam.exam.entity.OccupationalExamTypeEnum;

@Entity
@Table(name = "exam_requirement")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ExamRequirement extends AuditEntity {

    @Column(name = "job_position_id", nullable = false)
    private UUID jobPositionId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "exam_type", nullable = false, columnDefinition = "occupational_exam_type_enum")
    private OccupationalExamTypeEnum examType;

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "complementary_procedure_codes", columnDefinition = "jsonb")
    private List<String> complementaryProcedureCodes = new ArrayList<>();

    @Column(name = "periodicity_months")
    private Integer periodicityMonths;

    @Column(name = "risk_basis", columnDefinition = "TEXT")
    private String riskBasis;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "valid_from", nullable = false)
    private LocalDate validFrom;

    @Column(name = "valid_until")
    private LocalDate validUntil;
}
