package br.com.gommo.modules.rh.person.candidate.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.candidate.dto.CandidateRequestDto;
import br.com.gommo.modules.rh.person.candidate.dto.CandidateResponseDto;
import br.com.gommo.modules.rh.person.candidate.entity.Candidate;
import br.com.gommo.modules.rh.person.candidate.exception.CandidateException;
import br.com.gommo.modules.rh.person.candidate.mapper.CandidateMapper;
import br.com.gommo.modules.rh.person.candidate.repository.CandidateRepository;

@Service
public class CandidateService extends BaseService<Candidate, CandidateRequestDto, CandidateResponseDto>
        implements ICandidateService {
    private final CandidateRepository repository;
    private final CandidateMapper mapper;
    private final CandidateExperienceService experienceService;

    public CandidateService(
            CandidateRepository repository,
            CandidateMapper mapper,
            CandidateExperienceService experienceService) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.experienceService = experienceService;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('candidate:read')")
    public List<CandidateResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('candidate:read')")
    public CandidateResponseDto findById(UUID id) {
        Candidate entity = findEntity(id);
        return mapper.toResponse(entity, experienceService.listByCandidateId(id));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('candidate:read')")
    public PageableResponseDto<CandidateResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('candidate:write')")
    public CandidateResponseDto create(CandidateRequestDto request) {
        validateRequest(request, null);
        CandidateResponseDto created = super.create(request);
        experienceService.replaceAll(created.getId(), request.getExperiences());
        return findById(created.getId());
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('candidate:write')")
    public CandidateResponseDto update(UUID id, CandidateRequestDto request) {
        validateRequest(request, id);
        super.update(id, request);
        experienceService.replaceAll(id, request.getExperiences());
        return findById(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('candidate:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected Candidate findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(CandidateException::notFound);
    }

    @Override
    protected void updateEntity(Candidate entity, CandidateRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private void validateRequest(CandidateRequestDto request, UUID currentId) {
        String name = request.getFullName() == null ? "" : request.getFullName().trim();
        if (name.isEmpty()) {
            throw CandidateException.nameRequired();
        }
        request.setFullName(name);

        String cpf = request.getCpf() == null ? "" : request.getCpf().trim();
        if (cpf.isEmpty()) {
            throw CandidateException.cpfRequired();
        }
        request.setCpf(cpf);

        repository
                .findByCpfAndStatusNot(cpf, StatusEnum.DELETED)
                .filter(existing -> currentId == null || !existing.getId().equals(currentId))
                .ifPresent(existing -> {
                    throw CandidateException.cpfDuplicate();
                });
    }
}
