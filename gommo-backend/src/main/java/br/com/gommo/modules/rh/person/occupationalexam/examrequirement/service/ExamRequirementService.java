package br.com.gommo.modules.rh.person.occupationalexam.examrequirement.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.occupationalexam.examrequirement.dto.ExamRequirementRequestDto;
import br.com.gommo.modules.rh.person.occupationalexam.examrequirement.dto.ExamRequirementResponseDto;
import br.com.gommo.modules.rh.person.occupationalexam.examrequirement.entity.ExamRequirement;
import br.com.gommo.modules.rh.person.occupationalexam.examrequirement.exception.ExamRequirementException;
import br.com.gommo.modules.rh.person.occupationalexam.examrequirement.mapper.ExamRequirementMapper;
import br.com.gommo.modules.rh.person.occupationalexam.examrequirement.repository.ExamRequirementRepository;

@Service
public class ExamRequirementService
        extends BaseService<ExamRequirement, ExamRequirementRequestDto, ExamRequirementResponseDto>
        implements IExamRequirementService {

    private final ExamRequirementRepository repository;
    private final ExamRequirementMapper mapper;

    public ExamRequirementService(ExamRequirementRepository repository, ExamRequirementMapper mapper) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public List<ExamRequirementResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public List<ExamRequirementResponseDto> findAll(StatusEnum status) {
        return super.findAll(status);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public ExamRequirementResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public PageableResponseDto<ExamRequirementResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public ExamRequirementResponseDto create(ExamRequirementRequestDto request) {
        ExamRequirement entity = mapper.toEntity(request);
        entity.setStatus(StatusEnum.ACTIVE);
        Integer maxVersion =
                repository.findMaxVersionNumber(request.getJobPositionId(), request.getExamType(), StatusEnum.DELETED);
        entity.setVersionNumber(maxVersion == null ? 1 : maxVersion + 1);
        closePreviousVersions(entity);
        return mapper.toResponse(repository.save(entity));
    }

    /**
     * Matriz versionada: editar nunca sobrescreve. Fecha validUntil da versao
     * anterior e cria nova linha.
     */
    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public ExamRequirementResponseDto update(UUID id, ExamRequirementRequestDto request) {
        ExamRequirement current = findEntity(id);
        LocalDate closeDate = request.getValidFrom() != null
                ? request.getValidFrom().minusDays(1)
                : LocalDate.now().minusDays(1);
        if (current.getValidUntil() == null || current.getValidUntil().isAfter(closeDate)) {
            current.setValidUntil(closeDate);
            repository.save(current);
        }

        ExamRequirement next = mapper.toEntity(request);
        next.setStatus(StatusEnum.ACTIVE);
        Integer maxVersion =
                repository.findMaxVersionNumber(request.getJobPositionId(), request.getExamType(), StatusEnum.DELETED);
        next.setVersionNumber(maxVersion == null ? 1 : maxVersion + 1);
        return mapper.toResponse(repository.save(next));
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
    protected ExamRequirement findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(ExamRequirementException::notFound);
    }

    @Override
    protected void updateEntity(ExamRequirement entity, ExamRequirementRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private void closePreviousVersions(ExamRequirement entity) {
        List<ExamRequirement> open = repository.findByJobPositionIdAndExamTypeAndValidUntilIsNullAndStatusNot(
                entity.getJobPositionId(), entity.getExamType(), StatusEnum.DELETED);
        LocalDate closeDate = entity.getValidFrom().minusDays(1);
        for (ExamRequirement previous : open) {
            previous.setValidUntil(closeDate);
            repository.save(previous);
        }
    }
}
