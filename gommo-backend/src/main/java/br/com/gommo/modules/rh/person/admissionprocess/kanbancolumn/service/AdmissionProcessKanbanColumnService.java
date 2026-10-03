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
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.entity.KanbanColumnActionEnum;
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
        return findAll(StatusEnum.ACTIVE);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('admission:read')")
    public List<AdmissionProcessKanbanColumnResponseDto> findAll(StatusEnum status) {
        StatusEnum resolved = status == StatusEnum.INACTIVE ? StatusEnum.INACTIVE : StatusEnum.ACTIVE;
        return repository.findAllByStatusNotOrderByDisplayOrderAscNameAsc(StatusEnum.DELETED).stream()
                .filter(column -> column.getStatus() == resolved)
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
        rejectReservedKey(request.getColumnKey());
        assertUniqueHireAction(null, request.getColumnAction());
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('admission:write')")
    public AdmissionProcessKanbanColumnResponseDto update(UUID id, AdmissionProcessKanbanColumnRequestDto request) {
        normalize(request);
        AdmissionProcessKanbanColumn current = findEntity(id);
        if (current.isSystemColumn()) {
            if (request.getColumnKey() != null && !request.getColumnKey().equals(current.getColumnKey())) {
                throw AdmissionProcessKanbanColumnException.systemColumnLocked();
            }
            request.setColumnKey(current.getColumnKey());
            request.setColumnAction(KanbanColumnActionEnum.NONE);
        } else {
            rejectReservedKey(request.getColumnKey());
            assertUniqueHireAction(id, request.getColumnAction());
        }
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('admission:write')")
    public void activate(UUID id) {
        super.activate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('admission:write')")
    public void deactivate(UUID id) {
        requireNotSystemColumn(id);
        super.deactivate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('admission:delete')")
    public void delete(UUID id) {
        requireNotSystemColumn(id);
        super.delete(id);
    }

    private void requireNotSystemColumn(UUID id) {
        if (findEntity(id).isSystemColumn()) {
            throw AdmissionProcessKanbanColumnException.systemColumnLocked();
        }
    }

    private static void rejectReservedKey(String columnKey) {
        if (AdmissionProcessKanbanColumn.CLOSED_COLUMN_KEY.equals(columnKey)) {
            throw AdmissionProcessKanbanColumnException.reservedKey();
        }
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
        if (request.getColumnAction() == null) {
            request.setColumnAction(KanbanColumnActionEnum.NONE);
        }
    }

    private void assertUniqueHireAction(UUID currentId, KanbanColumnActionEnum action) {
        if (action != KanbanColumnActionEnum.CREATE_ADMISSION) {
            return;
        }
        boolean exists = repository.findAllByStatusNotOrderByDisplayOrderAscNameAsc(StatusEnum.DELETED).stream()
                .filter(column -> column.getStatus() != StatusEnum.DELETED)
                .filter(column -> column.getColumnAction() == KanbanColumnActionEnum.CREATE_ADMISSION)
                .anyMatch(column -> currentId == null || !column.getId().equals(currentId));
        if (exists) {
            throw AdmissionProcessKanbanColumnException.duplicateHireAction();
        }
    }
}
