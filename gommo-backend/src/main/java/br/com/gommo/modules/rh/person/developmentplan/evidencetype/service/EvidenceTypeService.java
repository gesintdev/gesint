package br.com.gommo.modules.rh.person.developmentplan.evidencetype.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.developmentplan.evidencetype.dto.EvidenceTypeRequestDto;
import br.com.gommo.modules.rh.person.developmentplan.evidencetype.dto.EvidenceTypeResponseDto;
import br.com.gommo.modules.rh.person.developmentplan.evidencetype.entity.EvidenceType;
import br.com.gommo.modules.rh.person.developmentplan.evidencetype.exception.EvidenceTypeException;
import br.com.gommo.modules.rh.person.developmentplan.evidencetype.mapper.EvidenceTypeMapper;
import br.com.gommo.modules.rh.person.developmentplan.evidencetype.repository.EvidenceTypeRepository;

@Service
public class EvidenceTypeService extends BaseService<EvidenceType, EvidenceTypeRequestDto, EvidenceTypeResponseDto>
        implements IEvidenceTypeService {

    private final EvidenceTypeRepository repository;
    private final EvidenceTypeMapper mapper;

    public EvidenceTypeService(EvidenceTypeRepository repository, EvidenceTypeMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplanconfig:read')")
    public List<EvidenceTypeResponseDto> findAll() {
        return repository.findAllByStatusNotOrderByNameAsc(StatusEnum.DELETED).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplanconfig:read')")
    public EvidenceTypeResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplanconfig:read')")
    public PageableResponseDto<EvidenceTypeResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplanconfig:write')")
    public EvidenceTypeResponseDto create(EvidenceTypeRequestDto request) {
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplanconfig:write')")
    public EvidenceTypeResponseDto update(UUID id, EvidenceTypeRequestDto request) {
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplanconfig:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected EvidenceType findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(EvidenceTypeException::notFound);
    }

    @Override
    protected void updateEntity(EvidenceType entity, EvidenceTypeRequestDto request) {
        mapper.updateEntity(entity, request);
    }
}
