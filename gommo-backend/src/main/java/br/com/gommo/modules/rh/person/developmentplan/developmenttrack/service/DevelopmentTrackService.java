package br.com.gommo.modules.rh.person.developmentplan.developmenttrack.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.developmentplan.developmenttrack.dto.DevelopmentTrackRequestDto;
import br.com.gommo.modules.rh.person.developmentplan.developmenttrack.dto.DevelopmentTrackResponseDto;
import br.com.gommo.modules.rh.person.developmentplan.developmenttrack.entity.DevelopmentTrack;
import br.com.gommo.modules.rh.person.developmentplan.developmenttrack.exception.DevelopmentTrackException;
import br.com.gommo.modules.rh.person.developmentplan.developmenttrack.mapper.DevelopmentTrackMapper;
import br.com.gommo.modules.rh.person.developmentplan.developmenttrack.repository.DevelopmentTrackRepository;

@Service
public class DevelopmentTrackService
        extends BaseService<DevelopmentTrack, DevelopmentTrackRequestDto, DevelopmentTrackResponseDto>
        implements IDevelopmentTrackService {

    private final DevelopmentTrackRepository repository;
    private final DevelopmentTrackMapper mapper;

    public DevelopmentTrackService(DevelopmentTrackRepository repository, DevelopmentTrackMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplanconfig:read')")
    public List<DevelopmentTrackResponseDto> findAll() {
        return repository.findAllByStatusNotOrderByNameAsc(StatusEnum.DELETED).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplanconfig:read')")
    public DevelopmentTrackResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplanconfig:read')")
    public PageableResponseDto<DevelopmentTrackResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplanconfig:write')")
    public DevelopmentTrackResponseDto create(DevelopmentTrackRequestDto request) {
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplanconfig:write')")
    public DevelopmentTrackResponseDto update(UUID id, DevelopmentTrackRequestDto request) {
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplanconfig:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected DevelopmentTrack findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(DevelopmentTrackException::notFound);
    }

    @Override
    protected void updateEntity(DevelopmentTrack entity, DevelopmentTrackRequestDto request) {
        mapper.updateEntity(entity, request);
    }
}
