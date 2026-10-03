package br.com.gommo.modules.rh.person.jobvacancyapplication.service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.entity.AdmissionProcessKanbanColumn;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.repository.AdmissionProcessKanbanColumnRepository;
import br.com.gommo.modules.rh.person.candidate.entity.Candidate;
import br.com.gommo.modules.rh.person.candidate.repository.CandidateRepository;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancy;
import br.com.gommo.modules.rh.person.jobvacancy.repository.JobVacancyRepository;
import br.com.gommo.modules.rh.person.jobvacancy.service.JobVacancyRequirementOptionsService;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationKanbanColumnRequestDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationRejectRequestDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationRejectionReasonDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationRequestDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationResponseDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationStageCommentDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationStageCommentRequestDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplication;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplicationRejectionReasonEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplicationStatusEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.RejectionFeedbackStatusEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.exception.JobVacancyApplicationException;
import br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.dto.InterviewCompetencyAverageDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.service.InterviewScorecardService;
import br.com.gommo.modules.rh.person.jobvacancyapplication.mapper.JobVacancyApplicationMapper;
import br.com.gommo.modules.rh.person.jobvacancyapplication.repository.JobVacancyApplicationRepository;
import br.com.gommo.modules.rh.person.recruiting.ai.ApplicationAiAnalysisService;
import br.com.gommo.modules.root.entity.AppUser;
import br.com.gommo.modules.root.repository.AppUserRepository;

