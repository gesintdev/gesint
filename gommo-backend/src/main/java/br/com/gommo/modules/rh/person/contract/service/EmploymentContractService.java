package br.com.gommo.modules.rh.person.contract.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.contract.dto.EmploymentContractRequestDto;
import br.com.gommo.modules.rh.person.contract.dto.EmploymentContractResponseDto;
import br.com.gommo.modules.rh.person.contract.entity.EmploymentContract;
import br.com.gommo.modules.rh.person.contract.exception.EmploymentContractException;
import br.com.gommo.modules.rh.person.contract.mapper.EmploymentContractMapper;
import br.com.gommo.modules.rh.person.contract.repository.EmploymentContractRepository;
import br.com.gommo.modules.dp.occupationalexam.exam.service.OccupationalExamTriggerService;

@Service
public class EmploymentContractService
        extends BaseService<EmploymentContract, EmploymentContractRequestDto, EmploymentContractResponseDto>
        implements IEmploymentContractService {
    private final EmploymentContractRepository repository;
    private final EmploymentContractMapper mapper;
    private final OccupationalExamTriggerService occupationalExamTriggerService;

    public EmploymentContractService(
            EmploymentContractRepository repository,
            EmploymentContractMapper mapper,
            OccupationalExamTriggerService occupationalExamTriggerService) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.occupationalExamTriggerService = occupationalExamTriggerService;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('contract:read')")
    public List<EmploymentContractResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('contract:read')")
    public EmploymentContractResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('contract:read')")
    public PageableResponseDto<EmploymentContractResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('contract:write')")
    public EmploymentContractResponseDto create(EmploymentContractRequestDto request) {
        return super.create(request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('contract:write')")
    public EmploymentContractResponseDto update(UUID id, EmploymentContractRequestDto request) {
        EmploymentContract entity = findEntity(id);
        UUID previousJobPositionId = entity.getJobPositionId();
        mapper.updateEntity(entity, request);
        EmploymentContract saved = repository.save(entity);
        if (request.getJobPositionId() != null && !request.getJobPositionId().equals(previousJobPositionId)) {
            occupationalExamTriggerService.onJobPositionChange(
                    saved.getCollaboratorId(),
                    previousJobPositionId,
                    saved.getJobPositionId(),
                    saved.getStartDate());
        }
        return mapper.toResponse(saved);
    }

    

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('contract:read')")
    public List<EmploymentContractResponseDto> findAll(StatusEnum status) {
        return super.findAll(status);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('contract:write')")
    public void activate(UUID id) {
        super.activate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('contract:write')")
    public void deactivate(UUID id) {
        super.deactivate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('contract:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected EmploymentContract findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(EmploymentContractException::notFound);
    }

    @Override
    protected void updateEntity(EmploymentContract entity, EmploymentContractRequestDto request) {
        mapper.updateEntity(entity, request);
    }
}
