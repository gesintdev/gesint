package br.com.gommo.modules.dp.offboarding.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.collaborators.people.entity.Collaborator;
import br.com.gommo.modules.rh.person.collaborators.people.exception.CollaboratorException;
import br.com.gommo.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gommo.modules.dp.offboarding.dto.OffboardingRequestDto;
import br.com.gommo.modules.dp.offboarding.dto.OffboardingResponseDto;
import br.com.gommo.modules.dp.offboarding.entity.Offboarding;
import br.com.gommo.modules.dp.offboarding.exception.OffboardingException;
import br.com.gommo.modules.dp.offboarding.mapper.OffboardingMapper;
import br.com.gommo.modules.dp.offboarding.repository.OffboardingRepository;

@Service
public class OffboardingService extends BaseService<Offboarding, OffboardingRequestDto, OffboardingResponseDto>
        implements IOffboardingService {
    private final OffboardingRepository repository;
    private final OffboardingMapper mapper;
    private final CollaboratorRepository collaboratorRepository;

    public OffboardingService(
            OffboardingRepository repository, OffboardingMapper mapper, CollaboratorRepository collaboratorRepository) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.collaboratorRepository = collaboratorRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('offboarding:read')")
    public List<OffboardingResponseDto> findAll() {
        List<Offboarding> entities = repository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED);
        return mapToResponses(entities);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('offboarding:read')")
    public OffboardingResponseDto findById(UUID id) {
        return toEnrichedResponse(findEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('offboarding:read')")
    public PageableResponseDto<OffboardingResponseDto> findPage(int page, int size) {
        PageableResponseDto<OffboardingResponseDto> pageResult = super.findPage(page, size);
        return PageableResponseDto.<OffboardingResponseDto>builder()
                .content(mapToResponses(repository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED).stream()
                        .skip((long) page * size)
                        .limit(size)
                        .toList()))
                .page(pageResult.getPage())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('offboarding:write')")
    public OffboardingResponseDto create(OffboardingRequestDto request) {
        Offboarding entity = mapper.toEntity(request);
        entity.setStatus(StatusEnum.ACTIVE);
        Offboarding saved = repository.save(entity);
        markCollaboratorOffboarded(saved.getCollaboratorId());
        return toEnrichedResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('offboarding:write')")
    public OffboardingResponseDto update(UUID id, OffboardingRequestDto request) {
        Offboarding entity = findEntity(id);
        UUID previousCollaboratorId = entity.getCollaboratorId();
        mapper.updateEntity(entity, request);
        Offboarding saved = repository.save(entity);
        markCollaboratorOffboarded(saved.getCollaboratorId());
        restoreCollaboratorIfNoOffboarding(previousCollaboratorId, saved.getCollaboratorId());
        return toEnrichedResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('offboarding:delete')")
    public void delete(UUID id) {
        Offboarding entity = findEntity(id);
        UUID collaboratorId = entity.getCollaboratorId();
        super.delete(id);
        restoreCollaboratorIfNoOffboarding(collaboratorId, null);
    }

    @Override
    protected Offboarding findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(OffboardingException::notFound);
    }

    @Override
    protected void updateEntity(Offboarding entity, OffboardingRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private List<OffboardingResponseDto> mapToResponses(List<Offboarding> entities) {
        Map<UUID, Collaborator> collaborators = loadCollaborators(entities);
        return entities.stream().map(entity -> mapper.toResponse(entity, collaboratorName(entity, collaborators))).toList();
    }

    private OffboardingResponseDto toEnrichedResponse(Offboarding entity) {
        return mapper.toResponse(entity, collaboratorName(entity, loadCollaborators(List.of(entity))));
    }

    private Map<UUID, Collaborator> loadCollaborators(List<Offboarding> entities) {
        List<UUID> collaboratorIds = entities.stream()
                .map(Offboarding::getCollaboratorId)
                .filter(id -> id != null)
                .distinct()
                .toList();
        if (collaboratorIds.isEmpty()) {
            return Map.of();
        }
        return collaboratorRepository.findAllById(collaboratorIds).stream()
                .collect(Collectors.toMap(Collaborator::getId, Function.identity()));
    }

    private static String collaboratorName(Offboarding entity, Map<UUID, Collaborator> collaborators) {
        Collaborator collaborator = collaborators.get(entity.getCollaboratorId());
        return collaborator != null && collaborator.getStatus() != StatusEnum.DELETED ? collaborator.getFullName() : null;
    }

    private void markCollaboratorOffboarded(UUID collaboratorId) {
        Collaborator collaborator = collaboratorRepository
                .findByIdAndStatusNot(collaboratorId, StatusEnum.DELETED)
                .orElseThrow(CollaboratorException::notFound);
        collaborator.setStatus(StatusEnum.INACTIVE);
        collaboratorRepository.save(collaborator);
    }

    private void restoreCollaboratorIfNoOffboarding(UUID collaboratorId, UUID exceptSameCollaboratorId) {
        if (collaboratorId == null || collaboratorId.equals(exceptSameCollaboratorId)) {
            return;
        }
        boolean stillOffboarded = repository.existsByCollaboratorIdAndStatusNot(collaboratorId, StatusEnum.DELETED);
        if (stillOffboarded) {
            return;
        }
        Collaborator collaborator = collaboratorRepository
                .findByIdAndStatusNot(collaboratorId, StatusEnum.DELETED)
                .orElse(null);
        if (collaborator != null) {
            collaborator.setStatus(StatusEnum.ACTIVE);
            collaboratorRepository.save(collaborator);
        }
    }
}
