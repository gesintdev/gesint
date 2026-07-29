package br.com.gommo.core.base.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.AuditEntity;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.exception.BusinessException;

public abstract class BaseService<T extends AuditEntity, RequestDto, ResponseDto>
        implements IBaseService<RequestDto, ResponseDto> {

    private static final List<String> STATUS_FILTER_OPTIONS = List.of(
            StatusEnum.ACTIVE.name(), StatusEnum.INACTIVE.name());

    private final IBaseRepository<T> repository;
    private final Function<T, ResponseDto> toResponse;
    private final Function<RequestDto, T> toEntity;
    private final String notFoundCode;
    private final String notFoundMessage;

    protected BaseService(
            IBaseRepository<T> repository, Function<T, ResponseDto> toResponse, Function<RequestDto, T> toEntity) {
        this(repository, toResponse, toEntity, null, null);
    }

    protected BaseService(
            IBaseRepository<T> repository,
            Function<T, ResponseDto> toResponse,
            Function<RequestDto, T> toEntity,
            String notFoundCode,
            String notFoundMessage) {
        this.repository = repository;
        this.toResponse = toResponse;
        this.toEntity = toEntity;
        this.notFoundCode = notFoundCode;
        this.notFoundMessage = notFoundMessage;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResponseDto> findAll() {
        return findAll(StatusEnum.ACTIVE);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResponseDto> findAll(StatusEnum status) {
        StatusEnum resolved = resolveListStatus(status);
        return repository.findAllByStatusOrderByCreatedAtDesc(resolved).stream()
                .map(toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseDto findById(UUID id) {
        return toResponse.apply(findEntity(id));
    }

    @Override
    @Transactional
    public ResponseDto create(RequestDto request) {
        T entity = toEntity.apply(request);
        entity.setStatus(StatusEnum.ACTIVE);
        return toResponse.apply(repository.save(entity));
    }

    @Override
    @Transactional
    public ResponseDto update(UUID id, RequestDto request) {
        T entity = findEntity(id);
        updateEntity(entity, request);
        return toResponse.apply(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        T entity = findEntity(id);
        entity.setStatus(StatusEnum.DELETED);
        repository.save(entity);
    }

    @Override
    @Transactional
    public void activate(UUID id) {
        T entity = findEntity(id);
        entity.setStatus(StatusEnum.ACTIVE);
        repository.save(entity);
    }

    @Override
    @Transactional
    public void deactivate(UUID id) {
        T entity = findEntity(id);
        entity.setStatus(StatusEnum.INACTIVE);
        repository.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public PageableResponseDto<ResponseDto> findPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<T> result = repository.findAllByStatus(StatusEnum.ACTIVE, pageable);
        List<ResponseDto> content = result.getContent().stream().map(toResponse).toList();
        return PageableResponseDto.<ResponseDto>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .filterOptions(Map.of("status", STATUS_FILTER_OPTIONS))
                .build();
    }

    protected abstract void updateEntity(T entity, RequestDto request);

    protected T findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(this::entityNotFound);
    }

    protected RuntimeException entityNotFound() {
        if (notFoundCode != null && notFoundMessage != null) {
            return new BusinessException(notFoundCode, notFoundMessage, HttpStatus.NOT_FOUND);
        }
        throw new IllegalStateException("findEntity() must be overridden or notFoundCode/message provided");
    }

    protected static StatusEnum resolveListStatus(StatusEnum status) {
        if (status == StatusEnum.INACTIVE) {
            return StatusEnum.INACTIVE;
        }
        return StatusEnum.ACTIVE;
    }

    protected static StatusEnum resolveStatusFilter(Map<String, List<String>> filters) {
        if (filters == null || filters.isEmpty()) {
            return StatusEnum.ACTIVE;
        }
        List<String> values = filters.get("status");
        if (values == null || values.isEmpty()) {
            return StatusEnum.ACTIVE;
        }
        String raw = values.getFirst();
        if (raw != null && raw.equalsIgnoreCase(StatusEnum.INACTIVE.name())) {
            return StatusEnum.INACTIVE;
        }
        return StatusEnum.ACTIVE;
    }
}
