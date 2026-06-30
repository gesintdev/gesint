package br.com.gommo.modules.rh.person.developmentplan.planorigin.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.developmentplan.planorigin.dto.DevelopmentPlanOriginRequestDto;
import br.com.gommo.modules.rh.person.developmentplan.planorigin.dto.DevelopmentPlanOriginResponseDto;
import br.com.gommo.modules.rh.person.developmentplan.planorigin.entity.DevelopmentPlanOrigin;
import br.com.gommo.modules.rh.person.developmentplan.planorigin.exception.DevelopmentPlanOriginException;
import br.com.gommo.modules.rh.person.developmentplan.planorigin.mapper.DevelopmentPlanOriginMapper;
import br.com.gommo.modules.rh.person.developmentplan.planorigin.repository.DevelopmentPlanOriginRepository;

@Service
public class DevelopmentPlanOriginService
        extends BaseService<DevelopmentPlanOrigin, DevelopmentPlanOriginRequestDto, DevelopmentPlanOriginResponseDto>
        implements IDevelopmentPlanOriginService {

    private final DevelopmentPlanOriginRepository repository;
    private final DevelopmentPlanOriginMapper mapper;

    public DevelopmentPlanOriginService(
            DevelopmentPlanOriginRepository repository, DevelopmentPlanOriginMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplanconfig:read')")
    public List<DevelopmentPlanOriginResponseDto> findAll() {
        return repository.findAllByStatusNotOrderByNameAsc(StatusEnum.DELETED).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplanconfig:read')")
    public DevelopmentPlanOriginResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplanconfig:read')")
    public PageableResponseDto<DevelopmentPlanOriginResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplanconfig:write')")
    public DevelopmentPlanOriginResponseDto create(DevelopmentPlanOriginRequestDto request) {
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplanconfig:write')")
    public DevelopmentPlanOriginResponseDto update(UUID id, DevelopmentPlanOriginRequestDto request) {
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplanconfig:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected DevelopmentPlanOrigin findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(DevelopmentPlanOriginException::notFound);
    }

    @Override
    protected void updateEntity(DevelopmentPlanOrigin entity, DevelopmentPlanOriginRequestDto request) {
        mapper.updateEntity(entity, request);
    }
}
