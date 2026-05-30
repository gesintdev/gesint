package br.com.gommo.modules.organization.department.service;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.organization.department.dto.DepartmentRequestDto;
import br.com.gommo.modules.organization.department.dto.DepartmentResponseDto;
import br.com.gommo.modules.organization.department.entity.Department;
import br.com.gommo.modules.organization.department.exception.DepartmentException;
import br.com.gommo.modules.organization.department.mapper.DepartmentMapper;
import br.com.gommo.modules.organization.department.repository.DepartmentRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DepartmentService extends BaseService<Department, DepartmentRequestDto, DepartmentResponseDto>
        implements IDepartmentService {

    private final DepartmentRepository repository;
    private final DepartmentMapper mapper;

    public DepartmentService(DepartmentRepository repository, DepartmentMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
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
    @Transactional
    @PreAuthorize("hasAuthority('department:write')")
    public DepartmentResponseDto create(DepartmentRequestDto request) {

        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('department:write')")
    public DepartmentResponseDto update(UUID id, DepartmentRequestDto request) {

        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('department:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected Department findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(DepartmentException::notFound);
    }

    @Override
    protected void updateEntity(Department entity, DepartmentRequestDto request) {
        mapper.updateEntity(entity, request);
    }
}
