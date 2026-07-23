package br.com.gommo.modules.rh.person.jobvacancy.entity;

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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "job_vacancy")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class JobVacancy extends AuditEntity {
    @Column(name = "job_position_id")
    private UUID jobPositionId;

    @Column(name = "job_title", nullable = false, length = 200)
    private String jobTitle;

    @Column(name = "positions_count", nullable = false)
    private Integer positionsCount;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String activities;

    @Column(columnDefinition = "TEXT")
    private String assignments;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(length = 200)
    private String department;

    @Column(length = 200)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_modality", length = 32)
    private JobVacancyWorkModalityEnum workModality;

    @Enumerated(EnumType.STRING)
    @Column(name = "contract_type", length = 32)
    private JobVacancyContractTypeEnum contractType;

    @Column(name = "work_schedule", length = 80)
    private String workSchedule;

    @Enumerated(EnumType.STRING)
    @Column(name = "seniority_level", length = 32)
    private JobVacancySeniorityEnum seniorityLevel;

    @Column(name = "salary", precision = 14, scale = 2)
    private BigDecimal salary;

    @Column(name = "salary_max", precision = 14, scale = 2)
    private BigDecimal salaryMax;

    @Column(name = "expected_completion_date")
    private LocalDate expectedCompletionDate;

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "target_boards", columnDefinition = "jsonb", nullable = false)
    private List<String> targetBoards = new ArrayList<>();

    @Column(length = 120)
    private String slug;

    @Builder.Default
    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = false;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;
}
