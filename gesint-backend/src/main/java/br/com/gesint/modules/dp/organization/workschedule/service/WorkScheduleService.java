package br.com.gesint.modules.dp.organization.workschedule.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import br.com.gesint.core.base.dto.PageableResponseDto;
import br.com.gesint.core.base.service.BaseService;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.core.util.TextSearchUtils;
import br.com.gesint.modules.dp.organization.workschedule.dto.WorkScheduleRequestDto;
import br.com.gesint.modules.dp.organization.workschedule.dto.WorkScheduleResponseDto;
import br.com.gesint.modules.dp.organization.workschedule.entity.WorkSchedule;
import br.com.gesint.modules.dp.organization.workschedule.exception.WorkScheduleException;
import br.com.gesint.modules.dp.organization.workschedule.mapper.WorkScheduleMapper;
import br.com.gesint.modules.dp.organization.workschedule.repository.WorkScheduleRepository;

@Service
public class WorkScheduleService extends BaseService<WorkSchedule, WorkScheduleRequestDto, WorkScheduleResponseDto>
        implements IWorkScheduleService {

    private final WorkScheduleRepository repository;
    private final WorkScheduleMapper mapper;

    public WorkScheduleService(WorkScheduleRepository repository, WorkScheduleMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('workschedule:read')")
    public List<WorkScheduleResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('workschedule:read')")
    public WorkScheduleResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('workschedule:read')")
    public PageableResponseDto<WorkScheduleResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('workschedule:read')")
    public PageableResponseDto<WorkScheduleResponseDto> search(int page, int size, String name) {
        Pageable pageable = PageRequest.of(page, size);
        Page<WorkSchedule> result =
                repository.search(StatusEnum.DELETED, TextSearchUtils.toLikePattern(name), pageable);
        List<WorkScheduleResponseDto> content =
                result.getContent().stream().map(mapper::toResponse).toList();
        return PageableResponseDto.<WorkScheduleResponseDto>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('workschedule:read')")
    public List<WorkScheduleResponseDto> listActive() {
        return repository.findByStatusOrderByNameAsc(StatusEnum.ACTIVE).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('workschedule:write')")
    public WorkScheduleResponseDto create(WorkScheduleRequestDto request) {
        validate(request);
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('workschedule:write')")
    public WorkScheduleResponseDto update(UUID id, WorkScheduleRequestDto request) {
        validate(request);
        return super.update(id, request);
    }

    
    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('workschedule:read')")
    public List<WorkScheduleResponseDto> findAll(StatusEnum status) {
        return super.findAll(status);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('workschedule:write')")
    public void activate(UUID id) {
        super.activate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('workschedule:write')")
    public void deactivate(UUID id) {
        super.deactivate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('workschedule:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected WorkSchedule findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(WorkScheduleException::notFound);
    }

    @Override
    protected void updateEntity(WorkSchedule entity, WorkScheduleRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private void validate(WorkScheduleRequestDto request) {
        if (request == null || !StringUtils.hasText(request.getName())) {
            throw WorkScheduleException.nameRequired();
        }
    }
}
