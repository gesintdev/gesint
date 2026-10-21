package br.com.gesint.modules.rh.person.jobvacancyapplication.interviewevaluation.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.audit.CurrentAuditor;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.organization.jobpositioncompetency.entity.JobPositionCompetency;
import br.com.gesint.modules.dp.organization.jobpositioncompetency.entity.JobPositionCompetencyUsageEnum;
import br.com.gesint.modules.dp.organization.jobpositioncompetency.repository.JobPositionCompetencyRepository;
import br.com.gesint.modules.rh.person.admissionprocess.kanbancolumn.entity.AdmissionProcessKanbanColumn;
import br.com.gesint.modules.rh.person.admissionprocess.kanbancolumn.repository.AdmissionProcessKanbanColumnRepository;
import br.com.gesint.modules.rh.person.developmentplan.competency.entity.Competency;
import br.com.gesint.modules.rh.person.developmentplan.competency.repository.CompetencyRepository;
import br.com.gesint.modules.rh.person.developmentplan.proficiencylevel.entity.ProficiencyLevel;
import br.com.gesint.modules.rh.person.developmentplan.proficiencylevel.repository.ProficiencyLevelRepository;
import br.com.gesint.modules.rh.person.jobvacancy.entity.JobVacancy;
import br.com.gesint.modules.rh.person.jobvacancy.repository.JobVacancyRepository;
import br.com.gesint.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplication;
import br.com.gesint.modules.rh.person.jobvacancyapplication.exception.JobVacancyApplicationException;
import br.com.gesint.modules.rh.person.jobvacancyapplication.interviewevaluation.dto.InterviewCompetencyAverageDto;
import br.com.gesint.modules.rh.person.jobvacancyapplication.interviewevaluation.dto.InterviewCompetencyDto;
import br.com.gesint.modules.rh.person.jobvacancyapplication.interviewevaluation.dto.InterviewEvaluationViewDto;
import br.com.gesint.modules.rh.person.jobvacancyapplication.interviewevaluation.dto.InterviewScoreItemDto;
import br.com.gesint.modules.rh.person.jobvacancyapplication.interviewevaluation.dto.InterviewScoreViewDto;
import br.com.gesint.modules.rh.person.jobvacancyapplication.interviewevaluation.dto.InterviewScorecardResponseDto;
import br.com.gesint.modules.rh.person.jobvacancyapplication.interviewevaluation.dto.InterviewScorecardUpsertRequestDto;
import br.com.gesint.modules.rh.person.jobvacancyapplication.interviewevaluation.entity.InterviewEvaluationStatusEnum;
import br.com.gesint.modules.rh.person.jobvacancyapplication.interviewevaluation.entity.JobApplicationInterviewEvaluation;
import br.com.gesint.modules.rh.person.jobvacancyapplication.interviewevaluation.entity.JobApplicationInterviewScore;
import br.com.gesint.modules.rh.person.jobvacancyapplication.interviewevaluation.repository.JobApplicationInterviewEvaluationRepository;
import br.com.gesint.modules.rh.person.jobvacancyapplication.interviewevaluation.repository.JobApplicationInterviewScoreRepository;
import br.com.gesint.modules.rh.person.jobvacancyapplication.repository.JobVacancyApplicationRepository;
import br.com.gesint.modules.rh.person.jobvacancycompetency.entity.JobVacancyCompetency;
import br.com.gesint.modules.rh.person.jobvacancycompetency.repository.JobVacancyCompetencyRepository;
import br.com.gesint.modules.root.entity.AppUser;
import br.com.gesint.modules.root.repository.AppUserRepository;

@Service
public class InterviewScorecardService {

    private final JobVacancyApplicationRepository applicationRepository;
    private final AdmissionProcessKanbanColumnRepository kanbanColumnRepository;
    private final JobVacancyRepository jobVacancyRepository;
    private final JobPositionCompetencyRepository jobPositionCompetencyRepository;
    private final JobVacancyCompetencyRepository jobVacancyCompetencyRepository;
    private final CompetencyRepository competencyRepository;
    private final ProficiencyLevelRepository proficiencyLevelRepository;
    private final JobApplicationInterviewEvaluationRepository evaluationRepository;
    private final JobApplicationInterviewScoreRepository scoreRepository;
    private final AppUserRepository appUserRepository;

