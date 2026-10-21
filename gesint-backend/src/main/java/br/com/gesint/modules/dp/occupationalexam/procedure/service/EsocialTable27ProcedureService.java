package br.com.gesint.modules.dp.occupationalexam.procedure.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.base.dto.PageableResponseDto;
import br.com.gesint.core.base.service.BaseService;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.occupationalexam.procedure.dto.EsocialTable27ProcedureRequestDto;
import br.com.gesint.modules.dp.occupationalexam.procedure.dto.EsocialTable27ProcedureResponseDto;
import br.com.gesint.modules.dp.occupationalexam.procedure.entity.EsocialTable27Procedure;
import br.com.gesint.modules.dp.occupationalexam.procedure.exception.EsocialTable27ProcedureException;
import br.com.gesint.modules.dp.occupationalexam.procedure.mapper.EsocialTable27ProcedureMapper;
import br.com.gesint.modules.dp.occupationalexam.procedure.repository.EsocialTable27ProcedureRepository;

@Service
public class EsocialTable27ProcedureService
        extends BaseService<
                EsocialTable27Procedure, EsocialTable27ProcedureRequestDto, EsocialTable27ProcedureResponseDto>
        implements IEsocialTable27ProcedureService {

    private final EsocialTable27ProcedureRepository repository;
    private final EsocialTable27ProcedureMapper mapper;

    public EsocialTable27ProcedureService(
            EsocialTable27ProcedureRepository repository, EsocialTable27ProcedureMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read') or hasAuthority('jobposition:exammatrix')")
    public List<EsocialTable27ProcedureResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read') or hasAuthority('jobposition:exammatrix')")
    public List<EsocialTable27ProcedureResponseDto> findAll(StatusEnum status) {
        return super.findAll(status);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read') or hasAuthority('jobposition:exammatrix')")
    public EsocialTable27ProcedureResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read') or hasAuthority('jobposition:exammatrix')")
    public PageableResponseDto<EsocialTable27ProcedureResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public EsocialTable27ProcedureResponseDto create(EsocialTable27ProcedureRequestDto request) {
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public EsocialTable27ProcedureResponseDto update(UUID id, EsocialTable27ProcedureRequestDto request) {
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
    protected EsocialTable27Procedure findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(EsocialTable27ProcedureException::notFound);
    }

    @Override
    protected void updateEntity(EsocialTable27Procedure entity, EsocialTable27ProcedureRequestDto request) {
        mapper.updateEntity(entity, request);
    }
}
