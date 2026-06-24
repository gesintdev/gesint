package br.com.gommo.modules.rh.person.leave.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
import br.com.gommo.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gommo.modules.rh.person.contract.entity.ContractTypeEnum;
import br.com.gommo.modules.rh.person.contract.entity.EmploymentContract;
import br.com.gommo.modules.rh.person.contract.repository.EmploymentContractRepository;
import br.com.gommo.modules.rh.person.contract.recess.entity.ContractRecessPeriod;
import br.com.gommo.modules.rh.person.contract.recess.entity.ContractRecessPolicy;
import br.com.gommo.modules.rh.person.contract.recess.entity.RecessPeriodStatusEnum;
import br.com.gommo.modules.rh.person.contract.recess.repository.ContractRecessPeriodRepository;
import br.com.gommo.modules.rh.person.contract.recess.repository.ContractRecessPolicyRepository;
import br.com.gommo.modules.rh.person.leave.domain.VacationAbsenceCalculator;
import br.com.gommo.modules.rh.person.leave.domain.VacationEligibilityEvaluator;
import br.com.gommo.modules.rh.person.leave.domain.VacationRules;
import br.com.gommo.modules.rh.person.leave.dto.LeaveRequestRequestDto;
import br.com.gommo.modules.rh.person.leave.dto.LeaveRequestResponseDto;
import br.com.gommo.modules.rh.person.leave.dto.VacationAbsenceSummaryDto;
import br.com.gommo.modules.rh.person.leave.dto.VacationEligibleCollaboratorDto;
import br.com.gommo.modules.rh.person.leave.dto.VacationReviewRequestDto;
import br.com.gommo.modules.rh.person.leave.entity.LeaveRequest;
import br.com.gommo.modules.rh.person.leave.entity.LeaveTypeEnum;
import br.com.gommo.modules.rh.person.leave.entity.VacationReviewActionEnum;
import br.com.gommo.modules.rh.person.leave.entity.VacationReviewStatusEnum;
import br.com.gommo.modules.rh.person.leave.exception.LeaveRequestException;
import br.com.gommo.modules.rh.person.leave.exception.LeaveRequestExceptions;
import br.com.gommo.modules.rh.person.leave.mapper.LeaveRequestMapper;
import br.com.gommo.modules.rh.person.leave.repository.LeaveRequestRepository;

