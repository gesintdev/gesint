package br.com.gesint.modules.rh.person.jobrequisition.service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneId;
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
import br.com.gesint.modules.dp.organization.department.repository.DepartmentRepository;
import br.com.gesint.modules.dp.organization.jobposition.repository.JobPositionRepository;
import br.com.gesint.modules.rh.person.jobrequisition.dto.JobRequisitionRejectRequestDto;
import br.com.gesint.modules.rh.person.jobrequisition.dto.JobRequisitionRequestDto;
import br.com.gesint.modules.rh.person.jobrequisition.dto.JobRequisitionResponseDto;
import br.com.gesint.modules.rh.person.jobrequisition.entity.JobRequisition;
import br.com.gesint.modules.rh.person.jobrequisition.entity.JobRequisitionReasonEnum;
import br.com.gesint.modules.rh.person.jobrequisition.entity.JobRequisitionStatusEnum;
import br.com.gesint.modules.rh.person.jobrequisition.exception.JobRequisitionException;
import br.com.gesint.modules.rh.person.jobrequisition.mapper.JobRequisitionMapper;
import br.com.gesint.modules.rh.person.jobrequisition.repository.JobRequisitionRepository;
import br.com.gesint.modules.rh.person.jobvacancy.entity.JobVacancy;
import br.com.gesint.modules.rh.person.jobvacancy.repository.JobVacancyRepository;
import br.com.gesint.modules.root.repository.AppUserRepository;

