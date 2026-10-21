package br.com.gesint.modules.dp.organization.jobpositioncompetency.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.base.dto.PageableResponseDto;
import br.com.gesint.core.base.service.BaseService;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.organization.jobposition.entity.JobPosition;
import br.com.gesint.modules.dp.organization.jobposition.exception.JobPositionException;
import br.com.gesint.modules.dp.organization.jobposition.repository.JobPositionRepository;
import br.com.gesint.modules.dp.organization.jobpositioncompetency.dto.JobPositionCompetencyRequestDto;
import br.com.gesint.modules.dp.organization.jobpositioncompetency.dto.JobPositionCompetencyResponseDto;
import br.com.gesint.modules.dp.organization.jobpositioncompetency.entity.JobPositionCompetency;
import br.com.gesint.modules.dp.organization.jobpositioncompetency.exception.JobPositionCompetencyException;
import br.com.gesint.modules.dp.organization.jobpositioncompetency.mapper.JobPositionCompetencyMapper;
import br.com.gesint.modules.dp.organization.jobpositioncompetency.repository.JobPositionCompetencyRepository;
import br.com.gesint.modules.rh.person.developmentplan.competency.entity.Competency;
import br.com.gesint.modules.rh.person.developmentplan.competency.repository.CompetencyRepository;

@Service
public class JobPositionCompetencyService
        extends BaseService<JobPositionCompetency, JobPositionCompetencyRequestDto, JobPositionCompetencyResponseDto>
        implements IJobPositionCompetencyService {

    private final JobPositionCompetencyRepository repository;
    private final JobPositionCompetencyMapper mapper;
    private final JobPositionRepository jobPositionRepository;
    private final CompetencyRepository competencyRepository;

    public JobPositionCompetencyService(
            JobPositionCompetencyRepository repository,
            JobPositionCompetencyMapper mapper,
            JobPositionRepository jobPositionRepository,
            CompetencyRepository competencyRepository) {
        super(
                repository,
                entity -> mapper.toResponse(
                        entity,
                        competencyRepository
                                .findByIdAndStatusNot(entity.getCompetencyId(), StatusEnum.DELETED)
                                .orElse(null)),
                mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.jobPositionRepository = jobPositionRepository;
        this.competencyRepository = competencyRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobposition:read')")
    public List<JobPositionCompetencyResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobposition:read')")
    public List<JobPositionCompetencyResponseDto> findAll(StatusEnum status) {
        return super.findAll(status);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobposition:read')")
    public JobPositionCompetencyResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobposition:read')")
    public PageableResponseDto<JobPositionCompetencyResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobposition:read')")
    public List<JobPositionCompetencyResponseDto> findByJobPositionId(UUID jobPositionId) {
        return repository.findByJobPositionIdOrdered(jobPositionId, StatusEnum.DELETED).stream()
                .map(entity -> mapper.toResponse(entity, resolveCompetency(entity.getCompetencyId())))
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobposition:write')")
    public JobPositionCompetencyResponseDto create(JobPositionCompetencyRequestDto request) {
        Competency competency = requireCompetency(request.getCompetencyId());
        JobPositionCompetency entity = mapper.toEntity(request);
        entity.setStatus(StatusEnum.ACTIVE);
        applyCompanyScopeFromJobPosition(entity, request.getJobPositionId());
        Integer maxVersion = repository.findMaxVersionNumber(
                request.getJobPositionId(), request.getCompetencyId(), StatusEnum.DELETED);
        entity.setVersionNumber(maxVersion == null ? 1 : maxVersion + 1);
        closePreviousVersions(entity);
        return mapper.toResponse(repository.save(entity), competency);
    }

    /**
     * Competencia versionada: editar nunca sobrescreve. Fecha validUntil da versao anterior e cria
     * nova linha (RN-04 / RN-11).
     */
    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobposition:write')")
    public JobPositionCompetencyResponseDto update(UUID id, JobPositionCompetencyRequestDto request) {
        Competency competency = requireCompetency(request.getCompetencyId());
        JobPositionCompetency current = findEntity(id);
        LocalDate closeDate = request.getValidFrom() != null
                ? request.getValidFrom().minusDays(1)
                : LocalDate.now().minusDays(1);
        if (current.getValidUntil() == null || current.getValidUntil().isAfter(closeDate)) {
            current.setValidUntil(closeDate);
            repository.save(current);
        }

        JobPositionCompetency next = mapper.toEntity(request);
        next.setStatus(StatusEnum.ACTIVE);
        applyCompanyScopeFromJobPosition(next, request.getJobPositionId());
        Integer maxVersion = repository.findMaxVersionNumber(
                request.getJobPositionId(), request.getCompetencyId(), StatusEnum.DELETED);
        next.setVersionNumber(maxVersion == null ? 1 : maxVersion + 1);
        return mapper.toResponse(repository.save(next), competency);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobposition:write')")
    public void activate(UUID id) {
        super.activate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobposition:write')")
    public void deactivate(UUID id) {
        super.deactivate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobposition:write')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected JobPositionCompetency findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(JobPositionCompetencyException::notFound);
    }

    @Override
    protected void updateEntity(JobPositionCompetency entity, JobPositionCompetencyRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private Competency requireCompetency(UUID competencyId) {
        return competencyRepository
                .findByIdAndStatusNot(competencyId, StatusEnum.DELETED)
                .orElseThrow(JobPositionCompetencyException::competencyNotFound);
    }

    private Competency resolveCompetency(UUID competencyId) {
        return competencyRepository.findByIdAndStatusNot(competencyId, StatusEnum.DELETED).orElse(null);
    }

    private void applyCompanyScopeFromJobPosition(JobPositionCompetency entity, UUID jobPositionId) {
        JobPosition jobPosition = jobPositionRepository
                .findByIdAndStatusNot(jobPositionId, StatusEnum.DELETED)
                .orElseThrow(JobPositionException::notFound);
        entity.setCompanyId(jobPosition.getCompanyId());
    }

    private void closePreviousVersions(JobPositionCompetency entity) {
        List<JobPositionCompetency> open =
                repository.findByJobPositionIdAndCompetencyIdAndValidUntilIsNullAndStatusNot(
                        entity.getJobPositionId(), entity.getCompetencyId(), StatusEnum.DELETED);
        LocalDate closeDate = entity.getValidFrom().minusDays(1);
        for (JobPositionCompetency previous : open) {
            previous.setValidUntil(closeDate);
            repository.save(previous);
        }
    }
}
