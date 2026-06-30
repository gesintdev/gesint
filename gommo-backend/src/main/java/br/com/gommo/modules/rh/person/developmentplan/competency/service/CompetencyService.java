package br.com.gommo.modules.rh.person.developmentplan.competency.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.developmentplan.competency.dto.CompetencyRequestDto;
import br.com.gommo.modules.rh.person.developmentplan.competency.dto.CompetencyResponseDto;
import br.com.gommo.modules.rh.person.developmentplan.competency.entity.Competency;
import br.com.gommo.modules.rh.person.developmentplan.competency.exception.CompetencyException;
import br.com.gommo.modules.rh.person.developmentplan.competency.mapper.CompetencyMapper;
import br.com.gommo.modules.rh.person.developmentplan.competency.repository.CompetencyRepository;

@Service
public class CompetencyService extends BaseService<Competency, CompetencyRequestDto, CompetencyResponseDto>
        implements ICompetencyService {

    private final CompetencyRepository repository;
    private final CompetencyMapper mapper;

    public CompetencyService(CompetencyRepository repository, CompetencyMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplanconfig:read')")
    public List<CompetencyResponseDto> findAll() {
        return repository.findAllByStatusNotOrderByNameAsc(StatusEnum.DELETED).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplanconfig:read')")
    public CompetencyResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplanconfig:read')")
    public PageableResponseDto<CompetencyResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplanconfig:write')")
    public CompetencyResponseDto create(CompetencyRequestDto request) {
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplanconfig:write')")
    public CompetencyResponseDto update(UUID id, CompetencyRequestDto request) {
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplanconfig:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected Competency findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(CompetencyException::notFound);
    }

    @Override
    protected void updateEntity(Competency entity, CompetencyRequestDto request) {
        mapper.updateEntity(entity, request);
    }
}