@Service
public class JobVacancyApplicationService
        extends BaseService<JobVacancyApplication, JobVacancyApplicationRequestDto, JobVacancyApplicationResponseDto>
        implements IJobVacancyApplicationService {
    private final JobVacancyApplicationRepository repository;
    private final JobVacancyApplicationMapper mapper;
    private final JobVacancyRepository jobVacancyRepository;
    private final CandidateRepository candidateRepository;
    private final AdmissionProcessKanbanColumnRepository kanbanColumnRepository;
    private final ApplicationAiAnalysisService applicationAiAnalysisService;
    private final AppUserRepository appUserRepository;
    private final JobVacancyApplicationRejectionFeedbackService rejectionFeedbackService;
    private final JobVacancyRequirementOptionsService requirementOptionsService;
    private final InterviewScorecardService interviewScorecardService;

    public JobVacancyApplicationService(
            JobVacancyApplicationRepository repository,
            JobVacancyApplicationMapper mapper,
            JobVacancyRepository jobVacancyRepository,
            CandidateRepository candidateRepository,
            AdmissionProcessKanbanColumnRepository kanbanColumnRepository,
            ApplicationAiAnalysisService applicationAiAnalysisService,
            AppUserRepository appUserRepository,
            JobVacancyApplicationRejectionFeedbackService rejectionFeedbackService,
            JobVacancyRequirementOptionsService requirementOptionsService,
            InterviewScorecardService interviewScorecardService) {
        super(repository, entity -> mapper.toResponse(entity, null, null), mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.jobVacancyRepository = jobVacancyRepository;
        this.candidateRepository = candidateRepository;
        this.kanbanColumnRepository = kanbanColumnRepository;
        this.applicationAiAnalysisService = applicationAiAnalysisService;
        this.appUserRepository = appUserRepository;
        this.rejectionFeedbackService = rejectionFeedbackService;
        this.requirementOptionsService = requirementOptionsService;
        this.interviewScorecardService = interviewScorecardService;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobvacancyapplication:read')")
    public List<JobVacancyApplicationResponseDto> findAll() {
        return enrichAll(repository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobvacancyapplication:read')")
    public JobVacancyApplicationResponseDto findById(UUID id) {
        return enrich(findEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobvacancyapplication:read')")
    public PageableResponseDto<JobVacancyApplicationResponseDto> findPage(int page, int size) {
        var pageable = org.springframework.data.domain.PageRequest.of(
                page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        var result = repository.findAllByStatusNot(StatusEnum.DELETED, pageable);
        List<JobVacancyApplicationResponseDto> content = enrichAll(result.getContent());
        return PageableResponseDto.<JobVacancyApplicationResponseDto>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .filterOptions(java.util.Map.of())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobvacancyapplication:read')")
    public List<JobVacancyApplicationResponseDto> findByJobVacancyId(UUID jobVacancyId) {
        boolean vacancyExists =
                jobVacancyRepository.findByIdAndStatusNot(jobVacancyId, StatusEnum.DELETED).isPresent();
        if (!vacancyExists) {
            throw JobVacancyApplicationException.vacancyNotFound();
        }
        return enrichAll(
                repository.findByJobVacancyIdAndStatusNotOrderByAppliedAtDesc(jobVacancyId, StatusEnum.DELETED));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyAuthority('jobvacancyapplication:write', 'admission:write')")
    public List<JobVacancyApplicationResponseDto> startAdmissionProcess(UUID jobVacancyId) {
        boolean vacancyExists =
                jobVacancyRepository.findByIdAndStatusNot(jobVacancyId, StatusEnum.DELETED).isPresent();
        if (!vacancyExists) {
            throw JobVacancyApplicationException.vacancyNotFound();
        }

        String firstColumnKey = kanbanColumnRepository
                .findAllByStatusNotOrderByDisplayOrderAscNameAsc(StatusEnum.DELETED)
                .stream()
                .filter(column -> !column.isSystemColumn())
                .map(AdmissionProcessKanbanColumn::getColumnKey)
                .filter(key -> key != null && !key.isBlank())
                .findFirst()
                .orElseThrow(JobVacancyApplicationException::kanbanColumnRequired);

        List<JobVacancyApplication> applications =
                repository.findByJobVacancyIdAndStatusNotOrderByAppliedAtDesc(jobVacancyId, StatusEnum.DELETED);
        if (applications.isEmpty()) {
            throw JobVacancyApplicationException.noCandidates();
        }

        for (JobVacancyApplication application : applications) {
            if (application.getKanbanColumnKey() == null || application.getKanbanColumnKey().isBlank()) {
                assignKanbanColumn(application, firstColumnKey);
            }
        }
        return enrichAll(repository.saveAll(applications));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyAuthority('jobvacancyapplication:write', 'admission:write')")
    public JobVacancyApplicationResponseDto updateKanbanColumn(
            UUID id, JobVacancyApplicationKanbanColumnRequestDto request) {
        JobVacancyApplication entity = findEntity(id);
        String key = normalizeColumnKey(request.getKanbanColumnKey());
        if (AdmissionProcessKanbanColumn.CLOSED_COLUMN_KEY.equals(key)) {
            if (entity.isRejected()) {
                return enrich(entity);
            }
            throw JobVacancyApplicationException.rejectionReasonRequired();
        }
        reopenIfRejected(entity);
        assignKanbanColumn(entity, key);
        return enrich(repository.save(entity));
    }

    @Override
    @PreAuthorize("hasAnyAuthority('jobvacancyapplication:read', 'admission:read')")
    public List<JobVacancyApplicationRejectionReasonDto> listRejectionReasons() {
        return Arrays.stream(JobVacancyApplicationRejectionReasonEnum.values())
                .map(JobVacancyApplicationRejectionReasonDto::of)
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyAuthority('jobvacancyapplication:write', 'admission:write')")
    public JobVacancyApplicationResponseDto reject(UUID id, JobVacancyApplicationRejectRequestDto request) {
        JobVacancyApplication entity = findEntity(id);
        if (entity.isRejected()) {
            throw JobVacancyApplicationException.alreadyRejected();
        }
        JobVacancyApplicationRejectionReasonEnum reason = request.getReason();
        if (reason == null) {
            throw JobVacancyApplicationException.rejectionReasonRequired();
        }
        String requirement = trimToNull(request.getRequirement());
        if (reason.isRequiresRequirement() && requirement == null) {
            throw JobVacancyApplicationException.rejectionRequirementRequired();
        }
        JobVacancy vacancy = jobVacancyRepository
                .findByIdAndStatusNot(entity.getJobVacancyId(), StatusEnum.DELETED)
                .orElseThrow(JobVacancyApplicationException::vacancyNotFound);
        if (reason.isRequiresRequirement()
                && !requirementOptionsService.isAllowedRequirement(vacancy, requirement)) {
            throw JobVacancyApplicationException.rejectionRequirementInvalid();
        }
        if (reason == JobVacancyApplicationRejectionReasonEnum.ASSESSMENT_BELOW_MINIMUM
                && !isBelowMinimumCompatibility(entity.getAiScore())) {
            throw JobVacancyApplicationException.assessmentBelowMinimumNotApplicable();
        }
        boolean rejectedColumnExists = kanbanColumnRepository
                .findAllByStatusNotOrderByDisplayOrderAscNameAsc(StatusEnum.DELETED)
                .stream()
                .anyMatch(column -> AdmissionProcessKanbanColumn.CLOSED_COLUMN_KEY.equals(column.getColumnKey()));
        if (!rejectedColumnExists) {
            throw JobVacancyApplicationException.rejectedColumnMissing();
        }

        UUID userId = currentUserId();
        assignKanbanColumn(entity, AdmissionProcessKanbanColumn.CLOSED_COLUMN_KEY);
        entity.setApplicationStatus(JobVacancyApplicationStatusEnum.REJECTED);
        entity.setRejectionReason(reason);
        entity.setRejectionRequirement(requirement);
        entity.setRejectionNote(trimToNull(request.getNote()));
        entity.setRejectedAt(OffsetDateTime.now());
        entity.setRejectedBy(userId);
        entity.setRejectedByName(userId == null ? null : appUserRepository.findById(userId).map(AppUser::getName).orElse(null));
        entity.setRejectionFeedbackStatus(
                request.isSendFeedback() ? RejectionFeedbackStatusEnum.PENDING : RejectionFeedbackStatusEnum.NOT_SENT);
        entity.setRejectionFeedbackAt(null);
        entity.setRejectionFeedbackDetail(null);

        JobVacancyApplication saved = repository.save(entity);
        if (request.isSendFeedback()) {
            UUID applicationId = saved.getId();
            runAfterCommit(() -> rejectionFeedbackService.sendAsync(applicationId));
        }
        return enrich(saved);
    }

    private void reopenIfRejected(JobVacancyApplication entity) {
        if (!entity.isRejected()) {
            return;
        }
        entity.clearRejection();
        if (entity.getApplicationStatus() == JobVacancyApplicationStatusEnum.REJECTED) {
            entity.setApplicationStatus(JobVacancyApplicationStatusEnum.SCREENING);
        }
    }

    private static void runAfterCommit(Runnable task) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    task.run();
                }
            });
        } else {
            task.run();
        }
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyAuthority('jobvacancyapplication:write', 'admission:write')")
    public JobVacancyApplicationResponseDto upsertStageComment(
            UUID id, JobVacancyApplicationStageCommentRequestDto request) {
        JobVacancyApplication entity = findEntity(id);
        String columnKey = normalizeColumnKey(request.getColumnKey());
        if (columnKey == null) {
            throw JobVacancyApplicationException.stageCommentColumnRequired();
        }

        boolean columnExists = kanbanColumnRepository
                .findAllByStatusNotOrderByDisplayOrderAscNameAsc(StatusEnum.DELETED)
                .stream()
                .map(AdmissionProcessKanbanColumn::getColumnKey)
                .anyMatch(columnKey::equals);
        if (!columnExists) {
            throw JobVacancyApplicationException.stageCommentColumnNotFound();
        }

        Map<String, JobVacancyApplicationStageCommentDto> comments =
                new LinkedHashMap<>(
                        entity.getStageComments() == null ? Map.of() : entity.getStageComments());

        String text = request.getText() == null ? "" : request.getText().trim();
        if (text.isEmpty()) {
            comments.remove(columnKey);
        } else {
            comments.put(
                    columnKey,
                    JobVacancyApplicationStageCommentDto.builder()
                            .text(text)
                            .updatedAt(java.time.OffsetDateTime.now().toString())
                            .updatedBy(currentUserId())
                            .build());
        }
        entity.setStageComments(comments);

        return enrich(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobvacancyapplication:write')")
    public JobVacancyApplicationResponseDto create(JobVacancyApplicationRequestDto request) {
        validateRequest(request, null);
        if (targetsRejection(request)) {
            throw JobVacancyApplicationException.rejectionReasonRequired();
        }
        JobVacancyApplication entity = mapper.toEntity(request);
        entity.setStatus(StatusEnum.ACTIVE);
        return enrich(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobvacancyapplication:write')")
    public JobVacancyApplicationResponseDto update(UUID id, JobVacancyApplicationRequestDto request) {
        validateRequest(request, id);
        JobVacancyApplication entity = findEntity(id);
        String requestedKey = normalizeColumnKey(request.getKanbanColumnKey());
        if (entity.isRejected()) {
            if (requestedKey != null && !AdmissionProcessKanbanColumn.CLOSED_COLUMN_KEY.equals(requestedKey)) {
                reopenIfRejected(entity);
            } else {
                request.setApplicationStatus(JobVacancyApplicationStatusEnum.REJECTED);
            }
        } else if (targetsRejection(request)) {
            throw JobVacancyApplicationException.rejectionReasonRequired();
        }
        mapper.updateEntity(entity, request);
        return enrich(repository.save(entity));
    }

    private boolean targetsRejection(JobVacancyApplicationRequestDto request) {
        return AdmissionProcessKanbanColumn.CLOSED_COLUMN_KEY.equals(normalizeColumnKey(request.getKanbanColumnKey()))
                || request.getApplicationStatus() == JobVacancyApplicationStatusEnum.REJECTED;
    }

    private void assignKanbanColumn(JobVacancyApplication entity, String columnKey) {
        String normalized = normalizeColumnKey(columnKey);
        if (normalized == null) {
            return;
        }
        if (normalized.equals(entity.getKanbanColumnKey())) {
            return;
        }
        entity.setKanbanColumnKey(normalized);
        entity.setKanbanColumnEnteredAt(OffsetDateTime.now());
        entity.setKanbanSlaLastReminderDate(null);
        entity.setKanbanSlaCandidateNotifiedAt(null);
    }

    private static boolean isBelowMinimumCompatibility(BigDecimal aiScore) {
        if (aiScore == null) {
            return false;
        }
        return aiScore.compareTo(BigDecimal.valueOf(JobVacancyApplicationRejectionReasonEnum.MINIMUM_COMPATIBILITY_SCORE))
                < 0;
    }



    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobvacancyapplication:read')")
    public List<JobVacancyApplicationResponseDto> findAll(StatusEnum status) {
        return super.findAll(status);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobvacancyapplication:write')")
    public void activate(UUID id) {
        super.activate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobvacancyapplication:write')")
    public void deactivate(UUID id) {
        super.deactivate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobvacancyapplication:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected JobVacancyApplication findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(JobVacancyApplicationException::notFound);
    }

    @Override
    protected void updateEntity(JobVacancyApplication entity, JobVacancyApplicationRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private void validateRequest(JobVacancyApplicationRequestDto request, UUID currentId) {
        if (request.getJobVacancyId() == null) {
            throw JobVacancyApplicationException.vacancyRequired();
        }
        if (request.getCandidateId() == null) {
            throw JobVacancyApplicationException.candidateRequired();
        }

        boolean vacancyExists = jobVacancyRepository
                .findByIdAndStatusNot(request.getJobVacancyId(), StatusEnum.DELETED)
                .isPresent();
        if (!vacancyExists) {
            throw JobVacancyApplicationException.vacancyNotFound();
        }

        boolean candidateExists = candidateRepository
                .findByIdAndStatusNot(request.getCandidateId(), StatusEnum.DELETED)
                .isPresent();
        if (!candidateExists) {
            throw JobVacancyApplicationException.candidateNotFound();
        }

        repository
                .findByJobVacancyIdAndCandidateIdAndStatusNot(
                        request.getJobVacancyId(), request.getCandidateId(), StatusEnum.DELETED)
                .filter(existing -> !existing.getId().equals(currentId))
                .ifPresent(existing -> {
                    throw JobVacancyApplicationException.duplicate();
                });
    }

    private JobVacancyApplicationResponseDto enrich(JobVacancyApplication entity) {
        JobVacancy vacancy = jobVacancyRepository.findById(entity.getJobVacancyId()).orElse(null);
        Candidate candidate = candidateRepository.findById(entity.getCandidateId()).orElse(null);
        Map<UUID, String> columnById = new LinkedHashMap<>();
        String columnKey = normalizeColumnKey(entity.getKanbanColumnKey());
        if (columnKey != null) {
            columnById.put(entity.getId(), columnKey);
        }
        Map<UUID, List<InterviewCompetencyAverageDto>> averages =
                interviewScorecardService.averagesForApplications(
                        new InterviewScorecardService.CollectionAwareApplications(Set.of(entity.getId()), columnById));
        return mapper.toResponse(
                entity, vacancy, candidate, averages.getOrDefault(entity.getId(), List.of()));
    }

    private List<JobVacancyApplicationResponseDto> enrichAll(List<JobVacancyApplication> entities) {
        if (entities.isEmpty()) {
            return List.of();
        }

        Set<UUID> vacancyIds = new HashSet<>();
        Set<UUID> candidateIds = new HashSet<>();
        Set<UUID> applicationIds = new HashSet<>();
        Map<UUID, String> columnByApplicationId = new LinkedHashMap<>();
        for (JobVacancyApplication entity : entities) {
            vacancyIds.add(entity.getJobVacancyId());
            candidateIds.add(entity.getCandidateId());
            applicationIds.add(entity.getId());
            String columnKey = normalizeColumnKey(entity.getKanbanColumnKey());
            if (columnKey != null) {
                columnByApplicationId.put(entity.getId(), columnKey);
            }
        }

        Map<UUID, JobVacancy> vacancies = jobVacancyRepository.findAllById(vacancyIds).stream()
                .collect(Collectors.toMap(JobVacancy::getId, Function.identity()));
        Map<UUID, Candidate> candidates = candidateRepository
                .findAllByIdInAndStatus(candidateIds, StatusEnum.ACTIVE)
                .stream()
                .collect(Collectors.toMap(Candidate::getId, Function.identity()));
        Map<UUID, List<InterviewCompetencyAverageDto>> averages =
                interviewScorecardService.averagesForApplications(
                        new InterviewScorecardService.CollectionAwareApplications(
                                applicationIds, columnByApplicationId));

        return entities.stream()
                .filter(entity -> candidates.containsKey(entity.getCandidateId()))
                .map(entity -> mapper.toResponse(
                        entity,
                        vacancies.get(entity.getJobVacancyId()),
                        candidates.get(entity.getCandidateId()),
                        averages.getOrDefault(entity.getId(), List.of())))
                .toList();
    }

    private String normalizeColumnKey(String value) {
        if (value == null) return null;
        String trimmed = value.trim().toLowerCase();
        return trimmed.isEmpty() ? null : trimmed;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobvacancyapplication:write')")
    public JobVacancyApplicationResponseDto reanalyze(UUID id) {
        JobVacancyApplication application = applicationAiAnalysisService.reanalyze(id);
        UUID applicationId = application.getId();
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    applicationAiAnalysisService.analyzeAsync(applicationId);
                }
            });
        } else {
            applicationAiAnalysisService.analyzeAsync(applicationId);
        }
        return enrich(application);
    }

    private UUID currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UUID uuid) {
            return uuid;
        }
        if (principal instanceof String value && !value.isBlank()) {
            try {
                return UUID.fromString(value);
            } catch (IllegalArgumentException ignored) {
                return null;
            }
        }
        return null;
    }
}
