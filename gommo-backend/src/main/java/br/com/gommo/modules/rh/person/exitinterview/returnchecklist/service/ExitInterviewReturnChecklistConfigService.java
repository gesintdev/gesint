package br.com.gommo.modules.rh.person.exitinterview.returnchecklist.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.exitinterview.returnchecklist.dto.ExitInterviewReturnChecklistConfigRequestDto;
import br.com.gommo.modules.rh.person.exitinterview.returnchecklist.dto.ExitInterviewReturnChecklistConfigResponseDto;
import br.com.gommo.modules.rh.person.exitinterview.returnchecklist.entity.ExitInterviewReturnChecklistConfig;
import br.com.gommo.modules.rh.person.exitinterview.returnchecklist.exception.ExitInterviewReturnChecklistConfigException;
import br.com.gommo.modules.rh.person.exitinterview.returnchecklist.mapper.ExitInterviewReturnChecklistConfigMapper;
import br.com.gommo.modules.rh.person.exitinterview.returnchecklist.repository.ExitInterviewReturnChecklistConfigRepository;

@Service
public class ExitInterviewReturnChecklistConfigService
        extends BaseService<
                ExitInterviewReturnChecklistConfig,
                ExitInterviewReturnChecklistConfigRequestDto,
                ExitInterviewReturnChecklistConfigResponseDto>
        implements IExitInterviewReturnChecklistConfigService {

    private final ExitInterviewReturnChecklistConfigRepository repository;
    private final ExitInterviewReturnChecklistConfigMapper mapper;

    public ExitInterviewReturnChecklistConfigService(
            ExitInterviewReturnChecklistConfigRepository repository, ExitInterviewReturnChecklistConfigMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('exitinterview:read')")
    public List<ExitInterviewReturnChecklistConfigResponseDto> findAll() {
        return repository.findAllByStatusNotOrderByDisplayOrderAscDescriptionAsc(StatusEnum.DELETED).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('exitinterview:read')")
    public ExitInterviewReturnChecklistConfigResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('exitinterview:read')")
    public PageableResponseDto<ExitInterviewReturnChecklistConfigResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('exitinterview:write')")
    public ExitInterviewReturnChecklistConfigResponseDto create(ExitInterviewReturnChecklistConfigRequestDto request) {
        normalize(request);
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('exitinterview:write')")
    public ExitInterviewReturnChecklistConfigResponseDto update(
            UUID id, ExitInterviewReturnChecklistConfigRequestDto request) {
        normalize(request);
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('exitinterview:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected ExitInterviewReturnChecklistConfig findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(ExitInterviewReturnChecklistConfigException::notFound);
    }

    @Override
    protected void updateEntity(
            ExitInterviewReturnChecklistConfig entity, ExitInterviewReturnChecklistConfigRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private void normalize(ExitInterviewReturnChecklistConfigRequestDto request) {
        if (request.getItemKey() != null) {
            request.setItemKey(request.getItemKey().trim().toLowerCase());
        }
        if (request.getDisplayOrder() == null) {
            request.setDisplayOrder(0);
        }
    }
}
