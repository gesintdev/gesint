package br.com.gommo.modules.person.collaborators.people.service;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.person.collaborators.people.exception.CollaboratorException;
import br.com.gommo.modules.person.collaborators.people.dto.CollaboratorRequestDto;
import br.com.gommo.modules.person.collaborators.people.dto.CollaboratorResponseDto;
import br.com.gommo.modules.person.collaborators.people.entity.Collaborator;
import br.com.gommo.modules.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gommo.modules.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gommo.modules.person.collaborators.people.mapper.CollaboratorMapper;
import br.com.gommo.modules.person.collaborators.people.repository.CollaboratorRepository;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CollaboratorService extends BaseService<Collaborator, CollaboratorRequestDto, CollaboratorResponseDto> implements ICollaboratorService {

    private final CollaboratorRepository CollaboratorRepository;
    private final CollaboratorMapper CollaboratorMapper;
    private final AdmissionProcessRepository admissionProcessRepository;

    public CollaboratorService(
            CollaboratorRepository CollaboratorRepository,
            CollaboratorMapper CollaboratorMapper,
            AdmissionProcessRepository admissionProcessRepository) {
        super(CollaboratorRepository, CollaboratorMapper::toResponse, CollaboratorMapper::toEntity);
        this.CollaboratorRepository = CollaboratorRepository;
        this.CollaboratorMapper = CollaboratorMapper;
        this.admissionProcessRepository = admissionProcessRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('collaborator:read')")
    public List<CollaboratorResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyAuthority('collaborator:read', 'collaborator:picker')")
    public CollaboratorResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('collaborator:read')")
    public PageableResponseDto<CollaboratorResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('collaborator:picker')")
    public List<CollaboratorResponseDto> findAdmitted() {
        List<UUID> ids = admissionProcessRepository.findCollaboratorIdsFromCompletedAdmissions(
                AdmissionStatusEnum.COMPLETED, StatusEnum.DELETED);
        if (ids.isEmpty()) {
            return List.of();
        }
        return CollaboratorRepository.findAllById(ids).stream()
                .filter(c -> c.getStatus() != StatusEnum.DELETED)
                .sorted(Comparator.comparing(Collaborator::getFullName, String.CASE_INSENSITIVE_ORDER))
                .map(CollaboratorMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('collaborator:write')")
    public CollaboratorResponseDto create(CollaboratorRequestDto request) {
        throw CollaboratorException.directCreateNotAllowed();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('collaborator:write')")
    public CollaboratorResponseDto update(UUID id, CollaboratorRequestDto request) {
        CollaboratorRepository
                .findByCpfAndStatusNot(request.getCpf(), StatusEnum.DELETED)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(p -> {
                    throw CollaboratorException.cpfAlreadyExists();
                });
        return super.update(id, request);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('collaborator:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected Collaborator findEntity(UUID id) {
        return CollaboratorRepository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(CollaboratorException::notFound);
    }

    @Override
    protected void updateEntity(Collaborator entity, CollaboratorRequestDto request) {
        CollaboratorMapper.updateEntity(entity, request);
    }
}