@Service
public class JobRequisitionService
        extends BaseService<JobRequisition, JobRequisitionRequestDto, JobRequisitionResponseDto>
        implements IJobRequisitionService {
    private static final ZoneId ZONE = ZoneId.of("America/Sao_Paulo");
    static final String APPROVE_MANAGER = "jobrequisition:approvemanager";
    static final String APPROVE_HR = "jobrequisition:approvehr";
    static final String APPROVE_DIRECTOR = "jobrequisition:approvedirector";

    private final JobRequisitionRepository repository;
    private final JobRequisitionMapper mapper;
    private final JobRequisitionSnapshotResolver snapshotResolver;
    private final JobVacancyRepository jobVacancyRepository;
    private final JobPositionRepository jobPositionRepository;
    private final DepartmentRepository departmentRepository;
    private final AppUserRepository appUserRepository;

    public JobRequisitionService(
            JobRequisitionRepository repository,
            JobRequisitionMapper mapper,
            JobRequisitionSnapshotResolver snapshotResolver,
            JobVacancyRepository jobVacancyRepository,
            JobPositionRepository jobPositionRepository,
            DepartmentRepository departmentRepository,
            AppUserRepository appUserRepository) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.snapshotResolver = snapshotResolver;
        this.jobVacancyRepository = jobVacancyRepository;
        this.jobPositionRepository = jobPositionRepository;
        this.departmentRepository = departmentRepository;
        this.appUserRepository = appUserRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobrequisition:read')")
    public List<JobRequisitionResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobrequisition:read')")
    public List<JobRequisitionResponseDto> findAll(StatusEnum status) {
        return super.findAll(status);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobrequisition:read')")
    public JobRequisitionResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('jobrequisition:read')")
    public PageableResponseDto<JobRequisitionResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobrequisition:write')")
    public JobRequisitionResponseDto create(JobRequisitionRequestDto request) {
        JobRequisition entity = mapper.toEntity(request);
        entity.setStatus(StatusEnum.ACTIVE);
        entity.setRequisitionStatus(JobRequisitionStatusEnum.DRAFT);
        snapshotResolver.apply(entity);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobrequisition:write')")
    public JobRequisitionResponseDto update(UUID id, JobRequisitionRequestDto request) {
        JobRequisition entity = findEntity(id);
        if (entity.getRequisitionStatus() != JobRequisitionStatusEnum.DRAFT) {
            throw JobRequisitionException.notEditable();
        }
        mapper.updateEntity(entity, request);
        snapshotResolver.apply(entity);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobrequisition:write')")
    public JobRequisitionResponseDto submitForApproval(UUID id) {
        JobRequisition entity = findEntity(id);
        if (entity.getRequisitionStatus() != JobRequisitionStatusEnum.DRAFT) {
            throw JobRequisitionException.invalidStatus();
        }
        snapshotResolver.apply(entity);
        validateForSubmit(entity);
        entity.setRequisitionStatus(JobRequisitionStatusEnum.PENDING_MANAGER);
        entity.setSubmittedAt(now());
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyAuthority('" + APPROVE_MANAGER + "', '" + APPROVE_HR + "', '" + APPROVE_DIRECTOR + "')")
    public JobRequisitionResponseDto approve(UUID id) {
        JobRequisition entity = findEntity(id);
        JobRequisitionStatusEnum stage = entity.getRequisitionStatus();
        requireStageAuthority(stage);
        UUID userId = currentUserIdOrNull();
        String userName = userName(userId);
        OffsetDateTime at = now();
        switch (stage) {
            case PENDING_MANAGER -> {
                entity.setManagerApprovedBy(userId);
                entity.setManagerApprovedByName(userName);
                entity.setManagerApprovedAt(at);
                entity.setRequisitionStatus(JobRequisitionStatusEnum.PENDING_HR);
            }
            case PENDING_HR -> {
                entity.setHrApprovedBy(userId);
                entity.setHrApprovedByName(userName);
                entity.setHrApprovedAt(at);
                if (Boolean.TRUE.equals(entity.getOutOfBand())) {
                    entity.setRequisitionStatus(JobRequisitionStatusEnum.PENDING_DIRECTOR);
                } else {
                    completeApproval(entity);
                }
            }
            case PENDING_DIRECTOR -> {
                entity.setDirectorApprovedBy(userId);
                entity.setDirectorApprovedByName(userName);
                entity.setDirectorApprovedAt(at);
                completeApproval(entity);
            }
            default -> throw JobRequisitionException.invalidStatus();
        }
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyAuthority('" + APPROVE_MANAGER + "', '" + APPROVE_HR + "', '" + APPROVE_DIRECTOR + "')")
    public JobRequisitionResponseDto reject(UUID id, JobRequisitionRejectRequestDto request) {
        JobRequisition entity = findEntity(id);
        JobRequisitionStatusEnum stage = entity.getRequisitionStatus();
        requireStageAuthority(stage);
        String reason = request != null && request.getReason() != null ? request.getReason().trim() : "";
        if (reason.isEmpty()) {
            throw JobRequisitionException.rejectionReasonRequired();
        }
        UUID userId = currentUserIdOrNull();
        entity.setRejectedBy(userId);
        entity.setRejectedByName(userName(userId));
        entity.setRejectedAt(now());
        entity.setRejectedStage(stage);
        entity.setRejectionReason(reason);
        entity.setRequisitionStatus(JobRequisitionStatusEnum.REJECTED);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobrequisition:write')")
    public JobRequisitionResponseDto cancel(UUID id) {
        JobRequisition entity = findEntity(id);
        JobRequisitionStatusEnum current = entity.getRequisitionStatus();
        if (current != JobRequisitionStatusEnum.DRAFT && !current.isPending()) {
            throw JobRequisitionException.invalidStatus();
        }
        entity.setRequisitionStatus(JobRequisitionStatusEnum.CANCELED);
        entity.setCanceledAt(now());
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobrequisition:write')")
    public void activate(UUID id) {
        super.activate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobrequisition:write')")
    public void deactivate(UUID id) {
        super.deactivate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('jobrequisition:delete')")
    public void delete(UUID id) {
        if (findEntity(id).getRequisitionStatus() == JobRequisitionStatusEnum.APPROVED) {
            throw JobRequisitionException.deleteBlocked();
        }
        super.delete(id);
    }

    @Override
    protected JobRequisition findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(JobRequisitionException::notFound);
    }

    @Override
    protected void updateEntity(JobRequisition entity, JobRequisitionRequestDto request) {
        mapper.updateEntity(entity, request);
        snapshotResolver.apply(entity);
    }

    private static void validateForSubmit(JobRequisition entity) {
        if (entity.getSalaryLevel() == null
                || entity.getContractType() == null
                || entity.getProposedSalary() == null
                || entity.getProposedSalary().compareTo(BigDecimal.ZERO) <= 0) {
            throw JobRequisitionException.submitIncomplete();
        }
        if (entity.getReason() == JobRequisitionReasonEnum.REPLACEMENT && entity.getOffboardingId() == null) {
            throw JobRequisitionException.offboardingRequired();
        }
        if (Boolean.TRUE.equals(entity.getOutOfBand())
                && (entity.getJustification() == null || entity.getJustification().isBlank())) {
            throw JobRequisitionException.justificationRequired();
        }
    }

    private void completeApproval(JobRequisition entity) {
        entity.setRequisitionStatus(JobRequisitionStatusEnum.APPROVED);
        JobVacancy vacancy = JobVacancy.builder()
                .jobPositionId(entity.getJobPositionId())
                .jobTitle(entity.getJobPositionTitle() != null ? entity.getJobPositionTitle() : "")
                .positionsCount(entity.getPositionsCount())
                .contractType(entity.getContractType())
                .salary(entity.getProposedSalary())
                .expectedCompletionDate(entity.getDesiredStartDate())
                .department(departmentName(entity.getJobPositionId()))
                .isPublic(false)
                .build();
        vacancy.setStatus(StatusEnum.ACTIVE);
        vacancy.setCompanyId(entity.getCompanyId());
        entity.setJobVacancyId(jobVacancyRepository.save(vacancy).getId());
    }

    private String departmentName(UUID jobPositionId) {
        return jobPositionRepository
                .findByIdAndStatusNot(jobPositionId, StatusEnum.DELETED)
                .map(jobPosition -> jobPosition.getDepartmentId())
                .flatMap(departmentId -> departmentRepository.findByIdAndStatusNot(departmentId, StatusEnum.DELETED))
                .map(department -> department.getName())
                .orElse(null);
    }

    private static void requireStageAuthority(JobRequisitionStatusEnum stage) {
        String required = switch (stage) {
            case PENDING_MANAGER -> APPROVE_MANAGER;
            case PENDING_HR -> APPROVE_HR;
            case PENDING_DIRECTOR -> APPROVE_DIRECTOR;
            default -> throw JobRequisitionException.invalidStatus();
        };
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !AuthorityWildcards.allows(authentication.getAuthorities(), required)) {
            throw JobRequisitionException.stageNotAllowed();
        }
    }

    private static UUID currentUserIdOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UUID userId)) {
            return null;
        }
        return userId;
    }

    private String userName(UUID userId) {
        if (userId == null) {
            return null;
        }
        return appUserRepository.findById(userId).map(user -> user.getName()).orElse(null);
    }

    private static OffsetDateTime now() {
        return OffsetDateTime.now(ZONE);
    }
}
