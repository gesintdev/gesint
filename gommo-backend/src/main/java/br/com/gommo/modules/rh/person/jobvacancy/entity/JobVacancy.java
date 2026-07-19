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

import java.time.LocalDate;
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

    @Enumerated(EnumType.STRING)
    @Column(name = "seniority_level", length = 32)
    private JobVacancySeniorityEnum seniorityLevel;

    @Column(name = "expected_completion_date")
    private LocalDate expectedCompletionDate;

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "target_boards", columnDefinition = "jsonb", nullable = false)
    private List<String> targetBoards = new ArrayList<>();
}
