package br.com.gommo.modules.rh.person.occupationalexam.exam.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class OccupationalExamIndicatorsResponseDto {

    /** % de colaboradores ativos (com cargo) em conformidade com a matriz vigente. */
    private final Double complianceRatePercent;

    private final long activeCollaboratorsWithPosition;
    private final long compliantCollaborators;

    /** % de funcoes ACTIVE com ao menos um ExamRequirement vigente. */
    private final Double matrixCoveragePercent;

    private final long activeJobPositions;
    private final long jobPositionsWithMatrix;

    private final long overdueCount;
    private final long dueIn30Count;
    private final long dueIn60Count;
    private final long dueIn90Count;

    private final List<OccupationalExamResponseDto> overdueExams;
    private final List<OccupationalExamResponseDto> dueIn30Exams;

    private final long dismissalPendingCount;
    private final List<OccupationalExamResponseDto> dismissalPendingExams;

    /**
     * Pendencias documentadas para Fase 3 (dependem do evento eSocial S-2220).
     */
    private final List<String> phase3PendingIndicators;
}
