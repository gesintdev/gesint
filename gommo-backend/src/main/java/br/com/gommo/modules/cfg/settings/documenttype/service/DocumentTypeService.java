package br.com.gommo.modules.cfg.settings.documenttype.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.settings.documenttype.dto.DocumentTypeRequestDto;
import br.com.gommo.modules.cfg.settings.documenttype.dto.DocumentTypeResponseDto;
import br.com.gommo.modules.cfg.settings.documenttype.entity.DocumentType;
import br.com.gommo.modules.cfg.settings.documenttype.exception.DocumentTypeException;
import br.com.gommo.modules.cfg.settings.documenttype.mapper.DocumentTypeMapper;
import br.com.gommo.modules.cfg.settings.documenttype.repository.DocumentTypeRepository;

@Service
public class DocumentTypeService extends BaseService<DocumentType, DocumentTypeRequestDto, DocumentTypeResponseDto>
        implements IDocumentTypeService {

    private final DocumentTypeRepository repository;
    private final DocumentTypeMapper mapper;

    public DocumentTypeService(DocumentTypeRepository repository, DocumentTypeMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('documenttype:read')")
    public List<DocumentTypeResponseDto> findAll() {
        return findAll(StatusEnum.ACTIVE);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('documenttype:read')")
    public List<DocumentTypeResponseDto> findAll(StatusEnum status) {
        StatusEnum resolved = status == StatusEnum.INACTIVE ? StatusEnum.INACTIVE : StatusEnum.ACTIVE;
        return repository.findAllByStatusNotOrderBySortOrderAscNameAsc(StatusEnum.DELETED).stream()
                .filter(entity -> entity.getStatus() == resolved)
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('documenttype:read')")
    public DocumentTypeResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('documenttype:read')")
    public PageableResponseDto<DocumentTypeResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    /**
     * Catalogo ativo por contexto para seletores de anexo (qualquer usuario autenticado).
     * A classe sensivel/financeiro e aplicada na checagem de download da entidade dona (SEG-01).
     */
    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("isAuthenticated()")
    public List<DocumentTypeResponseDto> findActiveByContext(String context) {
        if (context == null || context.isBlank()) {
            return List.of();
        }
        String normalized = context.trim().toUpperCase();
        return repository.findAllByStatusNotOrderBySortOrderAscNameAsc(StatusEnum.DELETED).stream()
                .filter(entity -> entity.getStatus() == StatusEnum.ACTIVE)
                .filter(entity -> entity.getContexts() != null && entity.getContexts().contains(normalized))
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('documenttype:write')")
    public DocumentTypeResponseDto create(DocumentTypeRequestDto request) {
        assertUniqueTypeCode(request.getTypeCode(), null);
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('documenttype:write')")
    public DocumentTypeResponseDto update(UUID id, DocumentTypeRequestDto request) {
        DocumentType entity = findEntity(id);
        boolean lockTypeCode = Boolean.TRUE.equals(entity.getSystemManaged());
        if (!lockTypeCode) {
            assertUniqueTypeCode(request.getTypeCode(), id);
        }
        mapper.updateEntity(entity, request, lockTypeCode);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('documenttype:write')")
    public void activate(UUID id) {
        super.activate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('documenttype:write')")
    public void deactivate(UUID id) {
        super.deactivate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('documenttype:delete')")
    public void delete(UUID id) {
        DocumentType entity = findEntity(id);
        if (Boolean.TRUE.equals(entity.getSystemManaged())) {
            throw DocumentTypeException.systemDeleteProtected();
        }
        super.delete(id);
    }

    @Override
    protected DocumentType findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(DocumentTypeException::notFound);
    }

    @Override
    protected void updateEntity(DocumentType entity, DocumentTypeRequestDto request) {
        mapper.updateEntity(entity, request, Boolean.TRUE.equals(entity.getSystemManaged()));
    }

    private void assertUniqueTypeCode(String typeCode, UUID excludeId) {
        if (typeCode == null || typeCode.isBlank()) {
            return;
        }
        String normalized = typeCode.trim();
        var existing =
                excludeId == null
                        ? repository.findByTypeCodeIgnoreCaseAndStatusNot(normalized, StatusEnum.DELETED)
                        : repository.findByTypeCodeIgnoreCaseAndStatusNotAndIdNot(
                                normalized, StatusEnum.DELETED, excludeId);
        if (existing.isPresent()) {
            throw DocumentTypeException.duplicate();
        }
    }
}
