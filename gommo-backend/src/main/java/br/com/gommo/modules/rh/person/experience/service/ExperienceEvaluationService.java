package br.com.gommo.modules.rh.person.experience.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
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

import br.com.gommo.core.audit.CurrentAuditor;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.offboarding.dto.OffboardingRequestDto;
import br.com.gommo.modules.dp.offboarding.dto.OffboardingResponseDto;
import br.com.gommo.modules.dp.offboarding.entity.DismissalTypeEnum;
import br.com.gommo.modules.dp.offboarding.service.IOffboardingService;
import br.com.gommo.modules.dp.organization.jobposition.entity.JobPosition;
import br.com.gommo.modules.dp.organization.jobposition.repository.JobPositionRepository;
import br.com.gommo.modules.dp.organization.jobpositioncompetency.entity.JobPositionCompetency;
import br.com.gommo.modules.dp.organization.jobpositioncompetency.entity.JobPositionCompetencyUsageEnum;
import br.com.gommo.modules.dp.organization.jobpositioncompetency.repository.JobPositionCompetencyRepository;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gommo.modules.rh.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gommo.modules.rh.person.collaborators.people.entity.Collaborator;
import br.com.gommo.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gommo.modules.rh.person.contract.repository.EmploymentContractRepository;
import br.com.gommo.modules.rh.person.developmentplan.competency.entity.Competency;
import br.com.gommo.modules.rh.person.developmentplan.competency.repository.CompetencyRepository;
import br.com.gommo.modules.rh.person.experience.dto.ExperienceCompetencyDto;
import br.com.gommo.modules.rh.person.experience.dto.ExperienceDecideRequestDto;
import br.com.gommo.modules.rh.person.experience.dto.ExperienceEvaluationRequestDto;
import br.com.gommo.modules.rh.person.experience.dto.ExperienceEvaluationResponseDto;
import br.com.gommo.modules.rh.person.experience.dto.ExperienceScoreItemDto;
import br.com.gommo.modules.rh.person.experience.dto.ExperienceScoreViewDto;
import br.com.gommo.modules.rh.person.experience.dto.ExperienceScoresUpsertRequestDto;
import br.com.gommo.modules.rh.person.experience.dto.ExperienceSummaryDto;
import br.com.gommo.modules.rh.person.experience.entity.ExperienceDecisionEnum;
import br.com.gommo.modules.rh.person.experience.entity.ExperienceEvaluation;
import br.com.gommo.modules.rh.person.experience.entity.ExperienceEvaluationScore;
import br.com.gommo.modules.rh.person.experience.entity.ExperienceEvaluationStatusEnum;
import br.com.gommo.modules.rh.person.experience.entity.ExperiencePeriodEnum;
import br.com.gommo.modules.rh.person.experience.entity.ExperiencePeriodStatusEnum;
import br.com.gommo.modules.rh.person.experience.exception.ExperienceException;
import br.com.gommo.modules.rh.person.experience.exception.ExperienceExceptions;
import br.com.gommo.modules.rh.person.experience.mapper.ExperienceEvaluationMapper;
import br.com.gommo.modules.rh.person.experience.repository.ExperienceEvaluationRepository;
import br.com.gommo.modules.rh.person.experience.repository.ExperienceEvaluationScoreRepository;
import br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.entity.InterviewEvaluationStatusEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.entity.JobApplicationInterviewEvaluation;
import br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.entity.JobApplicationInterviewScore;
import br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.repository.JobApplicationInterviewEvaluationRepository;
import br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.repository.JobApplicationInterviewScoreRepository;
import br.com.gommo.modules.root.entity.AppUser;
import br.com.gommo.modules.root.repository.AppUserRepository;

