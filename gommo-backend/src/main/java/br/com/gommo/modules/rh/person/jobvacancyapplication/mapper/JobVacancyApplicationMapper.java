package br.com.gommo.modules.rh.person.jobvacancyapplication.mapper;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.rh.person.candidate.entity.Candidate;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancy;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationRequestDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationResponseDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationStageCommentDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplication;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplicationStatusEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.dto.InterviewCompetencyAverageDto;

@Component
public class JobVacancyApplicationMapper {
    public JobVacancyApplication toEntity(JobVacancyApplicationRequestDto dto) {
        JobVacancyApplicationStatusEnum status =
                dto.getApplicationStatus() != null
                        ? dto.getApplicationStatus()
                        : JobVacancyApplicationStatusEnum.APPLIED;
        OffsetDateTime appliedAt = dto.getAppliedAt() != null ? dto.getAppliedAt() : OffsetDateTime.now();
        return JobVacancyApplication.builder()
                .jobVacancyId(dto.getJobVacancyId())
                .candidateId(dto.getCandidateId())
                .applicationStatus(status)
                .appliedAt(appliedAt)
                .kanbanColumnKey(normalizeKey(dto.getKanbanColumnKey()))
                .build();
    }

    public void updateEntity(JobVacancyApplication entity, JobVacancyApplicationRequestDto dto) {
        entity.setJobVacancyId(dto.getJobVacancyId());
        entity.setCandidateId(dto.getCandidateId());
        if (dto.getApplicationStatus() != null) {
            entity.setApplicationStatus(dto.getApplicationStatus());
        }
        if (dto.getAppliedAt() != null) {
            entity.setAppliedAt(dto.getAppliedAt());
        }
        if (dto.getKanbanColumnKey() != null) {
            entity.setKanbanColumnKey(normalizeKey(dto.getKanbanColumnKey()));
        }
    }

    public JobVacancyApplicationResponseDto toResponse(
            JobVacancyApplication entity, JobVacancy vacancy, Candidate candidate) {
        return toResponse(entity, vacancy, candidate, List.of());
    }

    public JobVacancyApplicationResponseDto toResponse(
            JobVacancyApplication entity,
            JobVacancy vacancy,
            Candidate candidate,
            List<InterviewCompetencyAverageDto> interviewAverages) {
        return JobVacancyApplicationResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .jobVacancyId(entity.getJobVacancyId())
                .jobVacancyTitle(vacancy != null ? vacancy.getJobTitle() : null)
                .admissionProcessId(entity.getAdmissionProcessId())
                .candidateId(entity.getCandidateId())
                .candidateFullName(candidate != null ? candidate.getFullName() : null)
                .candidateCpf(candidate != null ? candidate.getCpf() : null)
                .candidateEmail(candidate != null ? candidate.getEmail() : null)
                .candidatePhone(candidate != null ? candidate.getPhone() : null)
                .applicationStatus(entity.getApplicationStatus())
                .kanbanColumnKey(entity.getKanbanColumnKey())
                .stageComments(copyStageComments(entity.getStageComments()))
                .appliedAt(entity.getAppliedAt())
                .salaryExpectation(entity.getSalaryExpectation())
                .aiScore(entity.getAiScore())
                .aiStatus(entity.getAiStatus())
                .aiAnalyzedAt(entity.getAiAnalyzedAt())
                .aiAnalysis(copyAiAnalysis(entity.getAiAnalysis()))
                .rejectionReason(entity.getRejectionReason())
                .rejectionReasonLabel(entity.getRejectionReason() != null ? entity.getRejectionReason().getLabel() : null)
                .rejectionRequirement(entity.getRejectionRequirement())
                .rejectionNote(entity.getRejectionNote())
                .rejectedAt(entity.getRejectedAt())
                .rejectedBy(entity.getRejectedBy())
                .rejectedByName(entity.getRejectedByName())
                .rejectionFeedbackStatus(entity.getRejectionFeedbackStatus())
                .rejectionFeedbackAt(entity.getRejectionFeedbackAt())
                .rejectionFeedbackDetail(entity.getRejectionFeedbackDetail())
                .interviewAverages(
                        interviewAverages == null ? new ArrayList<>() : new ArrayList<>(interviewAverages))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private Map<String, JobVacancyApplicationStageCommentDto> copyStageComments(
            Map<String, JobVacancyApplicationStageCommentDto> source) {
        if (source == null || source.isEmpty()) {
            return Map.of();
        }
        Map<String, JobVacancyApplicationStageCommentDto> copy = new LinkedHashMap<>();
        source.forEach((key, value) -> {
            if (key == null || key.isBlank() || value == null) return;
            copy.put(
                    key,
                    JobVacancyApplicationStageCommentDto.builder()
                            .text(value.getText())
                            .updatedAt(value.getUpdatedAt())
                            .updatedBy(value.getUpdatedBy())
                            .build());
        });
        return copy;
    }

    private Map<String, Object> copyAiAnalysis(Map<String, Object> source) {
        if (source == null || source.isEmpty()) {
            return Map.of();
        }
        Map<String, Object> copy = new LinkedHashMap<>();
        source.forEach((key, value) -> {
            if (key == null || key.isBlank()) {
                return;
            }
            copy.put(key, value);
        });
        return copy;
    }

    private String normalizeKey(String value) {
        if (value == null) return null;
        String trimmed = value.trim().toLowerCase();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
