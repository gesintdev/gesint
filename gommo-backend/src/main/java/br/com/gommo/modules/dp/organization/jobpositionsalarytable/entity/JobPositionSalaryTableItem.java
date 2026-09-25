package br.com.gommo.modules.dp.organization.jobpositionsalarytable.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "job_position_salary_table_item")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobPositionSalaryTableItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "salary_table_id", nullable = false)
    private JobPositionSalaryTable salaryTable;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "level", nullable = false, columnDefinition = "gommo_types.job_position_salary_level_enum")
    private JobPositionSalaryLevelEnum level;

    @Column(name = "min_salary", nullable = false, precision = 14, scale = 2)
    private BigDecimal minSalary;

    @Column(name = "reference_salary", nullable = false, precision = 14, scale = 2)
    private BigDecimal referenceSalary;

    @Column(name = "max_salary", nullable = false, precision = 14, scale = 2)
    private BigDecimal maxSalary;
}
