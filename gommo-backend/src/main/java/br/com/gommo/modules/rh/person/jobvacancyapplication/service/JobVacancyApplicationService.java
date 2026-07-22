package br.com.gommo.modules.rh.person.jobvacancyapplication.service;

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

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.entity.AdmissionProcessKanbanColumn;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.repository.AdmissionProcessKanbanColumnRepository;
import br.com.gommo.modules.rh.person.candidate.entity.Candidate;
import br.com.gommo.modules.rh.person.candidate.repository.CandidateRepository;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancy;
import br.com.gommo.modules.rh.person.jobvacancy.repository.JobVacancyRepository;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationKanbanColumnRequestDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationRequestDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationResponseDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationStageCommentDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationStageCommentRequestDto;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplication;
import br.com.gommo.modules.rh.person.jobvacancyapplication.exception.JobVacancyApplicationException;
import br.com.gommo.modules.rh.person.jobvacancyapplication.mapper.JobVacancyApplicationMapper;
import br.com.gommo.modules.rh.person.jobvacancyapplication.repository.JobVacancyApplicationRepository;

@Service
public class JobVacancyApplicationService
        extends BaseService<JobVacancyApplication, JobVacancyApplicationRequestDto, JobVacancyApplicationResponseDto>
        implements IJobVacancyApplicationService {
    private final JobVacancyApplicationRepository repository;
    private final JobVacancyApplicationMapper mapper;
    private final JobVacancyRepository jobVacancyRepository;
    private final CandidateRepository candidateRepository;
    private final AdmissionProcessKanbanColumnRepository kanbanColumnRepository;

    public JobVacancyApplicationService(
            JobVacancyApplicationRepository repository,
            JobVacancyApplicationMapper mapper,
            JobVacancyRepository jobVacancyRepository,
            CandidateRepository candidateRepository,
            AdmissionProcessKanbanColumnRepository kanbanColumnRepository) {
        super(repository, entity -> mapper.toResponse(entity, null, null), mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.jobVacancyRepository = jobVacancyRepository;
        this.candidateRepository = candidateRepository;
        this.kanbanColumnRepository = kanbanColumnRepository;
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
                application.setKanbanColumnKey(firstColumnKey);
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
        String key = request.getKanbanColumnKey();
        if (key != null) {
            key = key.trim().toLowerCase();
            if (key.isEmpty()) {
                key = null;
            }
        }
        entity.setKanbanColumnKey(key);
        return enrich(repository.save(entity));
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
        mapper.updateEntity(entity, request);
        return enrich(repository.save(entity));
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
                .filter(existing -> currentId == null || !existing.getId().equals(currentId))
                .ifPresent(existing -> {
                    throw JobVacancyApplicationException.duplicate();
                });
    }

    private JobVacancyApplicationResponseDto enrich(JobVacancyApplication entity) {
        JobVacancy vacancy = jobVacancyRepository.findById(entity.getJobVacancyId()).orElse(null);
        Candidate candidate = candidateRepository.findById(entity.getCandidateId()).orElse(null);
        return mapper.toResponse(entity, vacancy, candidate);
    }

    private List<JobVacancyApplicationResponseDto> enrichAll(List<JobVacancyApplication> entities) {
        if (entities.isEmpty()) {
            return List.of();
        }

        Set<UUID> vacancyIds = new HashSet<>();
        Set<UUID> candidateIds = new HashSet<>();
        for (JobVacancyApplication entity : entities) {
            vacancyIds.add(entity.getJobVacancyId());
            candidateIds.add(entity.getCandidateId());
        }

        Map<UUID, JobVacancy> vacancies = jobVacancyRepository.findAllById(vacancyIds).stream()
                .collect(Collectors.toMap(JobVacancy::getId, Function.identity()));
        Map<UUID, Candidate> candidates = candidateRepository.findAllById(candidateIds).stream()
                .collect(Collectors.toMap(Candidate::getId, Function.identity()));

        return entities.stream()
                .map(entity -> mapper.toResponse(
                        entity, vacancies.get(entity.getJobVacancyId()), candidates.get(entity.getCandidateId())))
                .toList();
    }

    private String normalizeColumnKey(String value) {
        if (value == null) return null;
        String trimmed = value.trim().toLowerCase();
        return trimmed.isEmpty() ? null : trimmed;
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
