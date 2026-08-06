package br.com.gommo.modules.rh.person.occupationalexam.physician.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.occupationalexam.physician.dto.OccupationalPhysicianRequestDto;
import br.com.gommo.modules.rh.person.occupationalexam.physician.dto.OccupationalPhysicianResponseDto;
import br.com.gommo.modules.rh.person.occupationalexam.physician.entity.OccupationalPhysician;
import br.com.gommo.modules.rh.person.occupationalexam.physician.exception.OccupationalPhysicianException;
import br.com.gommo.modules.rh.person.occupationalexam.physician.mapper.OccupationalPhysicianMapper;
import br.com.gommo.modules.rh.person.occupationalexam.physician.repository.OccupationalPhysicianRepository;

@Service
public class OccupationalPhysicianService
        extends BaseService<OccupationalPhysician, OccupationalPhysicianRequestDto, OccupationalPhysicianResponseDto>
        implements IOccupationalPhysicianService {

    private final OccupationalPhysicianRepository repository;
    private final OccupationalPhysicianMapper mapper;

    public OccupationalPhysicianService(
            OccupationalPhysicianRepository repository, OccupationalPhysicianMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public List<OccupationalPhysicianResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public List<OccupationalPhysicianResponseDto> findAll(StatusEnum status) {
        return super.findAll(status);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public OccupationalPhysicianResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public PageableResponseDto<OccupationalPhysicianResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public OccupationalPhysicianResponseDto create(OccupationalPhysicianRequestDto request) {
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public OccupationalPhysicianResponseDto update(UUID id, OccupationalPhysicianRequestDto request) {
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public void activate(UUID id) {
        super.activate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public void deactivate(UUID id) {
        super.deactivate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected OccupationalPhysician findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(OccupationalPhysicianException::notFound);
    }

    @Override
    protected void updateEntity(OccupationalPhysician entity, OccupationalPhysicianRequestDto request) {
        mapper.updateEntity(entity, request);
    }
}
