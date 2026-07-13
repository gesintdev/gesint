package br.com.gommo.modules.rh.person.collaborators.admission.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.offboarding.repository.OffboardingRepository;
import br.com.gommo.modules.dp.organization.department.entity.Department;
import br.com.gommo.modules.dp.organization.department.repository.DepartmentRepository;
import br.com.gommo.modules.rh.person.collaborators.address.service.AddressReferenceResolver;
import br.com.gommo.modules.rh.person.collaborators.admission.dto.AdmissionProcessRequestDto;
import br.com.gommo.modules.rh.person.collaborators.admission.dto.AdmissionProcessResponseDto;
import br.com.gommo.modules.rh.person.collaborators.admission.dto.AdmissionProgress;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.exception.AdmissionProcessException;
import br.com.gommo.modules.rh.person.collaborators.admission.mapper.AdmissionProcessMapper;
import br.com.gommo.modules.rh.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gommo.modules.rh.person.collaborators.people.entity.Collaborator;
import br.com.gommo.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gommo.modules.rh.person.collaborators.people.service.CollaboratorProfileService;
import br.com.gommo.modules.rh.person.contract.entity.ContractTypeEnum;
import br.com.gommo.modules.rh.person.contract.recess.service.ContractRecessProvisioningService;
import br.com.gommo.modules.rh.person.leave.domain.LeaveAbsenceRules;
import br.com.gommo.modules.rh.person.leave.entity.LeaveAbsenceStatusEnum;
import br.com.gommo.modules.rh.person.leave.entity.LeaveRequest;
import br.com.gommo.modules.rh.person.leave.entity.LeaveTypeEnum;
import br.com.gommo.modules.rh.person.leave.repository.LeaveRequestRepository;
import br.com.gommo.modules.storage.repository.StorageObjectLinkRepository;

