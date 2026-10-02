package br.com.gommo.modules.dp.occupationalexam.complementaryexam.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.UUID;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.envers.Audited;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.branch.BranchScopedEntity;

@Entity
@Audited
@Table(name = "complementary_exam")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class ComplementaryExam extends BranchScopedEntity {

    @Column(name = "occupational_exam_id", nullable = false)
    private UUID occupationalExamId;

    @Column(name = "procedure_code", nullable = false, length = 10)
    private String procedureCode;

    @Column(name = "performed_date")
    private LocalDate performedDate;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "complementary_exam_result_enum")
    private ComplementaryExamResultEnum result;
}
