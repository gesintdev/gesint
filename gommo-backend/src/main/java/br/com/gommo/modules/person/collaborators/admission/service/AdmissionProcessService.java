package br.com.gommo.modules.person.collaborators.admission.service;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.person.collaborators.admission.dto.AdmissionProcessRequestDto;
import br.com.gommo.modules.person.collaborators.admission.dto.AdmissionProcessResponseDto;
import br.com.gommo.modules.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gommo.modules.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gommo.modules.person.collaborators.admission.exception.AdmissionProcessException;
import br.com.gommo.modules.person.collaborators.admission.mapper.AdmissionProcessMapper;
import br.com.gommo.modules.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gommo.modules.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gommo.modules.person.collaborators.people.service.CollaboratorProfileService;
import br.com.gommo.modules.storage.repository.StorageObjectLinkRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdmissionProcessService
        extends BaseService<AdmissionProcess, AdmissionProcessRequestDto, AdmissionProcessResponseDto>
        implements IAdmissionProcessService {

    private final AdmissionProcessRepository repository;
    private final AdmissionProcessMapper mapper;
    private final CollaboratorRepository collaboratorRepository;
    private final CollaboratorProfileService collaboratorProfileService;
    private final StorageObjectLinkRepository storageObjectLinkRepository;

    public AdmissionProcessService(
            AdmissionProcessRepository repository,
            AdmissionProcessMapper mapper,
            CollaboratorRepository collaboratorRepository,
            CollaboratorProfileService collaboratorProfileService,
            StorageObjectLinkRepository storageObjectLinkRepository) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.collaboratorRepository = collaboratorRepository;
        this.collaboratorProfileService = collaboratorProfileService;
        this.storageObjectLinkRepository = storageObjectLinkRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('admission:read')")
    public List<AdmissionProcessResponseDto> findAll() {
        List<AdmissionProcess> entities = repository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED);
        return mapToResponses(entities);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('admission:read')")
    public AdmissionProcessResponseDto findById(UUID id) {
        return toEnrichedResponse(findEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('admission:read')")
    public PageableResponseDto<AdmissionProcessResponseDto> findPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AdmissionProcess> result = repository.findAllByStatusNot(StatusEnum.DELETED, pageable);
        return PageableResponseDto.<AdmissionProcessResponseDto>builder()
                .content(mapToResponses(result.getContent()))
                .page(page)
                .size(size)
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('admission:write')")
    public AdmissionProcessResponseDto create(AdmissionProcessRequestDto request) {
        normalizeRequest(request);
        assertCpfAvailable(request.getCpf(), null);
        AdmissionProcess entity = mapper.toEntity(request);
        entity.setStatus(StatusEnum.ACTIVE);
        applyDefaults(entity);
        applyComputedStatus(entity, null);
        UUID collaboratorId = collaboratorProfileService.syncFromAdmission(request, null);
        entity.setCollaboratorId(collaboratorId);
        applyCompletionDates(entity);
        AdmissionProcess saved = repository.save(entity);
        return toEnrichedResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('admission:write')")
    public AdmissionProcessResponseDto update(UUID id, AdmissionProcessRequestDto request) {
        normalizeRequest(request);
        assertCpfAvailable(request.getCpf(), id);
        AdmissionProcess entity = findEntity(id);
        mapper.updateEntity(entity, request);
        applyDefaults(entity);
        applyComputedStatus(entity, id);
        UUID collaboratorId = collaboratorProfileService.syncFromAdmission(request, entity.getCollaboratorId());
        entity.setCollaboratorId(collaboratorId);
        applyCompletionDates(entity);
        AdmissionProcess saved = repository.save(entity);
        return toEnrichedResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('admission:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected AdmissionProcess findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(AdmissionProcessException::notFound);
    }

    @Override
    protected void updateEntity(AdmissionProcess entity, AdmissionProcessRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private void normalizeRequest(AdmissionProcessRequestDto request) {
        if (request.getCpf() != null) {
            request.setCpf(request.getCpf().replaceAll("\\D", ""));
        }
        if (request.getPhone() != null) {
            request.setPhone(request.getPhone().replaceAll("\\D", ""));
        }
        if (request.getZipCode() != null) {
            request.setZipCode(request.getZipCode().replaceAll("\\D", ""));
        }
        if (request.getStateCode() != null) {
            request.setStateCode(request.getStateCode().trim().toUpperCase());
        }
    }

    private void assertCpfAvailable(String cpf, UUID excludeAdmissionId) {
        UUID linkedCollaboratorId = excludeAdmissionId == null
                ? null
                : repository
                        .findByIdAndStatusNot(excludeAdmissionId, StatusEnum.DELETED)
                        .map(AdmissionProcess::getCollaboratorId)
                        .orElse(null);

        collaboratorRepository.findByCpfAndStatusNot(cpf, StatusEnum.DELETED).ifPresent(c -> {
            if (linkedCollaboratorId != null && linkedCollaboratorId.equals(c.getId())) {
                return;
            }
            throw AdmissionProcessException.cpfAlreadyExists();
        });

        var admissionWithCpf = excludeAdmissionId == null
                ? repository.findByCpfAndStatusNot(cpf, StatusEnum.DELETED)
                : repository.findByCpfAndStatusNotAndIdNot(cpf, StatusEnum.DELETED, excludeAdmissionId);
        admissionWithCpf.ifPresent(a -> {
            throw AdmissionProcessException.cpfAlreadyExists();
        });
    }

    private void applyDefaults(AdmissionProcess entity) {
        if (entity.getStartedAt() == null) {
            entity.setStartedAt(LocalDate.now());
        }
        if (entity.getNationality() == null || entity.getNationality().isBlank()) {
            entity.setNationality("Brasileiro");
        }
    }

    private void applyCompletionDates(AdmissionProcess entity) {
        if (entity.getAdmissionStatus() == AdmissionStatusEnum.COMPLETED && entity.getCompletedAt() == null) {
            entity.setCompletedAt(LocalDate.now());
        }
        if (entity.getAdmissionStatus() != AdmissionStatusEnum.COMPLETED) {
            entity.setCompletedAt(null);
        }
    }

    private void applyComputedStatus(AdmissionProcess entity, UUID admissionId) {
        long documentCount = 0;
        long contractDocumentCount = 0;
        if (admissionId != null) {
            var links = storageObjectLinkRepository.findAllByEntityTypeAndEntityIdAndStatusNot(
                    "admission_process", admissionId, StatusEnum.DELETED);
            documentCount = links.stream().filter(l -> "DOCUMENT".equalsIgnoreCase(l.getLinkRole())).count();
            contractDocumentCount = links.stream().filter(l -> "CONTRACT".equalsIgnoreCase(l.getLinkRole())).count();
        }
        entity.setAdmissionStatus(AdmissionProgressEvaluator.resolveStatus(entity, documentCount, contractDocumentCount));
    }

    private List<AdmissionProcessResponseDto> mapToResponses(List<AdmissionProcess> entities) {
        if (entities.isEmpty()) {
            return List.of();
        }
        List<UUID> ids = entities.stream().map(AdmissionProcess::getId).toList();
        var links = storageObjectLinkRepository.findAllByEntityTypeAndEntityIdInAndStatusNot(
                "admission_process", ids, StatusEnum.DELETED);
        return entities.stream()
                .map(entity -> {
                    AdmissionAttachmentCounts counts = AdmissionAttachmentCounts.fromLinks(links, entity.getId());
                    AdmissionStatusEnum status = AdmissionProgressEvaluator.resolveStatus(
                            entity, counts.documentCount(), counts.contractDocumentCount());
                    return mapper.toResponse(entity, status);
                })
                .toList();
    }

    private AdmissionProcessResponseDto toEnrichedResponse(AdmissionProcess entity) {
        AdmissionAttachmentCounts counts = loadAttachmentCounts(entity.getId());
        AdmissionStatusEnum status = AdmissionProgressEvaluator.resolveStatus(
                entity, counts.documentCount(), counts.contractDocumentCount());
        return mapper.toResponse(entity, status);
    }

    private AdmissionAttachmentCounts loadAttachmentCounts(UUID admissionId) {
        if (admissionId == null) {
            return AdmissionAttachmentCounts.ZERO;
        }
        var links = storageObjectLinkRepository.findAllByEntityTypeAndEntityIdAndStatusNot(
                "admission_process", admissionId, StatusEnum.DELETED);
        return AdmissionAttachmentCounts.fromLinks(links, admissionId);
    }
}
