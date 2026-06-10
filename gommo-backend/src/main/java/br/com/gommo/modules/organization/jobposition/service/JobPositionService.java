package br.com.gommo.modules.organization.jobposition.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.util.TextSearchUtils;
import br.com.gommo.modules.organization.jobposition.dto.JobPositionRequestDto;
import br.com.gommo.modules.organization.jobposition.dto.JobPositionResponseDto;
import br.com.gommo.modules.organization.jobposition.entity.JobPosition;
import br.com.gommo.modules.organization.jobposition.exception.JobPositionException;
import br.com.gommo.modules.organization.jobposition.mapper.JobPositionMapper;
import br.com.gommo.modules.organization.jobposition.repository.JobPositionRepository;

@Service
public class JobPositionService extends BaseService<JobPosition, JobPositionRequestDto, JobPositionResponseDto>
        implements IJobPositionService {

    private final JobPositionRepository repository;
    private final JobPositionMapper mapper;

    public JobPositionService(JobPositionRepository repository, JobPositionMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobposition:read')")
    public List<JobPositionResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobposition:read')")
    public JobPositionResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobposition:read')")
    public PageableResponseDto<JobPositionResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobposition:read')")
    public PageableResponseDto<JobPositionResponseDto> search(
            int page, int size, String title, String cboCode, UUID departmentId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<JobPosition> result = repository.search(
                StatusEnum.DELETED,
                TextSearchUtils.toLikePattern(title),
                TextSearchUtils.toLikePattern(cboCode),
                departmentId,
                pageable);
        List<JobPositionResponseDto> content =
                result.getContent().stream().map(mapper::toResponse).toList();
        return PageableResponseDto.<JobPositionResponseDto>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobposition:write')")
    public JobPositionResponseDto create(JobPositionRequestDto request) {

        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobposition:write')")
    public JobPositionResponseDto update(UUID id, JobPositionRequestDto request) {

        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobposition:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected JobPosition findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(JobPositionException::notFound);
    }

    @Override
    protected void updateEntity(JobPosition entity, JobPositionRequestDto request) {
        mapper.updateEntity(entity, request);
    }
}
