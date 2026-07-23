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

    public JobVacancyService(
            JobVacancyRepository repository,
            JobVacancyMapper mapper,
            JobPositionRepository jobPositionRepository,
            JobVacancyApplicationRepository applicationRepository) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.jobPositionRepository = jobPositionRepository;
        this.applicationRepository = applicationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobvacancy:read')")
    public List<JobVacancyResponseDto> findAll() {
        List<JobVacancy> vacancies = repository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED);
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
        var result = repository.findAllByStatusNot(StatusEnum.DELETED, pageable);
        Map<UUID, Integer> counts = loadCandidateCounts();
        List<JobVacancyResponseDto> content = result.getContent().stream()
                .map(entity -> mapper.toResponse(entity, counts.getOrDefault(entity.getId(), 0)))
                .toList();
        return PageableResponseDto.<JobVacancyResponseDto>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .filterOptions(java.util.Map.of())
                .build();
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

        if (request.getJobPositionId() != null) {
            boolean exists = jobPositionRepository
                    .findByIdAndStatusNot(request.getJobPositionId(), StatusEnum.DELETED)
                    .isPresent();
            if (!exists) {
                throw JobVacancyException.jobPositionNotFound();
            }
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