@Service
public class AdmissionProcessService
        extends BaseService<AdmissionProcess, AdmissionProcessRequestDto, AdmissionProcessResponseDto>
        implements IAdmissionProcessService {
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("America/Sao_Paulo");

    private final AdmissionProcessRepository repository;
    private final AdmissionProcessMapper mapper;
    private final CollaboratorRepository collaboratorRepository;
    private final CollaboratorProfileService collaboratorProfileService;
    private final StorageObjectLinkRepository storageObjectLinkRepository;
    private final ContractRecessProvisioningService contractRecessProvisioningService;
    private final AddressReferenceResolver addressReferenceResolver;
    private final DepartmentRepository departmentRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final OffboardingRepository offboardingRepository;

    public AdmissionProcessService(
            AdmissionProcessRepository repository,
            AdmissionProcessMapper mapper,
            CollaboratorRepository collaboratorRepository,
            CollaboratorProfileService collaboratorProfileService,
            StorageObjectLinkRepository storageObjectLinkRepository,
            ContractRecessProvisioningService contractRecessProvisioningService,
            AddressReferenceResolver addressReferenceResolver,
            DepartmentRepository departmentRepository,
            LeaveRequestRepository leaveRequestRepository,
            OffboardingRepository offboardingRepository) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.collaboratorRepository = collaboratorRepository;
        this.collaboratorProfileService = collaboratorProfileService;
        this.storageObjectLinkRepository = storageObjectLinkRepository;
        this.contractRecessProvisioningService = contractRecessProvisioningService;
        this.addressReferenceResolver = addressReferenceResolver;
        this.departmentRepository = departmentRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.offboardingRepository = offboardingRepository;
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
        return findPage(page, size, Map.of());
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('admission:read')")
    public PageableResponseDto<AdmissionProcessResponseDto> findPage(
            int page, int size, Map<String, List<String>> filters) {
        List<AdmissionProcess> entities = repository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED);
        List<AdmissionProcessResponseDto> allRows = mapToResponses(entities);
        Map<String, List<String>> filterOptions = admissionFilterOptions(allRows);
        List<AdmissionProcessResponseDto> filteredRows = allRows.stream()
                .filter(row -> matchesAdmissionFilters(row, filters))
                .toList();
        int safeSize = Math.max(1, size);
        int safePage = Math.max(0, page);
        int fromIndex = Math.min(safePage * safeSize, filteredRows.size());
        int toIndex = Math.min(fromIndex + safeSize, filteredRows.size());
        List<AdmissionProcessResponseDto> content = filteredRows.subList(fromIndex, toIndex);
        int totalPages = filteredRows.isEmpty() ? 0 : (int) Math.ceil((double) filteredRows.size() / safeSize);
        return PageableResponseDto.<AdmissionProcessResponseDto>builder()
                .content(content)
                .page(safePage)
                .size(safeSize)
                .totalElements(filteredRows.size())
                .totalPages(totalPages)
                .filterOptions(filterOptions)
                .build();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('admission:write')")
    public AdmissionProcessResponseDto create(AdmissionProcessRequestDto request) {
        normalizeRequest(request);
        assertCpfAvailable(request.getCpf(), null);
        AdmissionProcess entity = mapper.toEntity(request);
        applyAddressReferences(entity, request);
        entity.setStatus(StatusEnum.ACTIVE);
        applyDefaults(entity);
        applyComputedStatus(entity, null);
        UUID collaboratorId = collaboratorProfileService.syncFromAdmission(request, null);
        entity.setCollaboratorId(collaboratorId);
        applyCompletionDates(entity);
        AdmissionProcess saved = repository.save(entity);
        contractRecessProvisioningService.sync(saved);
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
        applyAddressReferences(entity, request);
        applyDefaults(entity);
        applyComputedStatus(entity, id);
        UUID collaboratorId = collaboratorProfileService.syncFromAdmission(request, entity.getCollaboratorId());
        entity.setCollaboratorId(collaboratorId);
        applyCompletionDates(entity);
        AdmissionProcess saved = repository.save(entity);
        contractRecessProvisioningService.sync(saved);
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
        if (request.getRgIssuer() != null) {
            request.setRgIssuer(request.getRgIssuer().trim());
        }
        if (request.getRgStateCode() != null) {
            request.setRgStateCode(request.getRgStateCode().trim().toUpperCase());
        }
        if (request.getProviderCnpj() != null) {
            request.setProviderCnpj(request.getProviderCnpj().replaceAll("\\D", ""));
        }
        applyContractTypeRules(request);
    }

    private void applyAddressReferences(AdmissionProcess entity, AdmissionProcessRequestDto request) {
        var reference = addressReferenceResolver.resolve(request.getStateId(), request.getCityId());
        entity.setState(reference.state());
        entity.setCity(reference.city());
    }

    private void applyContractTypeRules(AdmissionProcessRequestDto request) {
        if (request.getContractType() == ContractTypeEnum.PJ) {
            if (!StringUtils.hasText(request.getProviderCnpj())
                    || request.getProviderCnpj().length() != 14
                    || !StringUtils.hasText(request.getProviderLegalName())) {
                throw AdmissionProcessException.pjProviderRequired();
            }
            request.setProviderLegalName(request.getProviderLegalName().trim());
            if (request.getProviderTradeName() != null) {
                request.setProviderTradeName(request.getProviderTradeName().trim());
            }
            request.setWorkloadSchedule(null);
            request.setPisPasep(null);
            return;
        }
        request.setProviderCnpj(null);
        request.setProviderLegalName(null);
        request.setProviderTradeName(null);
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
            documentCount = links.stream()
                    .filter(l -> "DOCUMENT".equalsIgnoreCase(l.getLinkRole()))
                    .count();
            contractDocumentCount = links.stream()
                    .filter(l -> "CONTRACT".equalsIgnoreCase(l.getLinkRole()))
                    .count();
        }
        entity.setAdmissionStatus(AdmissionProgressEvaluator.evaluate(entity, documentCount, contractDocumentCount)
                .status());
    }

    private AdmissionProgress evaluateProgress(AdmissionProcess entity, UUID admissionId) {
        long documentCount = 0;
        long contractDocumentCount = 0;
        if (admissionId != null) {
            AdmissionAttachmentCounts counts = loadAttachmentCounts(admissionId);
            documentCount = counts.documentCount();
            contractDocumentCount = counts.contractDocumentCount();
        }
        return AdmissionProgressEvaluator.evaluate(entity, documentCount, contractDocumentCount);
    }

    private List<AdmissionProcessResponseDto> mapToResponses(List<AdmissionProcess> entities) {
        if (entities.isEmpty()) {
            return List.of();
        }
        List<UUID> ids = entities.stream().map(AdmissionProcess::getId).toList();
        Map<UUID, Department> departments = loadDepartments(entities);
        Map<UUID, Collaborator> collaborators = loadCollaborators(entities);
        List<UUID> collaboratorIds = collaboratorIds(entities);
        var inVacationIds = loadActiveVacationCollaboratorIds(collaboratorIds);
        var absenceFlags = loadAbsenceFlags(collaboratorIds);
        var offboardedIds = loadOffboardedCollaboratorIds(collaboratorIds);
        var links = storageObjectLinkRepository.findAllByEntityTypeAndEntityIdInAndStatusNot(
                "admission_process", ids, StatusEnum.DELETED);
        return entities.stream()
                .map(entity -> {
                    AdmissionAttachmentCounts counts = AdmissionAttachmentCounts.fromLinks(links, entity.getId());
                    AdmissionProgress progress = AdmissionProgressEvaluator.evaluate(
                            entity, counts.documentCount(), counts.contractDocumentCount());
                    return mapper.toResponse(
                            entity,
                            progress.status(),
                            progress.completedStepCount(),
                            progress.requiredStepCount(),
                            progress.completedStepIds(),
                            departmentName(entity, departments),
                            collaboratorStatus(entity, collaborators, offboardedIds),
                            entity.getCollaboratorId() != null && inVacationIds.contains(entity.getCollaboratorId()),
                            entity.getCollaboratorId() != null
                                    && absenceFlags.registered().contains(entity.getCollaboratorId()),
                            entity.getCollaboratorId() != null
                                    && absenceFlags.active().contains(entity.getCollaboratorId()));
                })
                .toList();
    }

    private AdmissionProcessResponseDto toEnrichedResponse(AdmissionProcess entity) {
        AdmissionProgress progress = evaluateProgress(entity, entity.getId());
        Map<UUID, Department> departments = loadDepartments(List.of(entity));
        Map<UUID, Collaborator> collaborators = loadCollaborators(List.of(entity));
        List<UUID> collaboratorIds = collaboratorIds(List.of(entity));
        var inVacationIds = loadActiveVacationCollaboratorIds(collaboratorIds);
        var absenceFlags = loadAbsenceFlags(collaboratorIds);
        var offboardedIds = loadOffboardedCollaboratorIds(collaboratorIds);
        return mapper.toResponse(
                entity,
                progress.status(),
                progress.completedStepCount(),
                progress.requiredStepCount(),
                progress.completedStepIds(),
                departmentName(entity, departments),
                collaboratorStatus(entity, collaborators, offboardedIds),
                entity.getCollaboratorId() != null && inVacationIds.contains(entity.getCollaboratorId()),
                entity.getCollaboratorId() != null
                        && absenceFlags.registered().contains(entity.getCollaboratorId()),
                entity.getCollaboratorId() != null
                        && absenceFlags.active().contains(entity.getCollaboratorId()));
    }

    private Map<String, List<String>> admissionFilterOptions(List<AdmissionProcessResponseDto> rows) {
        return Map.of(
                "admissionStatus",
                        distinctFilterValues(
                                rows,
                                row -> row.getAdmissionStatus() != null
                                        ? row.getAdmissionStatus().name()
                                        : null),
                "departmentName", distinctFilterValues(rows, AdmissionProcessResponseDto::getDepartmentName));
    }

    private static List<String> distinctFilterValues(
            List<AdmissionProcessResponseDto> rows, Function<AdmissionProcessResponseDto, String> mapper) {
        return rows.stream()
                .map(mapper)
                .filter(value -> value != null && !value.isBlank())
                .distinct()
                .sorted(Comparator.naturalOrder())
                .toList();
    }

    private static boolean matchesAdmissionFilters(AdmissionProcessResponseDto row, Map<String, List<String>> filters) {
        if (filters == null || filters.isEmpty()) {
            return true;
        }
        return filters.entrySet().stream()
                .allMatch(entry -> matchesAdmissionFilter(row, entry.getKey(), entry.getValue()));
    }

    private static boolean matchesAdmissionFilter(
            AdmissionProcessResponseDto row, String field, List<String> acceptedValues) {
        if (acceptedValues == null || acceptedValues.isEmpty()) {
            return true;
        }
        return switch (field) {
            case "profileStatus" -> acceptedValues.stream().anyMatch(value -> matchesProfileStatus(row, value));
            case "admissionTags" -> admissionTags(row).stream().anyMatch(acceptedValues::contains);
            case "code" -> matchesContains(
                    acceptedValues, row.getCode() != null ? row.getCode().toString() : null);
            case "fullName" -> matchesContains(acceptedValues, row.getFullName());
            case "admissionStatus" -> acceptedValues.contains(
                    row.getAdmissionStatus() != null ? row.getAdmissionStatus().name() : null);
            case "expectedStartDate" -> acceptedValues.contains(
                    row.getExpectedStartDate() != null
                            ? row.getExpectedStartDate().toString()
                            : null);
            case "departmentName" -> acceptedValues.contains(row.getDepartmentName());
            default -> true;
        };
    }

    private static boolean matchesContains(List<String> acceptedValues, String value) {
        String normalizedValue = value != null ? value.toLowerCase() : "";
        return acceptedValues.stream()
                .map(String::toLowerCase)
                .anyMatch(normalizedValue::contains);
    }

    private static boolean matchesProfileStatus(AdmissionProcessResponseDto row, String value) {
        if ("INACTIVE".equals(value)) {
            return row.getCollaboratorStatus() == StatusEnum.INACTIVE;
        }
        if ("ACTIVE".equals(value)) {
            return row.getCollaboratorStatus() != StatusEnum.INACTIVE;
        }
        return true;
    }

    private static List<String> admissionTags(AdmissionProcessResponseDto row) {
        java.util.ArrayList<String> tags = new java.util.ArrayList<>();
        if (row.getCollaboratorStatus() == StatusEnum.INACTIVE) {
            tags.add("DISMISSED");
        }
        if (row.isInVacation()) {
            tags.add("IN_VACATION");
        }
        if (row.isOnLeaveActive()) {
            tags.add("ON_LEAVE");
        }
        return tags;
    }

    private Map<UUID, Department> loadDepartments(List<AdmissionProcess> entities) {
        List<UUID> departmentIds = entities.stream()
                .map(AdmissionProcess::getDepartmentId)
                .filter(id -> id != null)
                .distinct()
                .toList();
        if (departmentIds.isEmpty()) {
            return Map.of();
        }
        return departmentRepository.findAllById(departmentIds).stream()
                .collect(Collectors.toMap(Department::getId, Function.identity()));
    }

    private static String departmentName(AdmissionProcess entity, Map<UUID, Department> departments) {
        Department department = entity.getDepartmentId() != null ? departments.get(entity.getDepartmentId()) : null;
        return department != null && department.getStatus() != StatusEnum.DELETED ? department.getName() : null;
    }

    private Map<UUID, Collaborator> loadCollaborators(List<AdmissionProcess> entities) {
        List<UUID> collaboratorIds = collaboratorIds(entities);
        if (collaboratorIds.isEmpty()) {
            return Map.of();
        }
        return collaboratorRepository.findAllById(collaboratorIds).stream()
                .filter(collaborator -> collaborator.getStatus() != StatusEnum.DELETED)
                .collect(Collectors.toMap(Collaborator::getId, Function.identity()));
    }

    private static List<UUID> collaboratorIds(List<AdmissionProcess> entities) {
        return entities.stream()
                .map(AdmissionProcess::getCollaboratorId)
                .filter(id -> id != null)
                .distinct()
                .toList();
    }

    private Set<UUID> loadActiveVacationCollaboratorIds(List<UUID> collaboratorIds) {
        if (collaboratorIds.isEmpty()) {
            return Set.of();
        }
        LocalDate today = LocalDate.now(BUSINESS_ZONE);
        return leaveRequestRepository
                .findApprovedByCollaboratorInAndTypeOverlapping(
                        collaboratorIds, LeaveTypeEnum.VACATION, today, today, StatusEnum.DELETED)
                .stream()
                .map(LeaveRequest::getCollaboratorId)
                .collect(Collectors.toSet());
    }

    /**
     * @param registered colaboradores com qualquer afastamento aprovado/validado (qualquer data) — alimenta o flag
     *     {@code onLeave}, preservado como informacao historica.
     * @param active subconjunto cujo afastamento esta vigente hoje — alimenta o flag {@code onLeaveActive} e o filtro.
     */
    private record AbsenceFlags(Set<UUID> registered, Set<UUID> active) {}

    private AbsenceFlags loadAbsenceFlags(List<UUID> collaboratorIds) {
        if (collaboratorIds.isEmpty()) {
            return new AbsenceFlags(Set.of(), Set.of());
        }
        LocalDate today = LocalDate.now(BUSINESS_ZONE);
        List<LeaveRequest> absences = leaveRequestRepository.findRegisteredAbsencesByCollaboratorIn(
                collaboratorIds, LeaveTypeEnum.VACATION, approvedAbsenceStatuses(), StatusEnum.DELETED);
        Set<UUID> registered =
                absences.stream().map(LeaveRequest::getCollaboratorId).collect(Collectors.toSet());
        Set<UUID> active = absences.stream()
                .filter(absence -> absence.getStartDate() != null
                        && absence.getEndDate() != null
                        && !absence.getStartDate().isAfter(today)
                        && !absence.getEndDate().isBefore(today))
                .map(LeaveRequest::getCollaboratorId)
                .collect(Collectors.toSet());
        return new AbsenceFlags(registered, active);
    }

    private static List<LeaveAbsenceStatusEnum> approvedAbsenceStatuses() {
        return Arrays.stream(LeaveAbsenceStatusEnum.values())
                .filter(LeaveAbsenceRules::isApprovedAbsenceStatus)
                .toList();
    }

    private Set<UUID> loadOffboardedCollaboratorIds(List<UUID> collaboratorIds) {
        if (collaboratorIds.isEmpty()) {
            return Set.of();
        }
        return offboardingRepository.findOffboardedCollaboratorIdsIn(collaboratorIds, StatusEnum.DELETED).stream()
                .collect(Collectors.toSet());
    }

    private static StatusEnum collaboratorStatus(
            AdmissionProcess entity, Map<UUID, Collaborator> collaborators, Set<UUID> offboardedIds) {
        if (entity.getCollaboratorId() != null && offboardedIds.contains(entity.getCollaboratorId())) {
            return StatusEnum.INACTIVE;
        }
        Collaborator collaborator =
                entity.getCollaboratorId() != null ? collaborators.get(entity.getCollaboratorId()) : null;
        return collaborator != null ? collaborator.getStatus() : null;
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
