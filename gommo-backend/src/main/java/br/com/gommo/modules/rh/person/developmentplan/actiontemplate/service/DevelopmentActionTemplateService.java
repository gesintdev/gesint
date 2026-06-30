package br.com.gommo.modules.rh.person.developmentplan.actiontemplate.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.developmentplan.actiontemplate.dto.DevelopmentActionTemplateRequestDto;
import br.com.gommo.modules.rh.person.developmentplan.actiontemplate.dto.DevelopmentActionTemplateResponseDto;
import br.com.gommo.modules.rh.person.developmentplan.actiontemplate.entity.DevelopmentActionTemplate;
import br.com.gommo.modules.rh.person.developmentplan.actiontemplate.exception.DevelopmentActionTemplateException;
import br.com.gommo.modules.rh.person.developmentplan.actiontemplate.mapper.DevelopmentActionTemplateMapper;
import br.com.gommo.modules.rh.person.developmentplan.actiontemplate.repository.DevelopmentActionTemplateRepository;

@Service
public class DevelopmentActionTemplateService
        extends BaseService<
                DevelopmentActionTemplate,
                DevelopmentActionTemplateRequestDto,
                DevelopmentActionTemplateResponseDto>
        implements IDevelopmentActionTemplateService {

    private final DevelopmentActionTemplateRepository repository;
    private final DevelopmentActionTemplateMapper mapper;

    public DevelopmentActionTemplateService(
            DevelopmentActionTemplateRepository repository, DevelopmentActionTemplateMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplanconfig:read')")
    public List<DevelopmentActionTemplateResponseDto> findAll() {
        return repository.findAllByStatusNotOrderByTitleAsc(StatusEnum.DELETED).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplanconfig:read')")
    public DevelopmentActionTemplateResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplanconfig:read')")
    public PageableResponseDto<DevelopmentActionTemplateResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplanconfig:write')")
    public DevelopmentActionTemplateResponseDto create(DevelopmentActionTemplateRequestDto request) {
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplanconfig:write')")
    public DevelopmentActionTemplateResponseDto update(UUID id, DevelopmentActionTemplateRequestDto request) {
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplanconfig:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected DevelopmentActionTemplate findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(DevelopmentActionTemplateException::notFound);
    }

    @Override
    protected void updateEntity(DevelopmentActionTemplate entity, DevelopmentActionTemplateRequestDto request) {
        mapper.updateEntity(entity, request);
    }
}
