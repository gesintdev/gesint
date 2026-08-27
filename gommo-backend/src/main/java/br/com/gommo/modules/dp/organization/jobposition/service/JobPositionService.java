package br.com.gommo.modules.dp.organization.jobposition.service;

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
import br.com.gommo.core.branch.BranchCatalogScopes;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.util.TextSearchUtils;
import br.com.gommo.modules.dp.organization.jobposition.dto.JobPositionRequestDto;
import br.com.gommo.modules.dp.organization.jobposition.dto.JobPositionResponseDto;
import br.com.gommo.modules.dp.organization.jobposition.entity.JobPosition;
import br.com.gommo.modules.dp.organization.jobposition.entity.JobPositionNatureEnum;
import br.com.gommo.modules.dp.organization.jobposition.exception.JobPositionException;
import br.com.gommo.modules.dp.organization.jobposition.mapper.JobPositionMapper;
import br.com.gommo.modules.dp.organization.jobposition.repository.JobPositionRepository;
import br.com.gommo.modules.root.search.document.SearchDocumentType;
import br.com.gommo.modules.root.search.document.service.ISearchDocumentIndexer;
import br.com.gommo.modules.root.search.service.provider.JobPositionGlobalSearchProvider;

@Service
public class JobPositionService extends BaseService<JobPosition, JobPositionRequestDto, JobPositionResponseDto>
        implements IJobPositionService {

    private final JobPositionRepository repository;
    private final JobPositionMapper mapper;
    private final ISearchDocumentIndexer searchDocumentIndexer;

    public JobPositionService(
            JobPositionRepository repository,
            JobPositionMapper mapper,
            ISearchDocumentIndexer searchDocumentIndexer) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.searchDocumentIndexer = searchDocumentIndexer;
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
            int page, int size, String title, String cboCode, UUID departmentId, JobPositionNatureEnum nature) {
        Pageable pageable = PageRequest.of(page, size);
        Page<JobPosition> result = repository.search(
                StatusEnum.DELETED,
                TextSearchUtils.toLikePattern(title),
                TextSearchUtils.toLikePattern(cboCode),
                departmentId,
                nature,
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
        JobPosition entity = mapper.toEntity(request);
        entity.setStatus(StatusEnum.ACTIVE);
        BranchCatalogScopes.apply(entity, request.getSharedAcrossBranches());
        JobPositionResponseDto created = mapper.toResponse(repository.save(entity));
        indexJobPosition(findEntity(created.getId()));
        return created;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobposition:write')")
    public JobPositionResponseDto update(UUID id, JobPositionRequestDto request) {
        JobPosition entity = findEntity(id);
        mapper.updateEntity(entity, request);
        BranchCatalogScopes.apply(entity, request.getSharedAcrossBranches());
        JobPositionResponseDto updated = mapper.toResponse(repository.save(entity));
        indexJobPosition(entity);
        return updated;
    }

    
    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobposition:read')")
    public List<JobPositionResponseDto> findAll(StatusEnum status) {
        return super.findAll(status);
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
    @PreAuthorize("hasAuthority('jobposition:delete')")
    public void delete(UUID id) {
        super.delete(id);
        searchDocumentIndexer.remove(SearchDocumentType.JOB_POSITION, id);
    }

    private void indexJobPosition(JobPosition jobPosition) {
        String subtitle = jobPosition.getCboCode() != null && !jobPosition.getCboCode().isBlank()
                ? "CBO " + jobPosition.getCboCode()
                : null;
        String searchText = jobPosition.getTitle()
                + (jobPosition.getCboCode() != null ? " " + jobPosition.getCboCode() : "");
        searchDocumentIndexer.upsert(
                SearchDocumentType.JOB_POSITION,
                jobPosition.getId(),
                jobPosition.getTitle(),
                subtitle,
                searchText,
                JobPositionGlobalSearchProvider.HREF);
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
