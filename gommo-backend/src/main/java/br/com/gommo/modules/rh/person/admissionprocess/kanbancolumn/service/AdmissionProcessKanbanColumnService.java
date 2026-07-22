package br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.dto.AdmissionProcessKanbanColumnRequestDto;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.dto.AdmissionProcessKanbanColumnResponseDto;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.entity.AdmissionProcessKanbanColumn;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.exception.AdmissionProcessKanbanColumnException;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.mapper.AdmissionProcessKanbanColumnMapper;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.repository.AdmissionProcessKanbanColumnRepository;

@Service
public class AdmissionProcessKanbanColumnService
        extends BaseService<
                AdmissionProcessKanbanColumn,
                AdmissionProcessKanbanColumnRequestDto,
                AdmissionProcessKanbanColumnResponseDto>
        implements IAdmissionProcessKanbanColumnService {

    private final AdmissionProcessKanbanColumnRepository repository;
    private final AdmissionProcessKanbanColumnMapper mapper;

    public AdmissionProcessKanbanColumnService(
            AdmissionProcessKanbanColumnRepository repository, AdmissionProcessKanbanColumnMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('admission:read')")
    public List<AdmissionProcessKanbanColumnResponseDto> findAll() {
        return repository.findAllByStatusNotOrderByDisplayOrderAscNameAsc(StatusEnum.DELETED).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('admission:read')")
    public AdmissionProcessKanbanColumnResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('admission:read')")
    public PageableResponseDto<AdmissionProcessKanbanColumnResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('admission:write')")
    public AdmissionProcessKanbanColumnResponseDto create(AdmissionProcessKanbanColumnRequestDto request) {
        normalize(request);
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('admission:write')")
    public AdmissionProcessKanbanColumnResponseDto update(UUID id, AdmissionProcessKanbanColumnRequestDto request) {
        normalize(request);
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('admission:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected AdmissionProcessKanbanColumn findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(AdmissionProcessKanbanColumnException::notFound);
    }

    @Override
    protected void updateEntity(
            AdmissionProcessKanbanColumn entity, AdmissionProcessKanbanColumnRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private void normalize(AdmissionProcessKanbanColumnRequestDto request) {
        if (request.getColumnKey() != null) {
            request.setColumnKey(request.getColumnKey().trim().toLowerCase());
        }
        if (request.getName() != null) {
            request.setName(request.getName().trim());
        }
        if (request.getColor() != null) {
            String color = request.getColor().trim();
            request.setColor(color.isEmpty() ? null : color.toUpperCase());
        }
        if (request.getDisplayOrder() == null) {
            request.setDisplayOrder(0);
        }
    }
}
