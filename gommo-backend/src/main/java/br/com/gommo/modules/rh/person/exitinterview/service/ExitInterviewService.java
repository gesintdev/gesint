package br.com.gommo.modules.rh.person.exitinterview.service;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.organization.company.repository.CompanyRepository;
import br.com.gommo.modules.dp.organization.department.entity.Department;
import br.com.gommo.modules.dp.organization.department.repository.DepartmentRepository;
import br.com.gommo.modules.dp.organization.jobposition.entity.JobPosition;
import br.com.gommo.modules.dp.organization.jobposition.repository.JobPositionRepository;
import br.com.gommo.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gommo.modules.rh.person.contract.entity.ContractTypeEnum;
import br.com.gommo.modules.rh.person.contract.entity.EmploymentContract;
import br.com.gommo.modules.rh.person.contract.repository.EmploymentContractRepository;
import br.com.gommo.modules.rh.person.exitinterview.dto.ExitInterviewCancelRequestDto;
import br.com.gommo.modules.rh.person.exitinterview.dto.ExitInterviewRequestDto;
import br.com.gommo.modules.rh.person.exitinterview.dto.ExitInterviewResponseDto;
import br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterview;
import br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterviewRelationshipTypeEnum;
import br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterviewStatusEnum;
import br.com.gommo.modules.rh.person.exitinterview.exception.ExitInterviewException;
import br.com.gommo.modules.rh.person.exitinterview.mapper.ExitInterviewMapper;
import br.com.gommo.modules.rh.person.exitinterview.repository.ExitInterviewRepository;

