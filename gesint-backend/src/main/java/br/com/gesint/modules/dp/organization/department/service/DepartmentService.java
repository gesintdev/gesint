package br.com.gesint.modules.dp.organization.department.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.base.dto.PageableResponseDto;
import br.com.gesint.core.base.service.BaseService;
import br.com.gesint.core.branch.BranchCatalogScopeApplier;
import br.com.gesint.core.branch.BranchCatalogScopes;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.core.util.TextSearchUtils;
import br.com.gesint.modules.dp.organization.department.dto.DepartmentRequestDto;
import br.com.gesint.modules.dp.organization.department.dto.DepartmentResponseDto;
import br.com.gesint.modules.dp.organization.department.entity.Department;
import br.com.gesint.modules.dp.organization.department.exception.DepartmentException;
import br.com.gesint.modules.dp.organization.department.mapper.DepartmentMapper;
import br.com.gesint.modules.dp.organization.department.repository.DepartmentRepository;
import br.com.gesint.modules.root.search.document.SearchDocumentType;
import br.com.gesint.modules.root.search.document.service.ISearchDocumentIndexer;
import br.com.gesint.modules.root.search.service.provider.DepartmentGlobalSearchProvider;

@Service
public class DepartmentService extends BaseService<Department, DepartmentRequestDto, DepartmentResponseDto>
        implements IDepartmentService {

    private final DepartmentRepository repository;
    private final DepartmentMapper mapper;
    private final ISearchDocumentIndexer searchDocumentIndexer;
    private final BranchCatalogScopeApplier branchCatalogScopeApplier;

    public DepartmentService(
            DepartmentRepository repository,
            DepartmentMapper mapper,
            ISearchDocumentIndexer searchDocumentIndexer,
            BranchCatalogScopeApplier branchCatalogScopeApplier) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.searchDocumentIndexer = searchDocumentIndexer;
        this.branchCatalogScopeApplier = branchCatalogScopeApplier;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('department:read')")
    public List<DepartmentResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('department:read')")
    public DepartmentResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('department:read')")
    public PageableResponseDto<DepartmentResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('department:read')")
    public PageableResponseDto<DepartmentResponseDto> search(int page, int size, String name, String costCenter) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Department> result = repository.search(
                StatusEnum.DELETED,
                TextSearchUtils.toLikePattern(name),
                TextSearchUtils.toLikePattern(costCenter),
                pageable);
        List<DepartmentResponseDto> content =
                result.getContent().stream().map(mapper::toResponse).toList();
        return PageableResponseDto.<DepartmentResponseDto>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('department:write')")
    public DepartmentResponseDto create(DepartmentRequestDto request) {
        Department entity = mapper.toEntity(request);
        entity.setStatus(StatusEnum.ACTIVE);
        branchCatalogScopeApplier.apply(
                entity, BranchCatalogScopes.resolveCompanyId(request.getCompanyId(), request.getSharedAcrossBranches()));
        DepartmentResponseDto created = mapper.toResponse(repository.save(entity));
        indexDepartment(findEntity(created.getId()));
        return created;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('department:write')")
    public DepartmentResponseDto update(UUID id, DepartmentRequestDto request) {
        Department entity = findEntity(id);
        mapper.updateEntity(entity, request);
        branchCatalogScopeApplier.apply(
                entity, BranchCatalogScopes.resolveCompanyId(request.getCompanyId(), request.getSharedAcrossBranches()));
        DepartmentResponseDto updated = mapper.toResponse(repository.save(entity));
        indexDepartment(entity);
        return updated;
    }

    
    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('department:read')")
    public List<DepartmentResponseDto> findAll(StatusEnum status) {
        return super.findAll(status);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('department:write')")
    public void activate(UUID id) {
        super.activate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('department:write')")
    public void deactivate(UUID id) {
        super.deactivate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('department:delete')")
    public void delete(UUID id) {
        super.delete(id);
        searchDocumentIndexer.remove(SearchDocumentType.DEPARTMENT, id);
    }

    private void indexDepartment(Department department) {
        String searchText = department.getName()
                + (department.getCostCenter() != null ? " " + department.getCostCenter() : "");
        searchDocumentIndexer.upsert(
                SearchDocumentType.DEPARTMENT,
                department.getId(),
                department.getCompanyId(),
                department.getName(),
                department.getCostCenter(),
                searchText,
                DepartmentGlobalSearchProvider.HREF);
    }

    @Override
    protected Department findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(DepartmentException::notFound);
    }

    @Override
    protected void updateEntity(Department entity, DepartmentRequestDto request) {
        mapper.updateEntity(entity, request);
    }
}