    public InterviewScorecardService(
            JobVacancyApplicationRepository applicationRepository,
            AdmissionProcessKanbanColumnRepository kanbanColumnRepository,
            JobVacancyRepository jobVacancyRepository,
            JobPositionCompetencyRepository jobPositionCompetencyRepository,
            JobVacancyCompetencyRepository jobVacancyCompetencyRepository,
            CompetencyRepository competencyRepository,
            ProficiencyLevelRepository proficiencyLevelRepository,
            JobApplicationInterviewEvaluationRepository evaluationRepository,
            JobApplicationInterviewScoreRepository scoreRepository,
            AppUserRepository appUserRepository) {
        this.applicationRepository = applicationRepository;
        this.kanbanColumnRepository = kanbanColumnRepository;
        this.jobVacancyRepository = jobVacancyRepository;
        this.jobPositionCompetencyRepository = jobPositionCompetencyRepository;
        this.jobVacancyCompetencyRepository = jobVacancyCompetencyRepository;
        this.competencyRepository = competencyRepository;
        this.proficiencyLevelRepository = proficiencyLevelRepository;
        this.evaluationRepository = evaluationRepository;
        this.scoreRepository = scoreRepository;
        this.appUserRepository = appUserRepository;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyAuthority('jobvacancyapplication:read', 'admission:read')")
    public InterviewScorecardResponseDto getScorecard(UUID applicationId, String columnKey) {
        JobVacancyApplication application = requireApplication(applicationId);
        String normalizedKey = requireInterviewColumnKey(columnKey);
        List<InterviewCompetencyDto> competencies = resolveCompetencies(application.getJobVacancyId());
        Map<UUID, Competency> competencyById = loadCompetencies(competencies);

        List<JobApplicationInterviewEvaluation> evaluations =
                evaluationRepository.findByJobVacancyApplicationIdAndColumnKeyAndStatusNot(
                        applicationId, normalizedKey, StatusEnum.DELETED);
        Map<UUID, List<JobApplicationInterviewScore>> scoresByEvaluation =
                loadScoresByEvaluation(evaluations);

        UUID currentUserId = requireCurrentUserId();
        boolean allSubmitted = !evaluations.isEmpty()
                && evaluations.stream()
                        .allMatch(evaluation ->
                                evaluation.getEvaluationStatus() == InterviewEvaluationStatusEnum.SUBMITTED);
        boolean currentUserSubmitted = evaluations.stream()
                .anyMatch(evaluation -> Objects.equals(evaluation.getEvaluatorUserId(), currentUserId)
                        && evaluation.getEvaluationStatus() == InterviewEvaluationStatusEnum.SUBMITTED);
        // Consolidação só depois que todos os avaliadores enviarem (RN-36).
        boolean canSeeOthers = allSubmitted && currentUserSubmitted;

        InterviewEvaluationViewDto myEvaluation = null;
        List<InterviewEvaluationViewDto> others = new ArrayList<>();
        int submittedCount = 0;

        for (JobApplicationInterviewEvaluation evaluation : evaluations) {
            boolean mine = Objects.equals(evaluation.getEvaluatorUserId(), currentUserId);
            boolean submitted = evaluation.getEvaluationStatus() == InterviewEvaluationStatusEnum.SUBMITTED;
            if (submitted) {
                submittedCount++;
            }
            boolean scoresVisible = mine || (canSeeOthers && submitted);
            InterviewEvaluationViewDto view = toEvaluationView(
                    evaluation, scoresByEvaluation.getOrDefault(evaluation.getId(), List.of()), competencyById, mine, scoresVisible);
            if (mine) {
                myEvaluation = view;
            } else if (submitted) {
                others.add(view);
            }
        }

        return InterviewScorecardResponseDto.builder()
                .applicationId(applicationId)
                .columnKey(normalizedKey)
                .interviewColumn(true)
                .canSeeOthers(canSeeOthers)
                .submittedCount(submittedCount)
                .competencies(competencies)
                .myEvaluation(myEvaluation)
                .otherEvaluations(canSeeOthers ? others : List.of())
                .averages(
                        canSeeOthers
                                ? computeAverages(evaluations, scoresByEvaluation, competencyById)
                                : List.of())
                .build();
    }

    @Transactional
    @PreAuthorize("hasAnyAuthority('jobvacancyapplication:write', 'admission:write')")
    public InterviewScorecardResponseDto saveDraft(UUID applicationId, InterviewScorecardUpsertRequestDto request) {
        return upsert(applicationId, request, false);
    }

    @Transactional
    @PreAuthorize("hasAnyAuthority('jobvacancyapplication:write', 'admission:write')")
    public InterviewScorecardResponseDto submit(UUID applicationId, InterviewScorecardUpsertRequestDto request) {
        return upsert(applicationId, request, true);
    }

    @Transactional(readOnly = true)
    public Map<UUID, List<InterviewCompetencyAverageDto>> averagesForApplications(
            CollectionAwareApplications applications) {
        if (applications.ids().isEmpty()) {
            return Map.of();
        }

        List<JobApplicationInterviewEvaluation> evaluations =
                evaluationRepository.findByJobVacancyApplicationIdInAndEvaluationStatusAndStatusNot(
                        applications.ids(), InterviewEvaluationStatusEnum.SUBMITTED, StatusEnum.DELETED);
        if (evaluations.isEmpty()) {
            return Map.of();
        }

        Map<UUID, List<JobApplicationInterviewScore>> scoresByEvaluation = loadScoresByEvaluation(evaluations);
        Set<UUID> competencyIds = scoresByEvaluation.values().stream()
                .flatMap(List::stream)
                .map(JobApplicationInterviewScore::getCompetencyId)
                .collect(Collectors.toSet());
        Map<UUID, Competency> competencyById = competencyRepository.findAllById(competencyIds).stream()
                .collect(Collectors.toMap(Competency::getId, Function.identity()));

        Map<UUID, Map<String, List<JobApplicationInterviewEvaluation>>> byAppAndColumn = new HashMap<>();
        for (JobApplicationInterviewEvaluation evaluation : evaluations) {
            byAppAndColumn
                    .computeIfAbsent(evaluation.getJobVacancyApplicationId(), ignored -> new HashMap<>())
                    .computeIfAbsent(evaluation.getColumnKey(), ignored -> new ArrayList<>())
                    .add(evaluation);
        }

        Map<UUID, List<InterviewCompetencyAverageDto>> result = new HashMap<>();
        for (Map.Entry<UUID, Map<String, List<JobApplicationInterviewEvaluation>>> appEntry :
                byAppAndColumn.entrySet()) {
            String currentColumn = applications.columnKeyByApplicationId().get(appEntry.getKey());
            if (currentColumn == null || currentColumn.isBlank()) {
                continue;
            }
            List<JobApplicationInterviewEvaluation> columnEvals =
                    appEntry.getValue().getOrDefault(currentColumn, List.of());
            if (columnEvals.isEmpty()) {
                continue;
            }
            // averagesForApplications só recebe SUBMITTED; consolida se houver ao menos uma.
            // Médias no kanban só quando todos os avaliadores da coluna enviaram.
            List<JobApplicationInterviewEvaluation> allForColumn =
                    evaluationRepository.findByJobVacancyApplicationIdAndColumnKeyAndStatusNot(
                            appEntry.getKey(), currentColumn, StatusEnum.DELETED);
            boolean allSubmitted = !allForColumn.isEmpty()
                    && allForColumn.stream()
                            .allMatch(evaluation ->
                                    evaluation.getEvaluationStatus() == InterviewEvaluationStatusEnum.SUBMITTED);
            if (!allSubmitted) {
                continue;
            }
            result.put(appEntry.getKey(), computeAverages(columnEvals, scoresByEvaluation, competencyById));
        }
        return result;
    }

    public record CollectionAwareApplications(
            Set<UUID> ids, Map<UUID, String> columnKeyByApplicationId) {}

    private InterviewScorecardResponseDto upsert(
            UUID applicationId, InterviewScorecardUpsertRequestDto request, boolean submit) {
        JobVacancyApplication application = requireApplication(applicationId);
        String normalizedKey = requireInterviewColumnKey(request.getColumnKey());
        List<InterviewCompetencyDto> competencies = resolveCompetencies(application.getJobVacancyId());
        if (competencies.isEmpty()) {
            throw JobVacancyApplicationException.interviewCompetenciesMissing();
        }

        Set<Integer> validScores = proficiencyLevelRepository
                .findAllByStatusNotOrderByLevelOrderAsc(StatusEnum.DELETED)
                .stream()
                .map(ProficiencyLevel::getLevelOrder)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        if (validScores.isEmpty()) {
            validScores = Set.of(1, 2, 3, 4, 5);
        }

        Map<UUID, InterviewScoreItemDto> requestedByCompetency = new LinkedHashMap<>();
        List<InterviewScoreItemDto> requestScores =
                request.getScores() == null ? List.of() : request.getScores();
        for (InterviewScoreItemDto item : requestScores) {
            if (item == null || item.getCompetencyId() == null) {
                continue;
            }
            requestedByCompetency.put(item.getCompetencyId(), item);
        }

        Set<UUID> expectedIds = competencies.stream()
                .map(InterviewCompetencyDto::getCompetencyId)
                .collect(Collectors.toCollection(HashSet::new));

        if (submit) {
            if (request.getRecommendation() == null) {
                throw JobVacancyApplicationException.interviewRecommendationRequired();
            }
            for (UUID competencyId : expectedIds) {
                InterviewScoreItemDto item = requestedByCompetency.get(competencyId);
                if (item == null || item.getScore() == null) {
                    throw JobVacancyApplicationException.interviewScoreIncomplete();
                }
                if (!validScores.contains(item.getScore())) {
                    throw JobVacancyApplicationException.interviewScoreInvalid();
                }
                String justification = trimToNull(item.getJustification());
                if (justification == null) {
                    throw JobVacancyApplicationException.interviewJustificationRequired();
                }
            }
        } else {
            for (InterviewScoreItemDto item : requestedByCompetency.values()) {
                if (item.getScore() != null && !validScores.contains(item.getScore())) {
                    throw JobVacancyApplicationException.interviewScoreInvalid();
                }
                if (!expectedIds.contains(item.getCompetencyId())) {
                    throw JobVacancyApplicationException.interviewCompetencyNotInScorecard();
                }
            }
        }

        UUID currentUserId = requireCurrentUserId();
        JobApplicationInterviewEvaluation evaluation = evaluationRepository
                .findByJobVacancyApplicationIdAndColumnKeyAndEvaluatorUserIdAndStatusNot(
                        applicationId, normalizedKey, currentUserId, StatusEnum.DELETED)
                .orElseGet(() -> JobApplicationInterviewEvaluation.builder()
                        .status(StatusEnum.ACTIVE)
                        .companyId(application.getCompanyId())
                        .jobVacancyApplicationId(applicationId)
                        .columnKey(normalizedKey)
                        .evaluatorUserId(currentUserId)
                        .evaluatorName(resolveEvaluatorName(currentUserId))
                        .evaluationStatus(InterviewEvaluationStatusEnum.DRAFT)
                        .build());

        if (evaluation.getEvaluationStatus() == InterviewEvaluationStatusEnum.SUBMITTED) {
            throw JobVacancyApplicationException.interviewAlreadySubmitted();
        }

        evaluation.setEvaluatorName(resolveEvaluatorName(currentUserId));
        evaluation.setRecommendation(request.getRecommendation());
        if (submit) {
            evaluation.setEvaluationStatus(InterviewEvaluationStatusEnum.SUBMITTED);
            evaluation.setSubmittedAt(OffsetDateTime.now());
        } else {
            evaluation.setEvaluationStatus(InterviewEvaluationStatusEnum.DRAFT);
            evaluation.setSubmittedAt(null);
        }
        evaluation = evaluationRepository.save(evaluation);

        List<JobApplicationInterviewScore> existing =
                scoreRepository.findByEvaluationIdAndStatusNot(evaluation.getId(), StatusEnum.DELETED);
        Map<UUID, JobApplicationInterviewScore> existingByCompetency = existing.stream()
                .collect(Collectors.toMap(JobApplicationInterviewScore::getCompetencyId, Function.identity()));

        Set<UUID> keep = new HashSet<>();
        for (UUID competencyId : expectedIds) {
            InterviewScoreItemDto item = requestedByCompetency.get(competencyId);
            if (item == null || item.getScore() == null) {
                continue;
            }
            keep.add(competencyId);
            JobApplicationInterviewScore score = existingByCompetency.get(competencyId);
            if (score == null) {
                score = JobApplicationInterviewScore.builder()
                        .status(StatusEnum.ACTIVE)
                        .companyId(application.getCompanyId())
                        .evaluationId(evaluation.getId())
                        .competencyId(competencyId)
                        .build();
            }
            score.setScore(item.getScore());
            score.setJustification(item.getJustification() == null ? "" : item.getJustification().trim());
            scoreRepository.save(score);
        }

        for (JobApplicationInterviewScore leftover : existing) {
            if (!keep.contains(leftover.getCompetencyId())) {
                leftover.setStatus(StatusEnum.DELETED);
                scoreRepository.save(leftover);
            }
        }

        return getScorecard(applicationId, normalizedKey);
    }

    private List<InterviewCompetencyDto> resolveCompetencies(UUID jobVacancyId) {
        JobVacancy vacancy = jobVacancyRepository
                .findByIdAndStatusNot(jobVacancyId, StatusEnum.DELETED)
                .orElseThrow(JobVacancyApplicationException::vacancyNotFound);

        if (vacancy.getJobPositionId() != null) {
            List<JobPositionCompetency> positionRows =
                    jobPositionCompetencyRepository
                            .findByJobPositionIdOrdered(vacancy.getJobPositionId(), StatusEnum.DELETED)
                            .stream()
                            .filter(row -> row.getValidUntil() == null)
                            .toList();
            List<JobPositionCompetency> interviewRows = positionRows.stream()
                    .filter(row -> row.getUsedIn() != null
                            && row.getUsedIn().contains(JobPositionCompetencyUsageEnum.INTERVIEW))
                    .toList();
            List<JobPositionCompetency> selected = interviewRows.isEmpty() ? positionRows : interviewRows;
            if (!selected.isEmpty()) {
                return toCompetencyDtos(
                        selected.stream().map(JobPositionCompetency::getCompetencyId).toList(), "JOB_POSITION");
            }
        }

        List<UUID> vacancyCompetencyIds = jobVacancyCompetencyRepository
                .findByJobVacancyIdOrdered(jobVacancyId, StatusEnum.DELETED)
                .stream()
                .map(JobVacancyCompetency::getCompetencyId)
                .toList();
        return toCompetencyDtos(vacancyCompetencyIds, "JOB_VACANCY");
    }

    private List<InterviewCompetencyDto> toCompetencyDtos(List<UUID> competencyIds, String source) {
        if (competencyIds.isEmpty()) {
            return List.of();
        }
        Map<UUID, Competency> byId = competencyRepository.findAllById(competencyIds).stream()
                .filter(competency -> competency.getStatus() != StatusEnum.DELETED)
                .collect(Collectors.toMap(Competency::getId, Function.identity()));
        List<InterviewCompetencyDto> result = new ArrayList<>();
        for (UUID competencyId : competencyIds) {
            Competency competency = byId.get(competencyId);
            if (competency == null) {
                continue;
            }
            result.add(InterviewCompetencyDto.builder()
                    .competencyId(competency.getId())
                    .competencyName(competency.getName())
                    .competencyType(competency.getType())
                    .description(competency.getDescription())
                    .interviewGuideQuestion(competency.getInterviewGuideQuestion())
                    .source(source)
                    .build());
        }
        return result;
    }

    private Map<UUID, Competency> loadCompetencies(List<InterviewCompetencyDto> competencies) {
        Set<UUID> ids = competencies.stream()
                .map(InterviewCompetencyDto::getCompetencyId)
                .collect(Collectors.toSet());
        if (ids.isEmpty()) {
            return Map.of();
        }
        return competencyRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Competency::getId, Function.identity()));
    }

    private Map<UUID, List<JobApplicationInterviewScore>> loadScoresByEvaluation(
            List<JobApplicationInterviewEvaluation> evaluations) {
        if (evaluations.isEmpty()) {
            return Map.of();
        }
        Set<UUID> evaluationIds =
                evaluations.stream().map(JobApplicationInterviewEvaluation::getId).collect(Collectors.toSet());
        return scoreRepository.findByEvaluationIdInAndStatusNot(evaluationIds, StatusEnum.DELETED).stream()
                .collect(Collectors.groupingBy(JobApplicationInterviewScore::getEvaluationId));
    }

    private List<InterviewCompetencyAverageDto> computeAverages(
            List<JobApplicationInterviewEvaluation> evaluations,
            Map<UUID, List<JobApplicationInterviewScore>> scoresByEvaluation,
            Map<UUID, Competency> competencyById) {
        Map<UUID, List<Integer>> scoresByCompetency = new LinkedHashMap<>();
        for (JobApplicationInterviewEvaluation evaluation : evaluations) {
            if (evaluation.getEvaluationStatus() != InterviewEvaluationStatusEnum.SUBMITTED) {
                continue;
            }
            for (JobApplicationInterviewScore score :
                    scoresByEvaluation.getOrDefault(evaluation.getId(), List.of())) {
                scoresByCompetency
                        .computeIfAbsent(score.getCompetencyId(), ignored -> new ArrayList<>())
                        .add(score.getScore());
            }
        }

        List<InterviewCompetencyAverageDto> averages = new ArrayList<>();
        for (Map.Entry<UUID, List<Integer>> entry : scoresByCompetency.entrySet()) {
            List<Integer> values = entry.getValue();
            if (values.isEmpty()) {
                continue;
            }
            double sum = values.stream().mapToInt(Integer::intValue).sum();
            BigDecimal average = BigDecimal.valueOf(sum / values.size()).setScale(1, RoundingMode.HALF_UP);
            Competency competency = competencyById.get(entry.getKey());
            averages.add(InterviewCompetencyAverageDto.builder()
                    .competencyId(entry.getKey())
                    .competencyName(competency != null ? competency.getName() : null)
                    .average(average)
                    .submissionsCount(values.size())
                    .build());
        }
        return averages;
    }

    private InterviewEvaluationViewDto toEvaluationView(
            JobApplicationInterviewEvaluation evaluation,
            List<JobApplicationInterviewScore> scores,
            Map<UUID, Competency> competencyById,
            boolean mine,
            boolean scoresVisible) {
        List<InterviewScoreViewDto> scoreViews = new ArrayList<>();
        if (scoresVisible) {
            for (JobApplicationInterviewScore score : scores) {
                Competency competency = competencyById.get(score.getCompetencyId());
                scoreViews.add(InterviewScoreViewDto.builder()
                        .competencyId(score.getCompetencyId())
                        .competencyName(competency != null ? competency.getName() : null)
                        .score(score.getScore())
                        .justification(score.getJustification())
                        .build());
            }
        }
        return InterviewEvaluationViewDto.builder()
                .id(evaluation.getId())
                .evaluatorUserId(evaluation.getEvaluatorUserId())
                .evaluatorName(evaluation.getEvaluatorName())
                .evaluationStatus(evaluation.getEvaluationStatus())
                .recommendation(evaluation.getRecommendation())
                .submittedAt(evaluation.getSubmittedAt())
                .mine(mine)
                .scoresVisible(scoresVisible)
                .scores(scoreViews)
                .build();
    }

    private JobVacancyApplication requireApplication(UUID applicationId) {
        return applicationRepository
                .findByIdAndStatusNot(applicationId, StatusEnum.DELETED)
                .orElseThrow(JobVacancyApplicationException::notFound);
    }

    private String requireInterviewColumnKey(String columnKey) {
        String normalized = normalizeColumnKey(columnKey);
        if (normalized == null) {
            throw JobVacancyApplicationException.interviewColumnRequired();
        }
        AdmissionProcessKanbanColumn column = kanbanColumnRepository
                .findAllByStatusNotOrderByDisplayOrderAscNameAsc(StatusEnum.DELETED)
                .stream()
                .filter(item -> normalized.equals(item.getColumnKey()))
                .findFirst()
                .orElseThrow(JobVacancyApplicationException::stageCommentColumnNotFound);
        if (!column.isInterviewColumn()) {
            throw JobVacancyApplicationException.interviewColumnNotEnabled();
        }
        return normalized;
    }

    private UUID requireCurrentUserId() {
        return CurrentAuditor.userId().orElseThrow(JobVacancyApplicationException::interviewEvaluatorRequired);
    }

    private String resolveEvaluatorName(UUID userId) {
        return appUserRepository
                .findById(userId)
                .map(AppUser::getName)
                .filter(name -> name != null && !name.isBlank())
                .orElse(null);
    }

    private String normalizeColumnKey(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim().toLowerCase();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