@Service
public class ExitInterviewService extends BaseService<ExitInterview, ExitInterviewRequestDto, ExitInterviewResponseDto>
        implements IExitInterviewService {
    private final ExitInterviewRepository repository;
    private final ExitInterviewMapper mapper;
    private final CollaboratorRepository collaboratorRepository;
    private final EmploymentContractRepository contractRepository;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final JobPositionRepository jobPositionRepository;

    public ExitInterviewService(
            ExitInterviewRepository repository,
            ExitInterviewMapper mapper,
            CollaboratorRepository collaboratorRepository,
            EmploymentContractRepository contractRepository,
            CompanyRepository companyRepository,
            DepartmentRepository departmentRepository,
            JobPositionRepository jobPositionRepository) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.collaboratorRepository = collaboratorRepository;
        this.contractRepository = contractRepository;
        this.companyRepository = companyRepository;
        this.departmentRepository = departmentRepository;
        this.jobPositionRepository = jobPositionRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('exitinterview:read')")
    public List<ExitInterviewResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('exitinterview:read')")
    public ExitInterviewResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('exitinterview:read')")
    public PageableResponseDto<ExitInterviewResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('exitinterview:write')")
    public ExitInterviewResponseDto create(ExitInterviewRequestDto request) {
        ExitInterview entity = mapper.toEntity(request);
        entity.setStatus(StatusEnum.ACTIVE);
        applyDefaults(entity);
        applySnapshotDefaults(entity);
        validateForSave(entity);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('exitinterview:write')")
    public ExitInterviewResponseDto update(UUID id, ExitInterviewRequestDto request) {
        ExitInterview entity = findEntity(id);
        assertEditable(entity);
        mapper.updateEntity(entity, request);
        applyDefaults(entity);
        applySnapshotDefaults(entity);
        validateForSave(entity);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('exitinterview:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('exitinterview:complete')")
    public ExitInterviewResponseDto complete(UUID id) {
        ExitInterview entity = findEntity(id);
        assertEditable(entity);
        validateForCompletion(entity);
        entity.setInterviewStatus(ExitInterviewStatusEnum.COMPLETED);
        entity.setCompletedAt(OffsetDateTime.now());
        entity.setCanceledAt(null);
        entity.setCancelReason(null);
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('exitinterview:cancel')")
    public ExitInterviewResponseDto cancel(UUID id, ExitInterviewCancelRequestDto request) {
        ExitInterview entity = findEntity(id);
        if (entity.getInterviewStatus() == ExitInterviewStatusEnum.COMPLETED) {
            throw ExitInterviewException.invalidStatus();
        }
        entity.setInterviewStatus(ExitInterviewStatusEnum.CANCELED);
        entity.setCanceledAt(OffsetDateTime.now());
        entity.setCancelReason(request == null ? null : request.getReason());
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    protected ExitInterview findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(ExitInterviewException::notFound);
    }

    @Override
    protected void updateEntity(ExitInterview entity, ExitInterviewRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private void applyDefaults(ExitInterview entity) {
        if (entity.getInterviewStatus() == null) {
            entity.setInterviewStatus(ExitInterviewStatusEnum.DRAFT);
        }
        if (entity.getRelationshipType() == null) {
            entity.setRelationshipType(ExitInterviewRelationshipTypeEnum.CLT);
        }
        if (entity.getSecondaryReasons() == null) {
            entity.setSecondaryReasons(List.of());
        }
        if (entity.getRatings() == null) {
            entity.setRatings(List.of());
        }
        if (entity.getOpenAnswers() == null) {
            entity.setOpenAnswers(List.of());
        }
        if (entity.getReturnChecklist() == null) {
            entity.setReturnChecklist(List.of());
        }
        if (entity.getTemplatePayload() == null) {
            entity.setTemplatePayload(java.util.Map.of());
        }
        calculateTenure(entity);
    }

    private void applySnapshotDefaults(ExitInterview entity) {
        collaboratorRepository.findByIdAndStatusNot(entity.getCollaboratorId(), StatusEnum.DELETED).ifPresent(c -> {
            if (isBlank(entity.getCollaboratorName())) {
                entity.setCollaboratorName(c.getSocialName() != null && !c.getSocialName().isBlank()
                        ? c.getSocialName()
                        : c.getFullName());
            }
        });

        contractRepository
                .findFirstByCollaboratorIdAndStatusNotOrderByStartDateDesc(entity.getCollaboratorId(), StatusEnum.DELETED)
                .ifPresent(contract -> enrichFromContract(entity, contract));
    }

    private void enrichFromContract(ExitInterview entity, EmploymentContract contract) {
        if (contract.getContractType() == ContractTypeEnum.PJ) {
            entity.setRelationshipType(ExitInterviewRelationshipTypeEnum.PJ);
        } else if (contract.getContractType() == ContractTypeEnum.CLT && entity.getRelationshipType() == null) {
            entity.setRelationshipType(ExitInterviewRelationshipTypeEnum.CLT);
        }
        if (entity.getAdmissionOrContractStartDate() == null) {
            entity.setAdmissionOrContractStartDate(contract.getStartDate());
        }
        if (entity.getTerminationOrContractEndDate() == null) {
            entity.setTerminationOrContractEndDate(contract.getEndDate());
        }
        if (isBlank(entity.getCompanyName()) && contract.getCompanyId() != null) {
            companyRepository.findByIdAndStatusNot(contract.getCompanyId(), StatusEnum.DELETED).ifPresent(company -> {
                entity.setCompanyName(!isBlank(company.getTradeName()) ? company.getTradeName() : company.getLegalName());
            });
        }
        if (contract.getJobPositionId() != null) {
            jobPositionRepository
                    .findByIdAndStatusNot(contract.getJobPositionId(), StatusEnum.DELETED)
                    .ifPresent(job -> enrichFromJobPosition(entity, job));
        }
        calculateTenure(entity);
    }

    private void enrichFromJobPosition(ExitInterview entity, JobPosition job) {
        if (isBlank(entity.getJobPositionName())) {
            entity.setJobPositionName(job.getTitle());
        }
        if (job.getDepartmentId() == null) {
            return;
        }
        departmentRepository.findByIdAndStatusNot(job.getDepartmentId(), StatusEnum.DELETED).ifPresent(department -> {
            if (isBlank(entity.getDepartmentName())) {
                entity.setDepartmentName(department.getName());
            }
            if (isBlank(entity.getManagerName())) {
                resolveDepartmentManagerName(department).ifPresent(entity::setManagerName);
            }
        });
    }

    private java.util.Optional<String> resolveDepartmentManagerName(Department department) {
        if (department.getResponsibleCollaboratorIds() == null || department.getResponsibleCollaboratorIds().isEmpty()) {
            return java.util.Optional.empty();
        }
        return department.getResponsibleCollaboratorIds().stream()
                .filter(Objects::nonNull)
                .findFirst()
                .flatMap(id -> collaboratorRepository.findByIdAndStatusNot(id, StatusEnum.DELETED))
                .map(c -> !isBlank(c.getSocialName()) ? c.getSocialName() : c.getFullName());
    }

    private void validateForSave(ExitInterview entity) {
        if (entity.getInterviewStatus() == ExitInterviewStatusEnum.COMPLETED
                || entity.getInterviewStatus() == ExitInterviewStatusEnum.CANCELED) {
            throw ExitInterviewException.invalidStatus();
        }
        assertTerminationTypeMatchesRelationship(entity);
    }

    private void validateForCompletion(ExitInterview entity) {
        assertTerminationTypeMatchesRelationship(entity);
        boolean hasExitReason = entity.getMainReason() != null || !isBlank(entity.getDetailedReason());
        boolean hasRequiredDates = entity.getInterviewDate() != null
                && entity.getTerminationOrContractEndDate() != null
                && (entity.getAdmissionOrContractStartDate() == null
                        || !entity.getTerminationOrContractEndDate().isBefore(entity.getAdmissionOrContractStartDate()));
        if (entity.getCollaboratorId() == null
                || entity.getRelationshipType() == null
                || !hasRequiredDates
                || entity.getTerminationType() == null
                || isBlank(entity.getInterviewerName())
                || !hasExitReason) {
            throw ExitInterviewException.completionRequired();
        }
    }

    private void assertEditable(ExitInterview entity) {
        if (entity.getInterviewStatus() == ExitInterviewStatusEnum.COMPLETED
                || entity.getInterviewStatus() == ExitInterviewStatusEnum.CANCELED) {
            throw ExitInterviewException.notEditable();
        }
    }

    private void assertTerminationTypeMatchesRelationship(ExitInterview entity) {
        if (entity.getTerminationType() == null || entity.getRelationshipType() == null) {
            return;
        }
        String prefix = entity.getRelationshipType() == ExitInterviewRelationshipTypeEnum.PJ ? "PJ_" : "CLT_";
        if (!entity.getTerminationType().name().startsWith(prefix)) {
            throw ExitInterviewException.relationshipMismatch();
        }
    }

    private void calculateTenure(ExitInterview entity) {
        if (entity.getAdmissionOrContractStartDate() == null || entity.getTerminationOrContractEndDate() == null) {
            return;
        }
        if (entity.getTerminationOrContractEndDate().isBefore(entity.getAdmissionOrContractStartDate())) {
            entity.setTenureDays(null);
            return;
        }
        entity.setTenureDays(
                (int) ChronoUnit.DAYS.between(entity.getAdmissionOrContractStartDate(), entity.getTerminationOrContractEndDate()));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}