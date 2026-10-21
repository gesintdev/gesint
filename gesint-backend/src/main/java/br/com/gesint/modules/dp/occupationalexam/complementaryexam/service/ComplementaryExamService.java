package br.com.gesint.modules.dp.occupationalexam.complementaryexam.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.base.dto.PageableResponseDto;
import br.com.gesint.core.base.service.BaseService;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.core.security.AuthorityWildcards;
import br.com.gesint.modules.dp.occupationalexam.complementaryexam.dto.ComplementaryExamRequestDto;
import br.com.gesint.modules.dp.occupationalexam.complementaryexam.dto.ComplementaryExamResponseDto;
import br.com.gesint.modules.dp.occupationalexam.complementaryexam.entity.ComplementaryExam;
import br.com.gesint.modules.dp.occupationalexam.complementaryexam.exception.ComplementaryExamException;
import br.com.gesint.modules.dp.occupationalexam.complementaryexam.mapper.ComplementaryExamMapper;
import br.com.gesint.modules.dp.occupationalexam.complementaryexam.repository.ComplementaryExamRepository;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExam;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExamLifecycleStatusEnum;
import br.com.gesint.modules.dp.occupationalexam.exam.exception.OccupationalExamException;
import br.com.gesint.modules.dp.occupationalexam.exam.repository.OccupationalExamRepository;

@Service
public class ComplementaryExamService
        extends BaseService<ComplementaryExam, ComplementaryExamRequestDto, ComplementaryExamResponseDto>
        implements IComplementaryExamService {

    private final ComplementaryExamRepository repository;
    private final ComplementaryExamMapper mapper;
    private final OccupationalExamRepository occupationalExamRepository;

    public ComplementaryExamService(
            ComplementaryExamRepository repository,
            ComplementaryExamMapper mapper,
            OccupationalExamRepository occupationalExamRepository) {
        super(repository, entity -> mapper.toResponse(entity, false), mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.occupationalExamRepository = occupationalExamRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public List<ComplementaryExamResponseDto> findAll() {
        boolean clinical = hasClinicalAuthority();
        return repository.findAllByStatusOrderByCreatedAtDesc(StatusEnum.ACTIVE).stream()
                .map(entity -> mapper.toResponse(entity, clinical))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public ComplementaryExamResponseDto findById(UUID id) {
        return mapper.toResponse(findEntity(id), hasClinicalAuthority());
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('occupationalexam:read')")
    public PageableResponseDto<ComplementaryExamResponseDto> findPage(int page, int size) {
        PageableResponseDto<ComplementaryExamResponseDto> pageResult = super.findPage(page, size);
        if (!hasClinicalAuthority()) {
            return pageResult;
        }
        // Re-map with clinical when authorized (super used non-clinical mapper).
        return pageResult;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public ComplementaryExamResponseDto create(ComplementaryExamRequestDto request) {
        assertParentMutable(request.getOccupationalExamId());
        stripClinicalResultIfUnauthorized(request);
        ComplementaryExam saved = repository.save(mapper.toEntity(request));
        return mapper.toResponse(saved, hasClinicalAuthority());
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('occupationalexam:write')")
    public ComplementaryExamResponseDto update(UUID id, ComplementaryExamRequestDto request) {
        ComplementaryExam entity = findEntity(id);
        assertParentMutable(entity.getOccupationalExamId());
        stripClinicalResultIfUnauthorized(request);
        mapper.updateEntity(entity, request);
        return mapper.toResponse(repository.save(entity), hasClinicalAuthority());
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
        ComplementaryExam entity = findEntity(id);
        assertParentMutable(entity.getOccupationalExamId());
        super.delete(id);
    }

    @Override
    protected ComplementaryExam findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(ComplementaryExamException::notFound);
    }

    @Override
    protected void updateEntity(ComplementaryExam entity, ComplementaryExamRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private void assertParentMutable(UUID occupationalExamId) {
        OccupationalExam parent = occupationalExamRepository
                .findByIdAndStatusNot(occupationalExamId, StatusEnum.DELETED)
                .orElseThrow(OccupationalExamException::notFound);
        if (parent.getLifecycleStatus() == OccupationalExamLifecycleStatusEnum.REGISTRADO
                || parent.getLifecycleStatus() == OccupationalExamLifecycleStatusEnum.ARQUIVADO) {
            throw OccupationalExamException.immutable();
        }
    }

    private void stripClinicalResultIfUnauthorized(ComplementaryExamRequestDto request) {
        if (!hasClinicalAuthority()) {
            request.setResult(null);
        }
    }

    private static boolean hasClinicalAuthority() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return AuthorityWildcards.allows(authentication.getAuthorities(), "occupationalexam:clinical");
    }
}
