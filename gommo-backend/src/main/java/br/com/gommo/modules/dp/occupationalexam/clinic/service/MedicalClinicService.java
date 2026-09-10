package br.com.gommo.modules.dp.occupationalexam.clinic.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.occupationalexam.clinic.dto.MedicalClinicRequestDto;
import br.com.gommo.modules.dp.occupationalexam.clinic.dto.MedicalClinicResponseDto;
import br.com.gommo.modules.dp.occupationalexam.clinic.entity.MedicalClinic;
import br.com.gommo.modules.dp.occupationalexam.clinic.exception.MedicalClinicException;
import br.com.gommo.modules.dp.occupationalexam.clinic.mapper.MedicalClinicMapper;
import br.com.gommo.modules.dp.occupationalexam.clinic.repository.MedicalClinicRepository;

@Service
public class MedicalClinicService extends BaseService<MedicalClinic, MedicalClinicRequestDto, MedicalClinicResponseDto>
        implements IMedicalClinicService {

    private final MedicalClinicRepository repository;
    private final MedicalClinicMapper mapper;

    public MedicalClinicService(MedicalClinicRepository repository, MedicalClinicMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public List<MedicalClinicResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public List<MedicalClinicResponseDto> findAll(StatusEnum status) {
        return super.findAll(status);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public MedicalClinicResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public PageableResponseDto<MedicalClinicResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public MedicalClinicResponseDto create(MedicalClinicRequestDto request) {
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public MedicalClinicResponseDto update(UUID id, MedicalClinicRequestDto request) {
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
    protected MedicalClinic findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(MedicalClinicException::notFound);
    }

    @Override
    protected void updateEntity(MedicalClinic entity, MedicalClinicRequestDto request) {
        mapper.updateEntity(entity, request);
    }
}
