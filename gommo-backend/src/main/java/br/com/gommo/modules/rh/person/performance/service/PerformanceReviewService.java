package br.com.gommo.modules.rh.person.performance.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.performance.dto.PerformanceReviewRequestDto;
import br.com.gommo.modules.rh.person.performance.dto.PerformanceReviewResponseDto;
import br.com.gommo.modules.rh.person.performance.entity.PerformanceReview;
import br.com.gommo.modules.rh.person.performance.exception.PerformanceReviewException;
import br.com.gommo.modules.rh.person.performance.mapper.PerformanceReviewMapper;
import br.com.gommo.modules.rh.person.performance.repository.PerformanceReviewRepository;

@Service
public class PerformanceReviewService
        extends BaseService<PerformanceReview, PerformanceReviewRequestDto, PerformanceReviewResponseDto>
        implements IPerformanceReviewService {
    private final PerformanceReviewRepository repository;
    private final PerformanceReviewMapper mapper;

    public PerformanceReviewService(PerformanceReviewRepository repository, PerformanceReviewMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('performance:read')")
    public List<PerformanceReviewResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('performance:read')")
    public PerformanceReviewResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('performance:read')")
    public PageableResponseDto<PerformanceReviewResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('performance:write')")
    public PerformanceReviewResponseDto create(PerformanceReviewRequestDto request) {
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('performance:write')")
    public PerformanceReviewResponseDto update(UUID id, PerformanceReviewRequestDto request) {
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('performance:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected PerformanceReview findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(PerformanceReviewException::notFound);
    }

    @Override
    protected void updateEntity(PerformanceReview entity, PerformanceReviewRequestDto request) {
        mapper.updateEntity(entity, request);
    }
}
