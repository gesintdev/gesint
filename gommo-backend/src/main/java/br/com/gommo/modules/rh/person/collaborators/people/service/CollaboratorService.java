package br.com.gommo.modules.rh.person.collaborators.people.service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.offboarding.repository.OffboardingRepository;
import br.com.gommo.modules.dp.organization.jobposition.entity.JobPositionNatureEnum;
import br.com.gommo.modules.dp.organization.jobposition.repository.JobPositionRepository;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gommo.modules.rh.person.collaborators.people.dto.CollaboratorRequestDto;
import br.com.gommo.modules.rh.person.collaborators.people.dto.CollaboratorResponseDto;
import br.com.gommo.modules.rh.person.collaborators.people.entity.Collaborator;
import br.com.gommo.modules.rh.person.collaborators.people.entity.CollaboratorContact;
import br.com.gommo.modules.rh.person.collaborators.people.exception.CollaboratorException;
import br.com.gommo.modules.rh.person.collaborators.people.mapper.CollaboratorMapper;
import br.com.gommo.modules.rh.person.collaborators.people.repository.CollaboratorContactRepository;
import br.com.gommo.modules.rh.person.collaborators.people.repository.CollaboratorRepository;

@Service
public class CollaboratorService extends BaseService<Collaborator, CollaboratorRequestDto, CollaboratorResponseDto>
        implements ICollaboratorService {

    private final CollaboratorRepository CollaboratorRepository;
    private final CollaboratorMapper CollaboratorMapper;
    private final CollaboratorContactRepository contactRepository;
    private final AdmissionProcessRepository admissionProcessRepository;
    private final OffboardingRepository offboardingRepository;
    private final JobPositionRepository jobPositionRepository;

    public CollaboratorService(
            CollaboratorRepository CollaboratorRepository,
            CollaboratorMapper CollaboratorMapper,
            CollaboratorContactRepository contactRepository,
            AdmissionProcessRepository admissionProcessRepository,
            OffboardingRepository offboardingRepository,
            JobPositionRepository jobPositionRepository) {
        super(CollaboratorRepository, CollaboratorMapper::toResponse, CollaboratorMapper::toEntity);
        this.CollaboratorRepository = CollaboratorRepository;
        this.CollaboratorMapper = CollaboratorMapper;
        this.contactRepository = contactRepository;
        this.admissionProcessRepository = admissionProcessRepository;
        this.offboardingRepository = offboardingRepository;
        this.jobPositionRepository = jobPositionRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('collaborator:read')")
    public List<CollaboratorResponseDto> findAll() {
        List<UUID> offboardedIds = offboardingRepository.findOffboardedCollaboratorIds(StatusEnum.DELETED);
        return CollaboratorRepository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED).stream()
                .filter(c -> !offboardedIds.contains(c.getId()))
                .map(this::toResponseWithContact)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyAuthority('collaborator:read', 'collaborator:picker')")
    public CollaboratorResponseDto findById(UUID id) {
        return toResponseWithContact(findEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('collaborator:read')")
    public PageableResponseDto<CollaboratorResponseDto> findPage(int page, int size) {
        return findPage(page, size, Map.of());
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('collaborator:read')")
    public PageableResponseDto<CollaboratorResponseDto> findPage(
            int page, int size, Map<String, List<String>> filters) {
        List<UUID> offboardedIds = offboardingRepository.findOffboardedCollaboratorIds(StatusEnum.DELETED);
        List<Collaborator> allRows =
                CollaboratorRepository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED).stream()
                        .filter(c -> !offboardedIds.contains(c.getId()))
                        .toList();
        List<Collaborator> filteredRows = allRows.stream()
                .filter(c -> matchesFilter(filters, "fullName", c.getFullName()))
                .filter(c -> matchesFilter(filters, "cpf", c.getCpf()))
                .filter(c -> matchesFilter(filters, "status", c.getStatus().name()))
                .toList();
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, size);
        int fromIndex = Math.min(safePage * safeSize, filteredRows.size());
        int toIndex = Math.min(fromIndex + safeSize, filteredRows.size());
        List<CollaboratorResponseDto> content = filteredRows.subList(fromIndex, toIndex).stream()
                .map(this::toResponseWithContact)
                .toList();
        return PageableResponseDto.<CollaboratorResponseDto>builder()
                .content(content)
                .page(safePage)
                .size(safeSize)
                .totalElements(filteredRows.size())
                .totalPages((int) Math.ceil((double) filteredRows.size() / safeSize))
                .filterOptions(buildFilterOptions(allRows))
                .build();
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
        List<UUID> offboardedIds = offboardingRepository.findOffboardedCollaboratorIds(StatusEnum.DELETED);
        return CollaboratorRepository.findAllById(ids).stream()
                .filter(c -> c.getStatus() != StatusEnum.DELETED)
                .filter(c -> !offboardedIds.contains(c.getId()))
                .sorted(Comparator.comparing(Collaborator::getFullName, String.CASE_INSENSITIVE_ORDER))
                .map(this::toResponseWithContact)
                .toList();
    }


    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('collaborator:picker')")
    public List<CollaboratorResponseDto> findAdmittedManagers() {
        Set<UUID> managerJobPositionIds = jobPositionRepository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED)
                .stream()
                .filter(j -> j.getNature() == JobPositionNatureEnum.LEADERSHIP
                        || j.getNature() == JobPositionNatureEnum.EXECUTIVE)
                .map(j -> j.getId())
                .collect(java.util.stream.Collectors.toSet());
        if (managerJobPositionIds.isEmpty()) {
            return List.of();
        }
        Set<UUID> managerCollaboratorIds = admissionProcessRepository
                .findByAdmissionStatusAndCollaboratorIdIsNotNullAndStatusNot(
                        AdmissionStatusEnum.COMPLETED, StatusEnum.DELETED)
                .stream()
                .filter(a -> a.getJobPositionId() != null && managerJobPositionIds.contains(a.getJobPositionId()))
                .map(a -> a.getCollaboratorId())
                .collect(java.util.stream.Collectors.toSet());
        if (managerCollaboratorIds.isEmpty()) {
            return List.of();
        }
        List<UUID> offboardedIds = offboardingRepository.findOffboardedCollaboratorIds(StatusEnum.DELETED);
        return CollaboratorRepository.findAllById(managerCollaboratorIds).stream()
                .filter(c -> c.getStatus() != StatusEnum.DELETED)
                .filter(c -> !offboardedIds.contains(c.getId()))
                .sorted(Comparator.comparing(Collaborator::getFullName, String.CASE_INSENSITIVE_ORDER))
                .map(this::toResponseWithContact)
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
        CollaboratorRepository.findByCpfAndStatusNot(request.getCpf(), StatusEnum.DELETED)
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
        return CollaboratorRepository.findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(CollaboratorException::notFound);
    }

    @Override
    protected void updateEntity(Collaborator entity, CollaboratorRequestDto request) {
        CollaboratorMapper.updateEntity(entity, request);
    }

    private CollaboratorResponseDto toResponseWithContact(Collaborator entity) {
        CollaboratorContact contact = contactRepository
                .findFirstByCollaboratorIdAndPrimaryContactTrueAndStatusNot(entity.getId(), StatusEnum.DELETED)
                .orElse(null);
        String email = contact != null ? contact.getEmail() : null;
        String phone = contact != null ? contact.getPhone() : null;
        return CollaboratorMapper.toResponse(entity, email, phone);
    }

    private static boolean matchesFilter(Map<String, List<String>> filters, String field, String value) {
        List<String> acceptedValues = filters.get(field);
        if (acceptedValues == null || acceptedValues.isEmpty()) {
            return true;
        }
        String normalizedValue = value != null ? value.toLowerCase() : "";
        return acceptedValues.stream().map(String::toLowerCase).anyMatch(normalizedValue::equals);
    }

    private static Map<String, List<String>> buildFilterOptions(List<Collaborator> rows) {
        return Map.of(
                "fullName",
                distinctSorted(rows.stream().map(Collaborator::getFullName).toList()),
                "cpf",
                distinctSorted(rows.stream().map(Collaborator::getCpf).toList()),
                "status",
                distinctSorted(rows.stream().map(c -> c.getStatus().name()).toList()));
    }

    private static List<String> distinctSorted(List<String> values) {
        return values.stream()
                .filter(v -> v != null && !v.isBlank())
                .distinct()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();
    }
}
