package br.com.gommo.modules.rh.person.developmentplan.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.organization.department.entity.Department;
import br.com.gommo.modules.dp.organization.department.repository.DepartmentRepository;
import br.com.gommo.modules.dp.organization.jobposition.entity.JobPosition;
import br.com.gommo.modules.dp.organization.jobposition.repository.JobPositionRepository;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gommo.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gommo.modules.rh.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gommo.modules.rh.person.developmentplan.dto.*;
import br.com.gommo.modules.rh.person.developmentplan.entity.*;
import br.com.gommo.modules.rh.person.developmentplan.exception.DevelopmentPlanException;
import br.com.gommo.modules.rh.person.developmentplan.mapper.DevelopmentPlanMapper;
import br.com.gommo.modules.rh.person.developmentplan.repository.DevelopmentPlanRepository;

@Service
public class DevelopmentPlanService extends BaseService<DevelopmentPlan, DevelopmentPlanRequestDto, DevelopmentPlanResponseDto>
        implements IDevelopmentPlanService {

    private final DevelopmentPlanRepository repository;
    private final DevelopmentPlanMapper mapper;
    private final AdmissionProcessRepository admissionProcessRepository;
    private final DepartmentRepository departmentRepository;
    private final JobPositionRepository jobPositionRepository;

    public DevelopmentPlanService(
            DevelopmentPlanRepository repository,
            DevelopmentPlanMapper mapper,
            AdmissionProcessRepository admissionProcessRepository,
            DepartmentRepository departmentRepository,
            JobPositionRepository jobPositionRepository) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.admissionProcessRepository = admissionProcessRepository;
        this.departmentRepository = departmentRepository;
        this.jobPositionRepository = jobPositionRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplan:read')")
    public List<DevelopmentPlanResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplan:read')")
    public DevelopmentPlanResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('developmentplan:read')")
    public PageableResponseDto<DevelopmentPlanResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplan:write')")
    public DevelopmentPlanResponseDto create(DevelopmentPlanRequestDto request) {
        DevelopmentPlan entity = mapper.toEntity(request);
        entity.setStatus(StatusEnum.ACTIVE);
        applyCollaboratorSnapshot(entity);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplan:write')")
    public DevelopmentPlanResponseDto update(UUID id, DevelopmentPlanRequestDto request) {
        DevelopmentPlan entity = findEntity(id);
        mapper.updateEntity(entity, request);
        applyCollaboratorSnapshot(entity);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplan:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplan:approve')")
    public DevelopmentPlanResponseDto submitForApproval(UUID id) {
        DevelopmentPlan entity = findEntity(id);
        if (entity.getPlanStatus() != DevelopmentPlanStatusEnum.DRAFT) {
            throw DevelopmentPlanException.invalidStatus();
        }
        entity.setPlanStatus(DevelopmentPlanStatusEnum.PENDING_APPROVAL);
        mapper.recalculate(entity);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplan:approve')")
    public DevelopmentPlanResponseDto approve(UUID id, DevelopmentPlanApprovalRequestDto request) {
        DevelopmentPlan entity = findEntity(id);
        if (entity.getPlanStatus() != DevelopmentPlanStatusEnum.PENDING_APPROVAL
                && entity.getPlanStatus() != DevelopmentPlanStatusEnum.DRAFT) {
            throw DevelopmentPlanException.invalidStatus();
        }
        entity.setPlanStatus(DevelopmentPlanStatusEnum.IN_PROGRESS);
        entity.setApprovedAt(OffsetDateTime.now());
        entity.setApprovedBy(request != null ? request.getApprovedBy() : null);
        mapper.recalculate(entity);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplan:conclude')")
    public DevelopmentPlanResponseDto conclude(UUID id) {
        DevelopmentPlan entity = findEntity(id);
        mapper.recalculate(entity);
        if (!canConclude(entity)) {
            throw DevelopmentPlanException.completionBlocked();
        }
        entity.setPlanStatus(DevelopmentPlanStatusEnum.COMPLETED);
        entity.setCompletedAt(OffsetDateTime.now());
        entity.setProgress(100);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('developmentplan:cancel')")
    public DevelopmentPlanResponseDto cancel(UUID id, DevelopmentPlanCancelRequestDto request) {
        DevelopmentPlan entity = findEntity(id);
        if (entity.getPlanStatus() == DevelopmentPlanStatusEnum.COMPLETED
                || entity.getPlanStatus() == DevelopmentPlanStatusEnum.CANCELED) {
            throw DevelopmentPlanException.invalidStatus();
        }
        entity.setPlanStatus(DevelopmentPlanStatusEnum.CANCELED);
        entity.setCanceledAt(OffsetDateTime.now());
        entity.setCancelReason(request != null ? request.getReason() : null);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    protected DevelopmentPlan findEntity(UUID id) {
        DevelopmentPlan entity = repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(DevelopmentPlanException::notFound);
        mapper.recalculate(entity);
        return entity;
    }

    @Override
    protected void updateEntity(DevelopmentPlan entity, DevelopmentPlanRequestDto request) {
        mapper.updateEntity(entity, request);
        applyCollaboratorSnapshot(entity);
    }

    private void applyCollaboratorSnapshot(DevelopmentPlan entity) {
        AdmissionProcess admission = latestCompletedAdmission(entity.getCollaboratorId());
        JobPosition jobPosition = admission.getJobPositionId() != null
                ? jobPositionRepository.findByIdAndStatusNot(admission.getJobPositionId(), StatusEnum.DELETED).orElse(null)
                : null;
        UUID departmentId = admission.getDepartmentId() != null ? admission.getDepartmentId() : jobPositionDepartmentId(jobPosition);
        Department department = departmentId != null
                ? departmentRepository.findByIdAndStatusNot(departmentId, StatusEnum.DELETED).orElse(null)
                : null;

        entity.setCollaboratorName(displayName(admission));
        entity.setRegistrationNumber(null);
        entity.setJobPositionId(admission.getJobPositionId());
        entity.setJobPositionName(jobPosition != null ? jobPosition.getTitle() : null);
        entity.setDepartmentId(departmentId);
        entity.setDepartmentName(department != null ? department.getName() : null);
    }

    private AdmissionProcess latestCompletedAdmission(UUID collaboratorId) {
        return admissionProcessRepository
                .findByCollaboratorIdAndAdmissionStatusAndStatusNot(
                        collaboratorId, AdmissionStatusEnum.COMPLETED, StatusEnum.DELETED)
                .stream()
                .max(Comparator.comparing(this::admissionStartDate, Comparator.nullsFirst(Comparator.naturalOrder()))
                        .thenComparing(AdmissionProcess::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .orElseThrow(DevelopmentPlanException::collaboratorAdmissionRequired);
    }

    private LocalDate admissionStartDate(AdmissionProcess admission) {
        return admission.getContractStartDate() != null ? admission.getContractStartDate() : admission.getExpectedStartDate();
    }

    private UUID jobPositionDepartmentId(JobPosition jobPosition) {
        return jobPosition != null ? jobPosition.getDepartmentId() : null;
    }

    private String displayName(AdmissionProcess admission) {
        return admission.getSocialName() != null && !admission.getSocialName().isBlank()
                ? admission.getSocialName()
                : admission.getFullName();
    }

    private boolean canConclude(DevelopmentPlan entity) {
        if (entity.getProgress() == null || entity.getProgress() < 100) {
            return false;
        }
        List<DevelopmentPlanAction> actions = entity.getGoals().stream()
                .flatMap(goal -> goal.getActions().stream())
                .toList();
        boolean requiredActionsCompleted = actions.stream()
                .filter(action -> Boolean.TRUE.equals(action.getEvidenceRequired()))
                .allMatch(action -> action.getStatus() == DevelopmentActionStatusEnum.COMPLETED);
        if (!requiredActionsCompleted) {
            return false;
        }
        Set<UUID> evidencedActions = entity.getEvidences().stream()
                .map(DevelopmentPlanEvidence::getActionId)
                .filter(actionId -> actionId != null)
                .collect(Collectors.toSet());
        return actions.stream()
                .filter(action -> Boolean.TRUE.equals(action.getEvidenceRequired()))
                .allMatch(action -> action.getId() != null && evidencedActions.contains(action.getId()));
    }
}