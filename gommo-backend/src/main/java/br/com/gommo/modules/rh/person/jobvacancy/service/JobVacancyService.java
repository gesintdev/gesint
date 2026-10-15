package br.com.gommo.modules.rh.person.jobvacancy.service;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.access.security.DataScopeResolver;
import br.com.gommo.modules.dp.organization.jobposition.repository.JobPositionRepository;
import br.com.gommo.modules.rh.person.jobvacancy.dto.JobVacancyRequestDto;
import br.com.gommo.modules.rh.person.jobvacancy.dto.JobVacancyResponseDto;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancy;
import br.com.gommo.modules.rh.person.jobvacancy.exception.JobVacancyException;
import br.com.gommo.modules.rh.person.jobvacancy.lib.JobVacancySlug;
import br.com.gommo.modules.rh.person.jobvacancy.mapper.JobVacancyMapper;
import br.com.gommo.modules.rh.person.jobvacancy.repository.JobVacancyRepository;
import br.com.gommo.modules.rh.person.jobvacancyapplication.repository.JobVacancyApplicationRepository;

@Service
public class JobVacancyService extends BaseService<JobVacancy, JobVacancyRequestDto, JobVacancyResponseDto>
        implements IJobVacancyService {
    private final JobVacancyRepository repository;
    private final JobVacancyMapper mapper;
    private final JobPositionRepository jobPositionRepository;
    private final JobVacancyApplicationRepository applicationRepository;
    private final DataScopeResolver dataScopeResolver;

    public JobVacancyService(
            JobVacancyRepository repository,
            JobVacancyMapper mapper,
            JobPositionRepository jobPositionRepository,
            JobVacancyApplicationRepository applicationRepository,
            DataScopeResolver dataScopeResolver) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.jobPositionRepository = jobPositionRepository;
        this.applicationRepository = applicationRepository;
        this.dataScopeResolver = dataScopeResolver;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobvacancy:read')")
    public List<JobVacancyResponseDto> findAll() {
        return findAll(StatusEnum.ACTIVE);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobvacancy:read')")
    public List<JobVacancyResponseDto> findAll(StatusEnum status) {
        StatusEnum resolved = resolveListStatus(status);
        List<JobVacancy> vacancies =
                applyAssignedScopeFilter(repository.findAllByStatusOrderByCreatedAtDesc(resolved));
        Map<UUID, Integer> counts = loadCandidateCounts();
        return vacancies.stream()
                .map(entity -> mapper.toResponse(entity, counts.getOrDefault(entity.getId(), 0)))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobvacancy:read')")
    public JobVacancyResponseDto findById(UUID id) {
        JobVacancy entity = findEntity(id);
        int count = (int) applicationRepository.countByJobVacancyIdAndStatusNot(id, StatusEnum.DELETED);
        return mapper.toResponse(entity, count);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobvacancy:read')")
    public PageableResponseDto<JobVacancyResponseDto> findPage(int page, int size) {
        var pageable = org.springframework.data.domain.PageRequest.of(
                page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        var result = repository.findAllByStatus(StatusEnum.ACTIVE, pageable);
        Map<UUID, Integer> counts = loadCandidateCounts();
        List<JobVacancy> scoped = applyAssignedScopeFilter(result.getContent());
        List<JobVacancyResponseDto> content = scoped.stream()
                .map(entity -> mapper.toResponse(entity, counts.getOrDefault(entity.getId(), 0)))
                .toList();
        // Filtro ASSIGNED é pós-página (MVP); totalElements reflete a página filtrada.
        return PageableResponseDto.<JobVacancyResponseDto>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(dataScopeResolver.hasAssignedScopeOnly() ? content.size() : result.getTotalElements())
                .totalPages(result.getTotalPages())
                .filterOptions(java.util.Map.of("status", List.of(StatusEnum.ACTIVE.name(), StatusEnum.INACTIVE.name())))
                .build();
    }

    private List<JobVacancy> applyAssignedScopeFilter(List<JobVacancy> vacancies) {
        if (!dataScopeResolver.hasAssignedScopeOnly()) {
            return vacancies;
        }
        UUID collaboratorId = dataScopeResolver.currentCollaboratorId().orElse(null);
        return vacancies.stream()
                .filter(vacancy -> dataScopeResolver.isAssignedToVacancy(
                        vacancy.getRecruiterCollaboratorId(),
                        vacancy.getRequestingManagerCollaboratorId(),
                        vacancy.getInterviewerCollaboratorIds(),
                        collaboratorId))
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobvacancy:write')")
    public JobVacancyResponseDto create(JobVacancyRequestDto request) {
        validateRequest(request, null);
        JobVacancy entity = mapper.toEntity(request);
        applyPublishState(entity, null);
        entity.setStatus(StatusEnum.ACTIVE);
        int count = 0;
        return mapper.toResponse(repository.save(entity), count);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobvacancy:write')")
    public JobVacancyResponseDto update(UUID id, JobVacancyRequestDto request) {
        validateRequest(request, id);
        JobVacancy entity = findEntity(id);
        OffsetDateTime previousPublishedAt = entity.getPublishedAt();
        mapper.updateEntity(entity, request);
        applyPublishState(entity, previousPublishedAt);
        int count = (int) applicationRepository.countByJobVacancyIdAndStatusNot(id, StatusEnum.DELETED);
        return mapper.toResponse(repository.save(entity), count);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobvacancy:write')")
    public void activate(UUID id) {
        super.activate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobvacancy:write')")
    public void deactivate(UUID id) {
        super.deactivate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobvacancy:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected JobVacancy findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(JobVacancyException::notFound);
    }

    @Override
    protected void updateEntity(JobVacancy entity, JobVacancyRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private Map<UUID, Integer> loadCandidateCounts() {
        Map<UUID, Integer> counts = new HashMap<>();
        for (Object[] row : applicationRepository.countActiveGroupedByJobVacancyId(StatusEnum.DELETED)) {
            counts.put((UUID) row[0], ((Number) row[1]).intValue());
        }
        return counts;
    }

    private void validateRequest(JobVacancyRequestDto request, UUID currentId) {
        String title = request.getJobTitle() == null ? "" : request.getJobTitle().trim();
        if (title.isEmpty()) {
            throw JobVacancyException.titleRequired();
        }
        request.setJobTitle(title);

        if (request.getPositionsCount() == null || request.getPositionsCount() < 1) {
            throw JobVacancyException.positionsInvalid();
        }

        if (request.getJobPositionId() == null) {
            throw JobVacancyException.jobPositionRequired();
        }
        boolean jobPositionExists = jobPositionRepository
                .findByIdAndStatusNot(request.getJobPositionId(), StatusEnum.DELETED)
                .isPresent();
        if (!jobPositionExists) {
            throw JobVacancyException.jobPositionNotFound();
        }

        Integer slaDays = request.getCandidateReturnSlaBusinessDays();
        if (slaDays == null) {
            request.setCandidateReturnSlaBusinessDays(5);
        } else if (slaDays < 1) {
            throw JobVacancyException.slaInvalid();
        }

        if (request.getInterviewerCollaboratorIds() == null) {
            request.setInterviewerCollaboratorIds(List.of());
        }

        request.setAffirmativePcd(Boolean.TRUE.equals(request.getAffirmativePcd()));
        if (request.getPublishGoogleJobs() == null) {
            request.setPublishGoogleJobs(true);
        }

        boolean publish = Boolean.TRUE.equals(request.getIsPublic());
        String slug = JobVacancySlug.normalize(request.getSlug());
        if (slug == null && publish) {
            slug = JobVacancySlug.normalize(title);
        }
        if (publish && (slug == null || slug.isBlank())) {
            throw JobVacancyException.slugInvalid();
        }
        request.setSlug(slug);
        request.setIsPublic(publish);

        if (slug != null) {
            var existing = currentId == null
                    ? repository.findBySlugAndStatusNot(slug, StatusEnum.DELETED)
                    : repository.findBySlugAndStatusNotAndIdNot(slug, StatusEnum.DELETED, currentId);
            if (existing.isPresent()) {
                throw JobVacancyException.slugDuplicate();
            }
        }
    }

    private void applyPublishState(JobVacancy entity, OffsetDateTime previousPublishedAt) {
        if (Boolean.TRUE.equals(entity.getIsPublic())) {
            if (entity.getSlug() == null || entity.getSlug().isBlank()) {
                throw JobVacancyException.slugInvalid();
            }
            entity.setPublishedAt(previousPublishedAt != null ? previousPublishedAt : OffsetDateTime.now());
        } else {
            entity.setIsPublic(false);
            entity.setPublishedAt(null);
        }
    }
}
