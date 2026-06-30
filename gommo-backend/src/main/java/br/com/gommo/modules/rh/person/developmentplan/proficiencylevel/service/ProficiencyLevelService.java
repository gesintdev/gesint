package br.com.gommo.modules.rh.person.developmentplan.proficiencylevel.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.developmentplan.proficiencylevel.dto.ProficiencyLevelRequestDto;
import br.com.gommo.modules.rh.person.developmentplan.proficiencylevel.dto.ProficiencyLevelResponseDto;
import br.com.gommo.modules.rh.person.developmentplan.proficiencylevel.entity.ProficiencyLevel;
import br.com.gommo.modules.rh.person.developmentplan.proficiencylevel.exception.ProficiencyLevelException;
import br.com.gommo.modules.rh.person.developmentplan.proficiencylevel.mapper.ProficiencyLevelMapper;
import br.com.gommo.modules.rh.person.developmentplan.proficiencylevel.repository.ProficiencyLevelRepository;

@Service
public class ProficiencyLevelService
        extends BaseService<ProficiencyLevel, ProficiencyLevelRequestDto, ProficiencyLevelResponseDto>
        implements IProficiencyLevelService {

    private final ProficiencyLevelRepository repository;
    private final ProficiencyLevelMapper mapper;

    public ProficiencyLevelService(ProficiencyLevelRepository repository, ProficiencyLevelMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplanconfig:read')")
    public List<ProficiencyLevelResponseDto> findAll() {
        return repository.findAllByStatusNotOrderByLevelOrderAsc(StatusEnum.DELETED).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplanconfig:read')")
    public ProficiencyLevelResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplanconfig:read')")
    public PageableResponseDto<ProficiencyLevelResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplanconfig:write')")
    public ProficiencyLevelResponseDto create(ProficiencyLevelRequestDto request) {
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplanconfig:write')")
    public ProficiencyLevelResponseDto update(UUID id, ProficiencyLevelRequestDto request) {
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplanconfig:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected ProficiencyLevel findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(ProficiencyLevelException::notFound);
    }

    @Override
    protected void updateEntity(ProficiencyLevel entity, ProficiencyLevelRequestDto request) {
        mapper.updateEntity(entity, request);
    }
}
