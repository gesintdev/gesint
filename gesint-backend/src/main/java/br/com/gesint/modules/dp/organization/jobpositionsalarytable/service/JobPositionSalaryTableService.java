package br.com.gesint.modules.dp.organization.jobpositionsalarytable.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
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
import br.com.gesint.modules.dp.organization.jobpositionsalarytable.dto.JobPositionSalaryTableRequestDto;
import br.com.gesint.modules.dp.organization.jobpositionsalarytable.dto.JobPositionSalaryTableResponseDto;
import br.com.gesint.modules.dp.organization.jobpositionsalarytable.entity.JobPositionSalaryTable;
import br.com.gesint.modules.dp.organization.jobpositionsalarytable.exception.JobPositionSalaryTableException;
import br.com.gesint.modules.dp.organization.jobpositionsalarytable.mapper.JobPositionSalaryTableMapper;
import br.com.gesint.modules.dp.organization.jobpositionsalarytable.repository.JobPositionSalaryTableRepository;

@Service
public class JobPositionSalaryTableService
        extends BaseService<JobPositionSalaryTable, JobPositionSalaryTableRequestDto, JobPositionSalaryTableResponseDto>
        implements IJobPositionSalaryTableService {

    private final JobPositionSalaryTableRepository repository;
    private final JobPositionSalaryTableMapper mapper;
    private final JobPositionRepository jobPositionRepository;

    public JobPositionSalaryTableService(
            JobPositionSalaryTableRepository repository,
            JobPositionSalaryTableMapper mapper,
            JobPositionRepository jobPositionRepository) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.jobPositionRepository = jobPositionRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobposition:read')")
    public List<JobPositionSalaryTableResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobposition:read')")
    public List<JobPositionSalaryTableResponseDto> findAll(StatusEnum status) {
        return super.findAll(status);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobposition:read')")
    public JobPositionSalaryTableResponseDto findById(UUID id) {
        return repository
                .findByIdWithItems(id, StatusEnum.DELETED)
                .map(mapper::toResponse)
                .orElseThrow(JobPositionSalaryTableException::notFound);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobposition:read')")
    public PageableResponseDto<JobPositionSalaryTableResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobposition:read')")
    public List<JobPositionSalaryTableResponseDto> findByJobPositionId(UUID jobPositionId) {
        return repository.findByJobPositionIdOrdered(jobPositionId, StatusEnum.DELETED).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobposition:read')")
    public Optional<JobPositionSalaryTableResponseDto> findCurrentByJobPositionId(UUID jobPositionId) {
        return repository
                .findCurrentByJobPositionIdWithItems(jobPositionId, StatusEnum.DELETED)
                .stream()
                .findFirst()
                .map(mapper::toResponse);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobposition:write')")
    public JobPositionSalaryTableResponseDto create(JobPositionSalaryTableRequestDto request) {
        JobPositionSalaryTable entity = mapper.toEntity(request);
        entity.setStatus(StatusEnum.ACTIVE);
        applyCompanyScopeFromJobPosition(entity, request.getJobPositionId());
        Integer maxVersion = repository.findMaxVersionNumber(request.getJobPositionId(), StatusEnum.DELETED);
        entity.setVersionNumber(maxVersion == null ? 1 : maxVersion + 1);
        closePreviousVersions(entity);
        return mapper.toResponse(repository.save(entity));
    }

    /**
     * Tabela versionada: editar nunca sobrescreve. Fecha a vigente e cria nova tabela com os itens.
     */
    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobposition:write')")
    public JobPositionSalaryTableResponseDto update(UUID id, JobPositionSalaryTableRequestDto request) {
        JobPositionSalaryTable current = findEntity(id);
        LocalDate closeDate = request.getValidFrom() != null
                ? request.getValidFrom().minusDays(1)
                : LocalDate.now().minusDays(1);
        if (current.getValidUntil() == null || current.getValidUntil().isAfter(closeDate)) {
            current.setValidUntil(closeDate);
            repository.save(current);
        }

        JobPositionSalaryTable next = mapper.toEntity(request);
        next.setStatus(StatusEnum.ACTIVE);
        applyCompanyScopeFromJobPosition(next, request.getJobPositionId());
        Integer maxVersion = repository.findMaxVersionNumber(request.getJobPositionId(), StatusEnum.DELETED);
        next.setVersionNumber(maxVersion == null ? 1 : maxVersion + 1);
        return mapper.toResponse(repository.save(next));
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
    protected JobPositionSalaryTable findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(JobPositionSalaryTableException::notFound);
    }

    @Override
    protected void updateEntity(JobPositionSalaryTable entity, JobPositionSalaryTableRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private void applyCompanyScopeFromJobPosition(JobPositionSalaryTable entity, UUID jobPositionId) {
        JobPosition jobPosition = jobPositionRepository
                .findByIdAndStatusNot(jobPositionId, StatusEnum.DELETED)
                .orElseThrow(JobPositionException::notFound);
        entity.setCompanyId(jobPosition.getCompanyId());
    }

    private void closePreviousVersions(JobPositionSalaryTable entity) {
        List<JobPositionSalaryTable> open =
                repository.findCurrentByJobPositionIdWithItems(entity.getJobPositionId(), StatusEnum.DELETED);
        LocalDate closeDate = entity.getValidFrom().minusDays(1);
        for (JobPositionSalaryTable previous : open) {
            previous.setValidUntil(closeDate);
            repository.save(previous);
        }
    }
}