@Service
public class ExperienceEvaluationService
        extends BaseService<ExperienceEvaluation, ExperienceEvaluationRequestDto, ExperienceEvaluationResponseDto>
        implements IExperienceEvaluationService {

    private static final ZoneId ZONE = ZoneId.of("America/Sao_Paulo");
    private static final int DUE_SOON_DAYS = 7;
    private static final String ESOCIAL_END_OF_TERM = "09";

    private final ExperienceEvaluationRepository repository;
    private final ExperienceEvaluationScoreRepository scoreRepository;
    private final ExperienceEvaluationMapper mapper;
    private final AdmissionProcessRepository admissionProcessRepository;
    private final CollaboratorRepository collaboratorRepository;
    private final JobPositionRepository jobPositionRepository;
    private final JobPositionCompetencyRepository jobPositionCompetencyRepository;
    private final CompetencyRepository competencyRepository;
    private final EmploymentContractRepository employmentContractRepository;
    private final JobApplicationInterviewEvaluationRepository interviewEvaluationRepository;
    private final JobApplicationInterviewScoreRepository interviewScoreRepository;
    private final IOffboardingService offboardingService;
    private final AppUserRepository appUserRepository;

    public ExperienceEvaluationService(
            ExperienceEvaluationRepository repository,
            ExperienceEvaluationScoreRepository scoreRepository,
            ExperienceEvaluationMapper mapper,
            AdmissionProcessRepository admissionProcessRepository,
            CollaboratorRepository collaboratorRepository,
            JobPositionRepository jobPositionRepository,
            JobPositionCompetencyRepository jobPositionCompetencyRepository,
            CompetencyRepository competencyRepository,
            EmploymentContractRepository employmentContractRepository,
            JobApplicationInterviewEvaluationRepository interviewEvaluationRepository,
            JobApplicationInterviewScoreRepository interviewScoreRepository,
            IOffboardingService offboardingService,
            AppUserRepository appUserRepository) {
        super(
                repository,
                mapper::toResponse,
                mapper::toEntity,
                ExperienceExceptions.NOT_FOUND_CODE,
                ExperienceExceptions.NOT_FOUND_MSG);
        this.repository = repository;
        this.scoreRepository = scoreRepository;
        this.mapper = mapper;
        this.admissionProcessRepository = admissionProcessRepository;
        this.collaboratorRepository = collaboratorRepository;
        this.jobPositionRepository = jobPositionRepository;
        this.jobPositionCompetencyRepository = jobPositionCompetencyRepository;
        this.competencyRepository = competencyRepository;
        this.employmentContractRepository = employmentContractRepository;
        this.interviewEvaluationRepository = interviewEvaluationRepository;
        this.interviewScoreRepository = interviewScoreRepository;
        this.offboardingService = offboardingService;
        this.appUserRepository = appUserRepository;
    }

    @Override
    public List<ExperiencePeriodStatusEnum> openStatuses() {
        return List.of(
                ExperiencePeriodStatusEnum.IN_PERIOD,
                ExperiencePeriodStatusEnum.PENDING_DECISION,
                ExperiencePeriodStatusEnum.EXTENDED);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('experience:read')")
    public List<ExperienceEvaluationResponseDto> findAll(StatusEnum status) {
        return repository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('experience:read')")
    public ExperienceEvaluationResponseDto findById(UUID id) {
        return getDetail(id);
    }

    @Override
    protected void updateEntity(ExperienceEvaluation entity, ExperienceEvaluationRequestDto request) {
        throw ExperienceException.notEditable();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('experience:read')")
    public ExperienceSummaryDto summary() {
        LocalDate today = LocalDate.now(ZONE);
        LocalDate dueSoonLimit = today.plusDays(DUE_SOON_DAYS);
        List<ExperiencePeriodStatusEnum> open = openStatuses();
        long inPeriod = repository.countByPeriodStatusInAndStatusNot(
                List.of(ExperiencePeriodStatusEnum.IN_PERIOD, ExperiencePeriodStatusEnum.EXTENDED),
                StatusEnum.DELETED);
        long pending = repository.countByPeriodStatusInAndStatusNot(
                List.of(ExperiencePeriodStatusEnum.PENDING_DECISION), StatusEnum.DELETED);
        long dueSoon = repository.countByPeriodStatusInAndExperienceDueDateLessThanEqualAndStatusNot(
                open, dueSoonLimit, StatusEnum.DELETED);
        long decided = repository.countByPeriodStatusInAndStatusNot(
                List.of(ExperiencePeriodStatusEnum.EFFECTIVE, ExperiencePeriodStatusEnum.ENDED),
                StatusEnum.DELETED);
        return ExperienceSummaryDto.builder()
                .inPeriodCount(inPeriod)
                .pendingDecisionCount(pending)
                .dueSoonCount(dueSoon)
                .decidedCount(decided)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('experience:read')")
    public List<ExperienceEvaluationResponseDto> listByBucket(String bucket) {
        String normalized = bucket == null ? "open" : bucket.trim().toLowerCase();
        List<ExperiencePeriodStatusEnum> statuses =
                switch (normalized) {
                    case "decided" -> List.of(
                            ExperiencePeriodStatusEnum.EFFECTIVE, ExperiencePeriodStatusEnum.ENDED);
                    default -> openStatuses();
                };
        return repository
                .findByPeriodStatusInAndStatusNotOrderByExperienceDueDateAsc(statuses, StatusEnum.DELETED)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('experience:read')")
    public ExperienceEvaluationResponseDto getDetail(UUID id) {
        ExperienceEvaluation entity = requireEntity(id);
        ExperienceEvaluationResponseDto response = mapper.toResponse(entity);
        List<ExperienceCompetencyDto> competencies = resolveCompetencies(entity.getJobPositionId());
        response.setCompetencies(competencies);
        Map<UUID, Competency> competencyById = loadCompetencies(competencies);
        List<ExperienceEvaluationScore> scores =
                scoreRepository.findByEvaluationIdAndStatusNot(entity.getId(), StatusEnum.DELETED);
        List<ExperienceScoreViewDto> scoreViews = new ArrayList<>();
        for (ExperienceEvaluationScore score : scores) {
            Competency competency = competencyById.get(score.getCompetencyId());
            scoreViews.add(ExperienceScoreViewDto.builder()
                    .competencyId(score.getCompetencyId())
                    .competencyName(competency != null ? competency.getName() : null)
                    .score(score.getScore())
                    .justification(score.getJustification())
                    .build());
        }
        response.setScores(scoreViews);
        return response;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('experience:write')")
    public ExperienceEvaluationResponseDto saveDraft(UUID id, ExperienceScoresUpsertRequestDto request) {
        return upsertScores(id, request, false);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('experience:write')")
    public ExperienceEvaluationResponseDto submit(UUID id, ExperienceScoresUpsertRequestDto request) {
        return upsertScores(id, request, true);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('experience:decide')")
    public ExperienceEvaluationResponseDto decide(UUID id, ExperienceDecideRequestDto request) {
        ExperienceEvaluation entity = requireEntity(id);
        assertOpen(entity);
        ExperienceDecisionEnum action = request.getAction();
        if (action == null || action == ExperienceDecisionEnum.AUTO_EFFECTIVE) {
            throw ExperienceException.invalidDecision();
        }
        String reason = trimToNull(request.getReason());
        if (action == ExperienceDecisionEnum.END && reason == null) {
            throw ExperienceException.decisionReasonRequired();
        }

        UUID userId = CurrentAuditor.userId().orElse(null);
        String userName = resolveUserName(userId);
        OffsetDateTime now = OffsetDateTime.now();

        return switch (action) {
            case EFFECTIVE -> {
                applyEffective(entity, ExperienceDecisionEnum.EFFECTIVE, reason, request.getNotes(), userId, userName, now);
                yield getDetail(entity.getId());
            }
            case EXTEND -> {
                if (!ExperiencePeriodCalculator.canExtend(
                        entity.getExperiencePeriod(), entity.isExperienceExtensionUsed())) {
                    if (entity.isExperienceExtensionUsed()) {
                        throw ExperienceException.extensionUsed();
                    }
                    throw ExperienceException.extensionNotAllowed();
                }
                int extension = ExperiencePeriodCalculator.extensionDays(entity.getExperiencePeriod());
                int nextMilestone = ExperiencePeriodCalculator.cappedMilestone(
                        entity.getExperienceMilestoneDays() + extension);
                entity.setExperienceMilestoneDays(nextMilestone);
                entity.setExperienceDueDate(ExperiencePeriodCalculator.dueDate(entity.getAdmissionDate(), nextMilestone));
                entity.setExperienceExtensionUsed(true);
                entity.setPeriodStatus(ExperiencePeriodStatusEnum.EXTENDED);
                entity.setDecision(ExperienceDecisionEnum.EXTEND);
                entity.setDecisionReason(reason);
                entity.setDecisionNotes(trimToNull(request.getNotes()));
                entity.setDecidedBy(userId);
                entity.setDecidedByName(userName);
                entity.setDecidedAt(now);
                syncAdmissionAndContract(entity);
                repository.save(entity);
                yield getDetail(entity.getId());
            }
            case END -> {
                LocalDate lastDay = entity.getExperienceDueDate() != null
                        ? entity.getExperienceDueDate()
                        : LocalDate.now(ZONE);
                OffboardingResponseDto offboarding = offboardingService.createDraftForExperienceEnd(
                        OffboardingRequestDto.builder()
                                .collaboratorId(entity.getCollaboratorId())
                                .dismissalDate(lastDay)
                                .lastWorkDay(lastDay)
                                .dismissalType(DismissalTypeEnum.END_OF_CONTRACT)
                                .esocialDismissalReasonCode(ESOCIAL_END_OF_TERM)
                                .dismissalNotes(reason)
                                .build());
                entity.setOffboardingId(offboarding.getId());
                entity.setPeriodStatus(ExperiencePeriodStatusEnum.ENDED);
                entity.setDecision(ExperienceDecisionEnum.END);
                entity.setDecisionReason(reason);
                entity.setDecisionNotes(trimToNull(request.getNotes()));
                entity.setDecidedBy(userId);
                entity.setDecidedByName(userName);
                entity.setDecidedAt(now);
                syncAdmissionAndContract(entity);
                repository.save(entity);
                yield getDetail(entity.getId());
            }
            case AUTO_EFFECTIVE -> throw ExperienceException.invalidDecision();
        };
    }

    @Override
    @Transactional
    public void syncFromAdmission(AdmissionProcess admission, ExperiencePeriodEnum period) {
        if (admission == null || admission.getId() == null) {
            return;
        }
        ExperiencePeriodEnum resolved = period == null ? ExperiencePeriodEnum.NONE : period;
        if (resolved == ExperiencePeriodEnum.NONE) {
            admission.setExperiencePeriod(ExperiencePeriodEnum.NONE.name());
            admission.setExperienceStatus("NONE");
            admission.setExperienceMilestoneDays(null);
            admission.setExperienceDueDate(null);
            admission.setExperienceExtensionUsed(false);
            return;
        }
        if (admission.getCollaboratorId() == null) {
            throw ExperienceException.collaboratorRequired();
        }

        LocalDate start = admission.getContractStartDate() != null
                ? admission.getContractStartDate()
                : admission.getExpectedStartDate();
        if (start == null) {
            start = LocalDate.now(ZONE);
        }
        int milestone = ExperiencePeriodCalculator.initialMilestoneDays(resolved);
        LocalDate due = ExperiencePeriodCalculator.dueDate(start, milestone);

        admission.setExperiencePeriod(resolved.name());
        admission.setExperienceMilestoneDays(milestone);
        admission.setExperienceDueDate(due);
        admission.setExperienceExtensionUsed(false);
        admission.setExperienceStatus(ExperiencePeriodStatusEnum.IN_PERIOD.name());
        if (admission.getContractEndDate() == null) {
            admission.setContractEndDate(due);
        }

        ExperienceEvaluation evaluation = repository
                .findByAdmissionProcessIdAndStatusNot(admission.getId(), StatusEnum.DELETED)
                .orElseGet(() -> ExperienceEvaluation.builder()
                        .status(StatusEnum.ACTIVE)
                        .admissionProcessId(admission.getId())
                        .build());

        if (isClosed(evaluation)) {
            return;
        }

        evaluation.setCompanyId(admission.getCompanyId());
        evaluation.setCollaboratorId(admission.getCollaboratorId());
        evaluation.setJobPositionId(admission.getJobPositionId());
        evaluation.setCollaboratorName(resolveCollaboratorName(admission.getCollaboratorId(), admission.getFullName()));
        evaluation.setJobPositionName(resolveJobPositionName(admission.getJobPositionId()));
        evaluation.setAdmissionDate(start);
        evaluation.setExperiencePeriod(resolved);
        evaluation.setExperienceMilestoneDays(milestone);
        evaluation.setExperienceDueDate(due);
        if (evaluation.getPeriodStatus() == null
                || evaluation.getPeriodStatus() == ExperiencePeriodStatusEnum.IN_PERIOD
                || evaluation.getPeriodStatus() == ExperiencePeriodStatusEnum.EXTENDED
                || evaluation.getPeriodStatus() == ExperiencePeriodStatusEnum.PENDING_DECISION) {
            evaluation.setPeriodStatus(ExperiencePeriodStatusEnum.IN_PERIOD);
        }
        evaluation.setSelectionAverage(resolveSelectionAverage(admission.getSourceApplicationId()));
        repository.save(evaluation);
        syncContractFields(admission.getCollaboratorId(), resolved, milestone, due, false, ExperiencePeriodStatusEnum.IN_PERIOD);
    }

    @Override
    @Transactional
    public void processDailyDueDates() {
        LocalDate today = LocalDate.now(ZONE);
        List<ExperiencePeriodStatusEnum> open = openStatuses();

        for (ExperienceEvaluation evaluation : repository
                .findByPeriodStatusInAndExperienceDueDateLessThanEqualAndStatusNot(
                        open, today.plusDays(DUE_SOON_DAYS), StatusEnum.DELETED)) {
            if (evaluation.getExperienceDueDate() == null) {
                continue;
            }
            if (!evaluation.getExperienceDueDate().isAfter(today)
                    && evaluation.getPeriodStatus() != ExperiencePeriodStatusEnum.PENDING_DECISION
                    && evaluation.getPeriodStatus() != ExperiencePeriodStatusEnum.ENDED
                    && evaluation.getPeriodStatus() != ExperiencePeriodStatusEnum.EFFECTIVE) {
                evaluation.setPeriodStatus(ExperiencePeriodStatusEnum.PENDING_DECISION);
                repository.save(evaluation);
                syncAdmissionStatus(evaluation);
            }
        }

        for (ExperienceEvaluation evaluation : repository
                .findByPeriodStatusInAndExperienceDueDateLessThanAndStatusNot(
                        open, today, StatusEnum.DELETED)) {
            applyEffective(
                    evaluation,
                    ExperienceDecisionEnum.AUTO_EFFECTIVE,
                    "Efetivação automática por vencimento do período sem decisão",
                    null,
                    null,
                    "Sistema",
                    OffsetDateTime.now());
        }
    }

    private ExperienceEvaluationResponseDto upsertScores(
            UUID id, ExperienceScoresUpsertRequestDto request, boolean submit) {
        ExperienceEvaluation entity = requireEntity(id);
        assertOpen(entity);
        if (entity.getEvaluationStatus() == ExperienceEvaluationStatusEnum.SUBMITTED) {
            throw ExperienceException.alreadySubmitted();
        }

        List<ExperienceCompetencyDto> competencies = resolveCompetencies(entity.getJobPositionId());
        Set<UUID> expectedIds = competencies.stream()
                .map(ExperienceCompetencyDto::getCompetencyId)
                .collect(Collectors.toCollection(HashSet::new));
        Map<UUID, ExperienceScoreItemDto> requested = new HashMap<>();
        for (ExperienceScoreItemDto item : request.getScores() == null ? List.<ExperienceScoreItemDto>of() : request.getScores()) {
            if (item == null || item.getCompetencyId() == null) {
                continue;
            }
            requested.put(item.getCompetencyId(), item);
        }

        if (submit) {
            for (UUID competencyId : expectedIds) {
                ExperienceScoreItemDto item = requested.get(competencyId);
                if (item == null || item.getScore() == null) {
                    throw ExperienceException.competencyRequired();
                }
                if (item.getScore() < 1 || item.getScore() > 4) {
                    throw ExperienceException.scoreInvalid();
                }
                if (trimToNull(item.getJustification()) == null) {
                    throw ExperienceException.justificationRequired();
                }
            }
        } else {
            for (ExperienceScoreItemDto item : requested.values()) {
                if (item.getScore() != null && (item.getScore() < 1 || item.getScore() > 4)) {
                    throw ExperienceException.scoreInvalid();
                }
                if (!expectedIds.contains(item.getCompetencyId())) {
                    throw ExperienceException.competencyNotInScorecard();
                }
            }
        }

        UUID userId = CurrentAuditor.userId().orElse(null);
        entity.setEvaluatorUserId(userId);
        entity.setEvaluatorName(resolveUserName(userId));
        if (submit) {
            entity.setEvaluationStatus(ExperienceEvaluationStatusEnum.SUBMITTED);
            entity.setSubmittedAt(OffsetDateTime.now());
        } else {
            entity.setEvaluationStatus(ExperienceEvaluationStatusEnum.DRAFT);
            entity.setSubmittedAt(null);
        }

        List<ExperienceEvaluationScore> existing =
                scoreRepository.findByEvaluationIdAndStatusNot(entity.getId(), StatusEnum.DELETED);
        Map<UUID, ExperienceEvaluationScore> existingByCompetency = existing.stream()
                .collect(Collectors.toMap(ExperienceEvaluationScore::getCompetencyId, Function.identity()));

        Set<UUID> keep = new HashSet<>();
        List<Integer> scoredValues = new ArrayList<>();
        for (UUID competencyId : expectedIds) {
            ExperienceScoreItemDto item = requested.get(competencyId);
            if (item == null || item.getScore() == null) {
                continue;
            }
            keep.add(competencyId);
            scoredValues.add(item.getScore());
            ExperienceEvaluationScore score = existingByCompetency.get(competencyId);
            if (score == null) {
                score = ExperienceEvaluationScore.builder()
                        .status(StatusEnum.ACTIVE)
                        .companyId(entity.getCompanyId())
                        .evaluationId(entity.getId())
                        .competencyId(competencyId)
                        .build();
            }
            score.setScore(item.getScore());
            score.setJustification(item.getJustification() == null ? "" : item.getJustification().trim());
            scoreRepository.save(score);
        }
        for (ExperienceEvaluationScore leftover : existing) {
            if (!keep.contains(leftover.getCompetencyId())) {
                leftover.setStatus(StatusEnum.DELETED);
                scoreRepository.save(leftover);
            }
        }

        if (!scoredValues.isEmpty()) {
            double sum = scoredValues.stream().mapToInt(Integer::intValue).sum();
            entity.setAverageScore(BigDecimal.valueOf(sum / scoredValues.size()).setScale(1, RoundingMode.HALF_UP));
        } else {
            entity.setAverageScore(null);
        }
        repository.save(entity);
        return getDetail(entity.getId());
    }

    private void applyEffective(
            ExperienceEvaluation entity,
            ExperienceDecisionEnum decision,
            String reason,
            String notes,
            UUID userId,
            String userName,
            OffsetDateTime at) {
        entity.setPeriodStatus(ExperiencePeriodStatusEnum.EFFECTIVE);
        entity.setDecision(decision);
        entity.setDecisionReason(trimToNull(reason));
        entity.setDecisionNotes(trimToNull(notes));
        entity.setDecidedBy(userId);
        entity.setDecidedByName(userName);
        entity.setDecidedAt(at);
        syncAdmissionAndContract(entity);
        clearContractEndDate(entity);
        repository.save(entity);
    }

    private void clearContractEndDate(ExperienceEvaluation entity) {
        admissionProcessRepository
                .findByIdAndStatusNot(entity.getAdmissionProcessId(), StatusEnum.DELETED)
                .ifPresent(admission -> {
                    admission.setContractEndDate(null);
                    admission.setExperienceStatus(ExperiencePeriodStatusEnum.EFFECTIVE.name());
                    admissionProcessRepository.save(admission);
                    employmentContractRepository
                            .findFirstByCollaboratorIdAndStatusNotOrderByStartDateDesc(
                                    entity.getCollaboratorId(), StatusEnum.DELETED)
                            .ifPresent(contract -> {
                                contract.setEndDate(null);
                                contract.setExperienceStatus(ExperiencePeriodStatusEnum.EFFECTIVE.name());
                                employmentContractRepository.save(contract);
                            });
                });
    }

    private void syncAdmissionAndContract(ExperienceEvaluation entity) {
        admissionProcessRepository
                .findByIdAndStatusNot(entity.getAdmissionProcessId(), StatusEnum.DELETED)
                .ifPresent(admission -> {
                    admission.setExperiencePeriod(entity.getExperiencePeriod().name());
                    admission.setExperienceMilestoneDays(entity.getExperienceMilestoneDays());
                    admission.setExperienceDueDate(entity.getExperienceDueDate());
                    admission.setExperienceExtensionUsed(entity.isExperienceExtensionUsed());
                    admission.setExperienceStatus(entity.getPeriodStatus().name());
                    if (entity.getPeriodStatus() == ExperiencePeriodStatusEnum.EXTENDED
                            || entity.getPeriodStatus() == ExperiencePeriodStatusEnum.IN_PERIOD
                            || entity.getPeriodStatus() == ExperiencePeriodStatusEnum.PENDING_DECISION) {
                        admission.setContractEndDate(entity.getExperienceDueDate());
                    }
                    admissionProcessRepository.save(admission);
                });
        syncContractFields(
                entity.getCollaboratorId(),
                entity.getExperiencePeriod(),
                entity.getExperienceMilestoneDays(),
                entity.getExperienceDueDate(),
                entity.isExperienceExtensionUsed(),
                entity.getPeriodStatus());
    }

    private void syncAdmissionStatus(ExperienceEvaluation entity) {
        admissionProcessRepository
                .findByIdAndStatusNot(entity.getAdmissionProcessId(), StatusEnum.DELETED)
                .ifPresent(admission -> {
                    admission.setExperienceStatus(entity.getPeriodStatus().name());
                    admissionProcessRepository.save(admission);
                });
    }

    private void syncContractFields(
            UUID collaboratorId,
            ExperiencePeriodEnum period,
            Integer milestone,
            LocalDate due,
            boolean extensionUsed,
            ExperiencePeriodStatusEnum periodStatus) {
        if (collaboratorId == null) {
            return;
        }
        employmentContractRepository
                .findFirstByCollaboratorIdAndStatusNotOrderByStartDateDesc(collaboratorId, StatusEnum.DELETED)
                .ifPresent(contract -> {
                    contract.setExperiencePeriod(period == null ? null : period.name());
                    contract.setExperienceMilestoneDays(milestone);
                    contract.setExperienceDueDate(due);
                    contract.setExperienceExtensionUsed(extensionUsed);
                    contract.setExperienceStatus(periodStatus == null ? null : periodStatus.name());
                    if (periodStatus == ExperiencePeriodStatusEnum.IN_PERIOD
                            || periodStatus == ExperiencePeriodStatusEnum.EXTENDED
                            || periodStatus == ExperiencePeriodStatusEnum.PENDING_DECISION) {
                        contract.setEndDate(due);
                    }
                    employmentContractRepository.save(contract);
                });
    }

    private List<ExperienceCompetencyDto> resolveCompetencies(UUID jobPositionId) {
        if (jobPositionId == null) {
            return List.of();
        }
        List<JobPositionCompetency> positionRows = jobPositionCompetencyRepository
                .findByJobPositionIdOrdered(jobPositionId, StatusEnum.DELETED)
                .stream()
                .filter(row -> row.getValidUntil() == null)
                .toList();
        List<JobPositionCompetency> experienceRows = positionRows.stream()
                .filter(row -> row.getUsedIn() != null
                        && row.getUsedIn().contains(JobPositionCompetencyUsageEnum.EXPERIENCE))
                .toList();
        List<JobPositionCompetency> selected = experienceRows.isEmpty() ? positionRows : experienceRows;
        if (selected.isEmpty()) {
            return List.of();
        }
        Map<UUID, Competency> competencyById = competencyRepository
                .findAllById(selected.stream().map(JobPositionCompetency::getCompetencyId).toList())
                .stream()
                .collect(Collectors.toMap(Competency::getId, Function.identity()));
        List<ExperienceCompetencyDto> result = new ArrayList<>();
        for (JobPositionCompetency row : selected) {
            Competency competency = competencyById.get(row.getCompetencyId());
            result.add(ExperienceCompetencyDto.builder()
                    .competencyId(row.getCompetencyId())
                    .competencyName(competency != null ? competency.getName() : null)
                    .expectedLevel(row.getExpectedLevel() == null ? null : row.getExpectedLevel().name())
                    .source("JOB_POSITION")
                    .build());
        }
        return result;
    }

    private Map<UUID, Competency> loadCompetencies(List<ExperienceCompetencyDto> competencies) {
        List<UUID> ids = competencies.stream()
                .map(ExperienceCompetencyDto::getCompetencyId)
                .filter(Objects::nonNull)
                .toList();
        if (ids.isEmpty()) {
            return Map.of();
        }
        return competencyRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Competency::getId, Function.identity()));
    }

    private BigDecimal resolveSelectionAverage(UUID sourceApplicationId) {
        if (sourceApplicationId == null) {
            return null;
        }
        List<JobApplicationInterviewEvaluation> evaluations =
                interviewEvaluationRepository.findByJobVacancyApplicationIdAndStatusNot(
                        sourceApplicationId, StatusEnum.DELETED);
        List<JobApplicationInterviewEvaluation> submitted = evaluations.stream()
                .filter(item -> item.getEvaluationStatus() == InterviewEvaluationStatusEnum.SUBMITTED)
                .toList();
        if (submitted.isEmpty()) {
            return null;
        }
        List<UUID> evaluationIds = submitted.stream().map(JobApplicationInterviewEvaluation::getId).toList();
        List<JobApplicationInterviewScore> scores =
                interviewScoreRepository.findByEvaluationIdInAndStatusNot(evaluationIds, StatusEnum.DELETED);
        if (scores.isEmpty()) {
            return null;
        }
        double sum = scores.stream().mapToInt(JobApplicationInterviewScore::getScore).sum();
        return BigDecimal.valueOf(sum / scores.size()).setScale(1, RoundingMode.HALF_UP);
    }

    private ExperienceEvaluation requireEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(ExperienceException::notFound);
    }

    private void assertOpen(ExperienceEvaluation entity) {
        if (isClosed(entity)) {
            throw ExperienceException.notEditable();
        }
    }

    private boolean isClosed(ExperienceEvaluation entity) {
        return entity.getPeriodStatus() == ExperiencePeriodStatusEnum.EFFECTIVE
                || entity.getPeriodStatus() == ExperiencePeriodStatusEnum.ENDED;
    }

    private String resolveCollaboratorName(UUID collaboratorId, String fallback) {
        if (collaboratorId != null) {
            return collaboratorRepository
                    .findById(collaboratorId)
                    .map(Collaborator::getFullName)
                    .filter(name -> name != null && !name.isBlank())
                    .orElse(fallback);
        }
        return fallback;
    }

    private String resolveJobPositionName(UUID jobPositionId) {
        if (jobPositionId == null) {
            return null;
        }
        return jobPositionRepository
                .findById(jobPositionId)
                .map(JobPosition::getTitle)
                .orElse(null);
    }

    private String resolveUserName(UUID userId) {
        if (userId == null) {
            return null;
        }
        return appUserRepository
                .findById(userId)
                .map(AppUser::getName)
                .filter(name -> name != null && !name.isBlank())
                .orElse(null);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('experience:write')")
    public ExperienceEvaluationResponseDto create(ExperienceEvaluationRequestDto request) {
        AdmissionProcess admission = admissionProcessRepository
                .findByIdAndStatusNot(request.getAdmissionProcessId(), StatusEnum.DELETED)
                .orElseThrow(ExperienceException::notFound);
        ExperiencePeriodEnum period = request.getExperiencePeriod() == null
                ? ExperiencePeriodEnum.DAYS_45_45
                : request.getExperiencePeriod();
        syncFromAdmission(admission, period);
        admissionProcessRepository.save(admission);
        return repository
                .findByAdmissionProcessIdAndStatusNot(admission.getId(), StatusEnum.DELETED)
                .map(this::getDetailSafe)
                .orElseThrow(ExperienceException::notFound);
    }

    private ExperienceEvaluationResponseDto getDetailSafe(ExperienceEvaluation entity) {
        return getDetail(entity.getId());
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('experience:write')")
    public ExperienceEvaluationResponseDto update(UUID id, ExperienceEvaluationRequestDto request) {
        throw ExperienceException.notEditable();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('experience:write')")
    public void delete(UUID id) {
        ExperienceEvaluation entity = requireEntity(id);
        entity.setStatus(StatusEnum.DELETED);
        repository.save(entity);
    }
}