@Service
public class LeaveRequestService extends BaseService<LeaveRequest, LeaveRequestRequestDto, LeaveRequestResponseDto>
        implements ILeaveRequestService {

    private final LeaveRequestRepository repository;
    private final LeaveRequestMapper mapper;
    private final CollaboratorRepository collaboratorRepository;
    private final EmploymentContractRepository employmentContractRepository;
    private final AdmissionProcessRepository admissionProcessRepository;
    private final ContractRecessPeriodRepository recessPeriodRepository;
    private final ContractRecessPolicyRepository recessPolicyRepository;

    public LeaveRequestService(
            LeaveRequestRepository repository,
            LeaveRequestMapper mapper,
            CollaboratorRepository collaboratorRepository,
            EmploymentContractRepository employmentContractRepository,
            AdmissionProcessRepository admissionProcessRepository,
            ContractRecessPeriodRepository recessPeriodRepository,
            ContractRecessPolicyRepository recessPolicyRepository) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.collaboratorRepository = collaboratorRepository;
        this.employmentContractRepository = employmentContractRepository;
        this.admissionProcessRepository = admissionProcessRepository;
        this.recessPeriodRepository = recessPeriodRepository;
        this.recessPolicyRepository = recessPolicyRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('leave:read')")
    public List<LeaveRequestResponseDto> findAll() {
        List<LeaveRequest> entities = repository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED);
        Map<UUID, String> collaboratorNames = collaboratorNamesById(entities.stream()
                .map(LeaveRequest::getCollaboratorId)
                .distinct()
                .toList());
        return entities.stream()
                .map(entity -> mapper.toResponse(entity, collaboratorNames.get(entity.getCollaboratorId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('leave:read')")
    public LeaveRequestResponseDto findById(UUID id) {
        LeaveRequest entity = findEntity(id);
        return mapper.toResponse(entity, resolveCollaboratorName(entity.getCollaboratorId()));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('leave:read')")
    public PageableResponseDto<LeaveRequestResponseDto> findPage(int page, int size) {
        PageableResponseDto<LeaveRequestResponseDto> pageResult = super.findPage(page, size);
        List<LeaveRequestResponseDto> content = pageResult.getContent();
        if (content.isEmpty()) {
            return pageResult;
        }
        Map<UUID, String> collaboratorNames = collaboratorNamesById(content.stream()
                .map(LeaveRequestResponseDto::getCollaboratorId)
                .distinct()
                .toList());
        Map<UUID, LeaveRequest> entitiesById =
                repository
                        .findAllById(content.stream()
                                .map(LeaveRequestResponseDto::getId)
                                .toList())
                        .stream()
                        .filter(entity -> entity.getStatus() != StatusEnum.DELETED)
                        .collect(Collectors.toMap(LeaveRequest::getId, Function.identity()));
        List<LeaveRequestResponseDto> enriched = content.stream()
                .map(dto -> mapper.toResponse(
                        entitiesById.get(dto.getId()), collaboratorNames.get(dto.getCollaboratorId())))
                .toList();
        return PageableResponseDto.<LeaveRequestResponseDto>builder()
                .content(enriched)
                .page(pageResult.getPage())
                .size(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('leave:write')")
    public LeaveRequestResponseDto create(LeaveRequestRequestDto request) {
        prepareRecessRequest(request);
        validateRequest(request);
        LeaveRequest entity = mapper.toEntity(request);
        applyVacationDefaultsOnCreate(entity, request);
        LeaveRequest saved = repository.save(entity);
        return findById(saved.getId());
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('leave:read')")
    public VacationAbsenceSummaryDto absenceSummary(
            UUID collaboratorId, LocalDate acquisitionStart, LocalDate acquisitionEnd) {
        if (acquisitionEnd.isBefore(acquisitionStart)) {
            throw LeaveRequestException.vacationInvalid(LeaveRequestExceptions.VACATION_INVALID_DATES_MSG);
        }
        List<LeaveRequest> leaves =
                repository.findApprovedAbsencesOverlapping(
                        collaboratorId,
                        LeaveTypeEnum.VACATION,
                        acquisitionStart,
                        acquisitionEnd,
                        StatusEnum.DELETED);
        VacationAbsenceCalculator.Summary summary =
                VacationAbsenceCalculator.summarize(leaves, acquisitionStart, acquisitionEnd);
        return VacationAbsenceSummaryDto.builder()
                .unjustifiedAbsences(summary.unjustifiedAbsences())
                .justifiedAbsences(summary.justifiedAbsences())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('leave:read') or hasAuthority('notification:read')")
    public List<VacationEligibleCollaboratorDto> findVacationEligibleCollaborators() {
        LocalDate referenceDate = LocalDate.now(ZoneId.of("America/Sao_Paulo"));
        Map<UUID, List<EmploymentContract>> contractsByCollaborator = employmentContractRepository.findAll().stream()
                .filter(contract -> contract.getStatus() != StatusEnum.DELETED)
                .collect(Collectors.groupingBy(EmploymentContract::getCollaboratorId));
        Map<UUID, AdmissionProcess> admissionsByCollaborator = admissionProcessRepository
                .findByAdmissionStatusAndCollaboratorIdIsNotNullAndStatusNot(
                        AdmissionStatusEnum.COMPLETED, StatusEnum.DELETED)
                .stream()
                .collect(Collectors.toMap(
                        AdmissionProcess::getCollaboratorId,
                        Function.identity(),
                        LeaveRequestService::latestAdmission));
        Map<UUID, List<LeaveRequest>> leavesByCollaborator = repository
                .findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED)
                .stream()
                .collect(Collectors.groupingBy(LeaveRequest::getCollaboratorId));

        return collaboratorRepository.findByStatusNotOrderByFullNameAsc(StatusEnum.DELETED).stream()
                .filter(collaborator -> collaborator.getStatus() == StatusEnum.ACTIVE)
                .map(collaborator -> buildEligibleCollaborator(
                        collaborator,
                        contractsByCollaborator.getOrDefault(collaborator.getId(), List.of()),
                        admissionsByCollaborator.get(collaborator.getId()),
                        leavesByCollaborator.getOrDefault(collaborator.getId(), List.of()),
                        referenceDate))
                .flatMap(Optional::stream)
                .sorted(Comparator.comparing((VacationEligibleCollaboratorDto row) -> !"EXPIRED".equals(row.getPeriodStatus()))
                        .thenComparing(VacationEligibleCollaboratorDto::getConcessiveEnd)
                        .thenComparing(VacationEligibleCollaboratorDto::getCollaboratorName))
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('leave:write')")
    public LeaveRequestResponseDto reviewVacation(UUID id, VacationReviewRequestDto request) {
        LeaveRequest entity = findEntity(id);
        if (entity.getLeaveType() != LeaveTypeEnum.VACATION) {
            throw LeaveRequestException.vacationReviewInvalid(LeaveRequestExceptions.VACATION_REVIEW_NOT_VACATION_MSG);
        }
        VacationReviewStatusEnum previousStatus = entity.getReviewStatus();
        switch (request.getAction()) {
            case APPROVE -> {
                entity.setApproved(true);
                entity.setReviewStatus(VacationReviewStatusEnum.APPROVED);
                entity.setReviewReason(null);
            }
            case RETURN -> {
                String reason = requireReviewReason(request.getReason());
                entity.setApproved(false);
                entity.setReviewStatus(VacationReviewStatusEnum.RETURNED);
                entity.setReviewReason(reason);
            }
            case REJECT -> {
                String reason = requireReviewReason(request.getReason());
                entity.setApproved(false);
                entity.setReviewStatus(VacationReviewStatusEnum.REJECTED);
                entity.setReviewReason(reason);
            }
            default -> throw LeaveRequestException.vacationReviewInvalid(LeaveRequestExceptions.VACATION_REVIEW_INVALID_CODE);
        }
        adjustRecessBalance(entity, previousStatus, request.getAction());
        repository.save(entity);
        return findById(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('leave:write')")
    public LeaveRequestResponseDto update(UUID id, LeaveRequestRequestDto request) {
        validateRequest(request);
        LeaveRequestResponseDto updated = super.update(id, request);
        return findById(updated.getId());
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('leave:delete')")
    public void delete(UUID id) {
        LeaveRequest entity = findEntity(id);
        if (entity.getRecessPeriodId() != null && entity.getReviewStatus() == VacationReviewStatusEnum.PENDING) {
            releaseRecessReservation(entity);
        }
        super.delete(id);
    }

    @Override
    protected LeaveRequest findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(LeaveRequestException::notFound);
    }

    @Override
    protected void updateEntity(LeaveRequest entity, LeaveRequestRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private void applyVacationDefaultsOnCreate(LeaveRequest entity, LeaveRequestRequestDto request) {
        LeaveTypeEnum type = request.getLeaveType() != null ? request.getLeaveType() : LeaveTypeEnum.VACATION;
        if (type != LeaveTypeEnum.VACATION) {
            return;
        }
        if (request.getRecessPeriodId() != null) {
            return;
        }
        if (!Boolean.TRUE.equals(request.getApproved()) && entity.getReviewStatus() == null) {
            entity.setReviewStatus(VacationReviewStatusEnum.PENDING);
        }
        if (Boolean.TRUE.equals(request.getApproved()) && entity.getReviewStatus() == null) {
            entity.setReviewStatus(VacationReviewStatusEnum.APPROVED);
        }
    }

    private static String requireReviewReason(String reason) {
        if (reason == null || reason.isBlank()) {
            throw LeaveRequestException.vacationReviewInvalid(LeaveRequestExceptions.VACATION_REVIEW_REASON_REQUIRED_MSG);
        }
        return reason.trim();
    }

    private void validateRequest(LeaveRequestRequestDto request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw LeaveRequestException.vacationInvalid(LeaveRequestExceptions.VACATION_INVALID_DATES_MSG);
        }

        LeaveTypeEnum type = request.getLeaveType() != null ? request.getLeaveType() : LeaveTypeEnum.VACATION;
        if (type != LeaveTypeEnum.VACATION) {
            return;
        }

        int absences = request.getUnjustifiedAbsences() != null ? request.getUnjustifiedAbsences() : 0;
        int entitled = request.getVacationDaysEntitled() != null
                ? request.getVacationDaysEntitled()
                : VacationRules.vacationDaysEntitled(absences);

        if (entitled <= 0) {
            throw LeaveRequestException.vacationInvalid(LeaveRequestExceptions.VACATION_NO_ENTITLEMENT_MSG);
        }

        int pecuniary = request.getPecuniaryAllowanceDays() != null ? request.getPecuniaryAllowanceDays() : 0;
        if (pecuniary < 0 || pecuniary > VacationRules.maxPecuniaryDays(entitled)) {
            throw LeaveRequestException.vacationInvalid(LeaveRequestExceptions.VACATION_PECUNIARY_EXCEEDED_MSG);
        }

        int usedDays = VacationRules.inclusiveDays(request.getStartDate(), request.getEndDate());
        if (usedDays + pecuniary > entitled) {
            throw LeaveRequestException.vacationInvalid(LeaveRequestExceptions.VACATION_DAYS_EXCEEDED_MSG);
        }

        if (VacationRules.isRestrictedVacationStart(request.getStartDate())) {
            throw LeaveRequestException.vacationInvalid(LeaveRequestExceptions.VACATION_START_RESTRICTED_MSG);
        }
    }

    private Optional<VacationEligibleCollaboratorDto> buildEligibleCollaborator(
            Collaborator collaborator,
            List<EmploymentContract> contracts,
            AdmissionProcess admission,
            List<LeaveRequest> leaves,
            LocalDate referenceDate) {
        Optional<EmploymentContract> activeContract = contracts.stream()
                .filter(contract -> contract.getStatus() == StatusEnum.ACTIVE)
                .filter(contract -> !contract.getStartDate().isAfter(referenceDate))
                .filter(contract -> contract.getEndDate() == null || !contract.getEndDate().isBefore(referenceDate))
                .max(Comparator.comparing(EmploymentContract::getStartDate));

        if (!contracts.isEmpty() && activeContract.isEmpty()) {
            return Optional.empty();
        }

        ContractTypeEnum contractType = activeContract
                .map(EmploymentContract::getContractType)
                .orElseGet(() -> admission != null ? admission.getContractType() : null);
        if (contractType == ContractTypeEnum.PJ && activeContract.isPresent()) {
            return buildEligibleRecess(collaborator, admission, activeContract.get(), referenceDate);
        }
        if (contractType != ContractTypeEnum.CLT || (activeContract.isEmpty() && !isAdmissionActive(admission, referenceDate))) {
            return Optional.empty();
        }

        LocalDate hireDate = admission != null ? admissionDate(admission) : null;
        if (hireDate == null) {
            hireDate = activeContract.map(EmploymentContract::getStartDate).orElse(null);
        }
        if (hireDate == null) {
            return Optional.empty();
        }
        LocalDate resolvedHireDate = hireDate;

        return VacationEligibilityEvaluator.findFirstEligiblePeriod(resolvedHireDate, referenceDate, leaves)
                .map(period -> VacationEligibleCollaboratorDto.builder()
                        .collaboratorId(collaborator.getId())
                        .collaboratorName(collaborator.getFullName())
                        .cpf(collaborator.getCpf())
                        .photoObjectId(collaborator.getPhotoObjectId() != null
                                ? collaborator.getPhotoObjectId()
                                : admission != null ? admission.getPhotoObjectId() : null)
                        .hireDate(resolvedHireDate)
                        .contractType(contractType)
                        .periodStatus(period.status())
                        .entitledDays(period.entitledDays())
                        .unjustifiedAbsences(period.unjustifiedAbsences())
                        .justifiedAbsences(period.justifiedAbsences())
                        .acquisitionStart(period.acquisition().start())
                        .acquisitionEnd(period.acquisition().end())
                        .concessiveStart(period.concessive().start())
                        .concessiveEnd(period.concessive().end())
                        .build());
    }

    private Optional<VacationEligibleCollaboratorDto> buildEligibleRecess(
            Collaborator collaborator, AdmissionProcess admission, EmploymentContract contract, LocalDate referenceDate) {
        ContractRecessPolicy policy = recessPolicyRepository
                .findEffective(contract.getId(), referenceDate, StatusEnum.DELETED)
                .filter(ContractRecessPolicy::isEnabled)
                .orElse(null);
        if (policy == null) return Optional.empty();
        return recessPeriodRepository
                .findAllByCollaboratorIdAndStatusNotOrderByCycleStartDesc(collaborator.getId(), StatusEnum.DELETED)
                .stream()
                .filter(period -> period.getPolicyId().equals(policy.getId()))
                .filter(period -> !referenceDate.isBefore(period.getCycleStart().plusMonths(policy.getEligibilityAfterMonths())))
                .filter(period -> period.getRemainingDays() > 0)
                .findFirst()
                .map(period -> VacationEligibleCollaboratorDto.builder()
                        .collaboratorId(collaborator.getId())
                        .collaboratorName(collaborator.getFullName())
                        .cpf(collaborator.getCpf())
                        .photoObjectId(collaborator.getPhotoObjectId() != null ? collaborator.getPhotoObjectId() : admission != null ? admission.getPhotoObjectId() : null)
                        .hireDate(contract.getStartDate())
                        .contractType(ContractTypeEnum.PJ)
                        .periodStatus("CONTRACT_RECESS")
                        .entitledDays(period.getRemainingDays())
                        .unjustifiedAbsences(0)
                        .justifiedAbsences(0)
                        .acquisitionStart(period.getCycleStart())
                        .acquisitionEnd(period.getCycleEnd())
                        .concessiveStart(period.getCycleStart().plusMonths(policy.getEligibilityAfterMonths()))
                        .concessiveEnd(period.getCycleEnd())
                        .recessPeriodId(period.getId())
                        .recessFinancialMode(policy.getFinancialMode())
                        .recessPaidPercentage(policy.getPaidPercentage())
                        .recessAllowSplit(policy.isAllowSplit())
                        .recessMaxSplitPeriods(policy.getMaxSplitPeriods())
                        .recessMinimumSplitDays(policy.getMinimumSplitDays())
                        .recessAdvanceNoticeDays(policy.getAdvanceNoticeDays())
                        .build());
    }

    private void prepareRecessRequest(LeaveRequestRequestDto request) {
        if (request.getRecessPeriodId() == null) return;
        ContractRecessPeriod period = recessPeriodRepository
                .findByIdAndStatusNot(request.getRecessPeriodId(), StatusEnum.DELETED)
                .orElseThrow(() -> LeaveRequestException.vacationInvalid("Período de recesso contratual não encontrado"));
        ContractRecessPolicy policy = recessPolicyRepository
                .findByIdAndStatusNot(period.getPolicyId(), StatusEnum.DELETED)
                .orElseThrow(() -> LeaveRequestException.vacationInvalid("Política de recesso contratual não encontrada"));
        int days = VacationRules.inclusiveDays(request.getStartDate(), request.getEndDate());
        if (days > period.getRemainingDays()) {
            throw LeaveRequestException.vacationInvalid("A solicitação excede o saldo de recesso contratual");
        }
        if (request.getStartDate().isBefore(LocalDate.now(ZoneId.of("America/Sao_Paulo")).plusDays(policy.getAdvanceNoticeDays()))) {
            throw LeaveRequestException.vacationInvalid("A solicitação não respeita a antecedência contratual mínima");
        }
        if (policy.isAllowSplit() && policy.getMinimumSplitDays() != null && days < policy.getMinimumSplitDays()) {
            throw LeaveRequestException.vacationInvalid("A parcela possui menos dias que o mínimo contratual");
        }
        request.setPecuniaryAllowanceDays(0);
        request.setUnjustifiedAbsences(0);
        request.setVacationDaysEntitled(period.getRemainingDays());
        request.setAcquisitionPeriodStart(period.getCycleStart());
        request.setAcquisitionPeriodEnd(period.getCycleEnd());
        request.setRecessFinancialMode(policy.getFinancialMode());
        request.setRecessPaidPercentage(policy.getPaidPercentage());
        period.setReservedDays(period.getReservedDays() + days);
        period.setPeriodStatus(period.getRemainingDays() == 0 ? RecessPeriodStatusEnum.EXHAUSTED : RecessPeriodStatusEnum.AVAILABLE);
        recessPeriodRepository.save(period);
    }

    private void adjustRecessBalance(
            LeaveRequest request, VacationReviewStatusEnum previousStatus, VacationReviewActionEnum action) {
        if (request.getRecessPeriodId() == null || previousStatus != VacationReviewStatusEnum.PENDING) return;
        ContractRecessPeriod period = recessPeriodRepository
                .findByIdAndStatusNot(request.getRecessPeriodId(), StatusEnum.DELETED)
                .orElseThrow(() -> LeaveRequestException.vacationInvalid("Periodo de recesso contratual nao encontrado"));
        int days = VacationRules.inclusiveDays(request.getStartDate(), request.getEndDate());
        period.setReservedDays(Math.max(0, period.getReservedDays() - days));
        if (action == VacationReviewActionEnum.APPROVE) {
            period.setUsedDays(period.getUsedDays() + days);
        }
        period.setPeriodStatus(period.getRemainingDays() == 0
                ? RecessPeriodStatusEnum.EXHAUSTED
                : RecessPeriodStatusEnum.AVAILABLE);
        recessPeriodRepository.save(period);
    }

    private void releaseRecessReservation(LeaveRequest request) {
        ContractRecessPeriod period = recessPeriodRepository
                .findByIdAndStatusNot(request.getRecessPeriodId(), StatusEnum.DELETED)
                .orElse(null);
        if (period == null) return;
        int days = VacationRules.inclusiveDays(request.getStartDate(), request.getEndDate());
        period.setReservedDays(Math.max(0, period.getReservedDays() - days));
        period.setPeriodStatus(RecessPeriodStatusEnum.AVAILABLE);
        recessPeriodRepository.save(period);
    }

    private static boolean isAdmissionActive(AdmissionProcess admission, LocalDate referenceDate) {
        LocalDate startDate = admission != null ? admissionDate(admission) : null;
        if (startDate == null || startDate.isAfter(referenceDate)) {
            return false;
        }
        return admission.getContractEndDate() == null || !admission.getContractEndDate().isBefore(referenceDate);
    }

    private static LocalDate admissionDate(AdmissionProcess admission) {
        return admission.getContractStartDate() != null
                ? admission.getContractStartDate()
                : admission.getExpectedStartDate();
    }

    private static AdmissionProcess latestAdmission(AdmissionProcess first, AdmissionProcess second) {
        LocalDate firstDate = admissionDate(first);
        LocalDate secondDate = admissionDate(second);
        if (firstDate == null) return second;
        if (secondDate == null) return first;
        return firstDate.isAfter(secondDate) ? first : second;
    }

    private Map<UUID, String> collaboratorNamesById(List<UUID> collaboratorIds) {
        if (collaboratorIds.isEmpty()) {
            return Map.of();
        }
        return collaboratorRepository.findAllById(collaboratorIds).stream()
                .filter(c -> c.getStatus() != StatusEnum.DELETED)
                .collect(Collectors.toMap(Collaborator::getId, Collaborator::getFullName, (a, b) -> a));
    }

    private String resolveCollaboratorName(UUID collaboratorId) {
        return collaboratorNamesById(List.of(collaboratorId)).get(collaboratorId);
    }
}
