package br.com.gommo.modules.rh.person.jobvacancyapplication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobVacancyApplicationStageCommentDto {
    private String text;
    /** ISO-8601 (string) — Hibernate JSONB nao serializa OffsetDateTime por padrao. */
    private String updatedAt;
    private UUID updatedBy;
}
