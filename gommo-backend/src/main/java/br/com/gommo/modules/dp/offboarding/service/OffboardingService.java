package br.com.gommo.modules.dp.offboarding.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.audit.trail.AuditActionEnum;
import br.com.gommo.core.audit.trail.AuditTrailEntry;
import br.com.gommo.core.audit.trail.AuditTrailRecorder;
import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.mail.EmailMessage;
import br.com.gommo.core.mail.EmailSendResult;
import br.com.gommo.core.mail.EmailSendStatusEnum;
import br.com.gommo.core.mail.EmailService;
import br.com.gommo.modules.dp.offboarding.domain.OffboardingNoticeCalculator;
import br.com.gommo.modules.dp.offboarding.dto.EsocialDismissalReasonDto;
import br.com.gommo.modules.dp.offboarding.dto.OffboardingAccountantPackageDto;
import br.com.gommo.modules.dp.offboarding.dto.OffboardingChecklistItemDto;
import br.com.gommo.modules.dp.offboarding.dto.OffboardingDemissionalPreviewDto;
import br.com.gommo.modules.dp.offboarding.dto.OffboardingRequestDto;
import br.com.gommo.modules.dp.offboarding.dto.OffboardingResponseDto;
import br.com.gommo.modules.dp.offboarding.entity.AccountantPackageStatusEnum;
import br.com.gommo.modules.dp.offboarding.entity.DismissalTypeEnum;
import br.com.gommo.modules.dp.offboarding.entity.EsocialDismissalReason;
import br.com.gommo.modules.dp.offboarding.entity.Offboarding;
import br.com.gommo.modules.dp.offboarding.entity.OffboardingProcessStatusEnum;
import br.com.gommo.modules.dp.offboarding.exception.OffboardingException;
import br.com.gommo.modules.dp.offboarding.mapper.OffboardingMapper;
import br.com.gommo.modules.dp.offboarding.repository.EsocialDismissalReasonRepository;
import br.com.gommo.modules.dp.offboarding.repository.OffboardingRepository;
import br.com.gommo.modules.dp.occupationalexam.exam.domain.OccupationalExamComplianceRules;
import br.com.gommo.modules.dp.occupationalexam.exam.domain.OccupationalExamComplianceRules.DismissalWaiverDecision;
import br.com.gommo.modules.dp.occupationalexam.exam.entity.OccupationalExam;
import br.com.gommo.modules.dp.occupationalexam.exam.repository.OccupationalExamRepository;
import br.com.gommo.modules.dp.occupationalexam.exam.service.OccupationalExamTriggerService;
import br.com.gommo.modules.dp.organization.company.entity.Company;
import br.com.gommo.modules.dp.organization.company.repository.CompanyRepository;
import br.com.gommo.modules.rh.person.collaborators.people.entity.Collaborator;
import br.com.gommo.modules.rh.person.collaborators.people.exception.CollaboratorException;
import br.com.gommo.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gommo.modules.rh.person.contract.entity.EmploymentContract;
import br.com.gommo.modules.rh.person.contract.repository.EmploymentContractRepository;
import br.com.gommo.modules.rh.person.jobrequisition.service.JobRequisitionTriggerService;
import br.com.gommo.modules.root.entity.AppUser;
import br.com.gommo.modules.root.repository.AppUserRepository;
import br.com.gommo.modules.root.search.document.SearchDocumentType;
import br.com.gommo.modules.root.search.document.service.ISearchDocumentIndexer;
import br.com.gommo.modules.root.search.service.provider.CollaboratorGlobalSearchProvider;

@Service
public class OffboardingService extends BaseService<Offboarding, OffboardingRequestDto, OffboardingResponseDto>
        implements IOffboardingService {

    public static final String ACCESS_GESINT_KEY = "access_gesint";
    public static final String ACCESS_PDV_KEY = "access_pdv";

    private final OffboardingRepository repository;
    private final OffboardingMapper mapper;
    private final CollaboratorRepository collaboratorRepository;
    private final ISearchDocumentIndexer searchDocumentIndexer;
    private final OccupationalExamTriggerService occupationalExamTriggerService;
    private final OccupationalExamRepository occupationalExamRepository;
    private final EmploymentContractRepository employmentContractRepository;
    private final EsocialDismissalReasonRepository esocialDismissalReasonRepository;
    private final CompanyRepository companyRepository;
    private final AppUserRepository appUserRepository;
    private final EmailService emailService;
    private final AuditTrailRecorder auditTrail;
    private final JobRequisitionTriggerService jobRequisitionTriggerService;

    public OffboardingService(
            OffboardingRepository repository,
            OffboardingMapper mapper,
            CollaboratorRepository collaboratorRepository,
            ISearchDocumentIndexer searchDocumentIndexer,
            OccupationalExamTriggerService occupationalExamTriggerService,
            OccupationalExamRepository occupationalExamRepository,
            EmploymentContractRepository employmentContractRepository,
            EsocialDismissalReasonRepository esocialDismissalReasonRepository,
            CompanyRepository companyRepository,
            AppUserRepository appUserRepository,
            EmailService emailService,
            AuditTrailRecorder auditTrail,
            JobRequisitionTriggerService jobRequisitionTriggerService) {
        super(repository, mapper::toResponse, mapper::toEntity);
        this.repository = repository;
        this.mapper = mapper;
        this.collaboratorRepository = collaboratorRepository;
        this.searchDocumentIndexer = searchDocumentIndexer;
        this.occupationalExamTriggerService = occupationalExamTriggerService;
        this.occupationalExamRepository = occupationalExamRepository;
        this.employmentContractRepository = employmentContractRepository;
        this.esocialDismissalReasonRepository = esocialDismissalReasonRepository;
        this.companyRepository = companyRepository;
        this.appUserRepository = appUserRepository;
        this.emailService = emailService;
        this.auditTrail = auditTrail;
        this.jobRequisitionTriggerService = jobRequisitionTriggerService;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('offboarding:read')")
    public List<OffboardingResponseDto> findAll() {
        return mapToResponses(repository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED));
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
        entity.setProcessStatus(OffboardingProcessStatusEnum.DRAFT);
        applyReasonAndNotice(entity, request);
        Offboarding saved = repository.save(entity);
        return toEnrichedResponse(saved);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('offboarding:write')")
    public OffboardingResponseDto update(UUID id, OffboardingRequestDto request) {
        Offboarding entity = findEntity(id);
        if (entity.getProcessStatus() == OffboardingProcessStatusEnum.COMPLETED) {
            throw OffboardingException.completedReadonly();
        }
        mapper.updateEntity(entity, request);
        applyReasonAndNotice(entity, request);
        return toEnrichedResponse(repository.save(entity));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('offboarding:read')")
    public List<EsocialDismissalReasonDto> listEsocialDismissalReasons() {
        return esocialDismissalReasonRepository
                .findAllByActiveTrueAndStatusNotOrderByReasonCodeAsc(StatusEnum.DELETED)
                .stream()
                .map(row -> EsocialDismissalReasonDto.builder()
                        .reasonCode(row.getReasonCode())
                        .description(row.getDescription())
                        .dismissalType(row.getDismissalType())
                        .label(row.getReasonCode() + " · " + row.getDescription())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('offboarding:read')")
    public OffboardingDemissionalPreviewDto demissionalPreview(UUID id) {
        Offboarding entity = findEntity(id);
        LocalDate reference = entity.getLastWorkDay() != null ? entity.getLastWorkDay() : entity.getDismissalDate();
        return buildDemissionalPreview(entity.getCollaboratorId(), reference, entity);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('offboarding:write')")
    public OffboardingResponseDto registerDemissionalWaiver(UUID id, String notes) {
        Offboarding entity = findEntity(id);
        if (entity.getProcessStatus() == OffboardingProcessStatusEnum.COMPLETED) {
            throw OffboardingException.completedReadonly();
        }
        entity.setDemissionalWaiverRegistered(true);
        entity.setDemissionalWaiverNotes(notes);
        return toEnrichedResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('offboarding:write')")
    public OffboardingResponseDto conclude(UUID id) {
        Offboarding entity = findEntity(id);
        if (entity.getProcessStatus() == OffboardingProcessStatusEnum.COMPLETED) {
            throw OffboardingException.alreadyCompleted();
        }
        if (entity.getEsocialDismissalReasonCode() == null || entity.getEsocialDismissalReasonCode().isBlank()) {
            throw OffboardingException.reasonRequired();
        }
        if (entity.getLastWorkDay() == null) {
            throw OffboardingException.lastWorkDayRequired();
        }

        applyReasonAndNotice(entity, null);

        entity.setProcessStatus(OffboardingProcessStatusEnum.COMPLETED);
        entity.setCompletedAt(OffsetDateTime.now());
        entity.setDismissalDate(
                entity.getDismissalDate() != null ? entity.getDismissalDate() : entity.getLastWorkDay());
        Offboarding saved = repository.save(entity);

        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.TERMINATE, saved)
                .detail("("
                        + (saved.getEsocialDismissalReasonCode() != null
                                ? saved.getEsocialDismissalReasonCode()
                                : dismissalTypeLabel(saved.getDismissalType()))
                        + ")")
                .reason(saved.getDismissalNotes()));

        markCollaboratorOffboarded(saved.getCollaboratorId());

        UUID jobPositionId = employmentContractRepository
                .findFirstByCollaboratorIdAndStatusNotOrderByStartDateDesc(
                        saved.getCollaboratorId(), StatusEnum.DELETED)
                .map(EmploymentContract::getJobPositionId)
                .orElse(null);
        occupationalExamTriggerService.onTermination(
                saved.getCollaboratorId(), jobPositionId, saved.getLastWorkDay(), 2);

        jobRequisitionTriggerService.onTermination(saved);
        revokeGesintAccessIfMarked(saved);
        prepareAccountantPackage(saved, false);

        return toEnrichedResponse(repository.save(saved));
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('offboarding:read')")
    public OffboardingAccountantPackageDto accountantPackagePreview(UUID id) {
        return buildAccountantPackage(findEntity(id));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('offboarding:write')")
    public OffboardingAccountantPackageDto sendAccountantPackage(UUID id) {
        Offboarding entity = findEntity(id);
        prepareAccountantPackage(entity, true);
        Offboarding saved = repository.save(entity);
        return buildAccountantPackage(saved);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('offboarding:read')")
    public List<OffboardingResponseDto> findAll(StatusEnum status) {
        return mapToResponses(repository.findAllByStatusOrderByCreatedAtDesc(resolveListStatus(status)));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('offboarding:write')")
    public void activate(UUID id) {
        super.activate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('offboarding:write')")
    public void deactivate(UUID id) {
        super.deactivate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('offboarding:delete')")
    public void delete(UUID id) {
        Offboarding entity = findEntity(id);
        UUID collaboratorId = entity.getCollaboratorId();
        boolean wasCompleted = entity.getProcessStatus() == OffboardingProcessStatusEnum.COMPLETED;
        super.delete(id);
        if (wasCompleted) {
            restoreCollaboratorIfNoOffboarding(collaboratorId, null);
        }
    }

    @Override
    protected Offboarding findEntity(UUID id) {
        return repository.findByIdAndStatusNot(id, StatusEnum.DELETED).orElseThrow(OffboardingException::notFound);
    }

    @Override
    protected void updateEntity(Offboarding entity, OffboardingRequestDto request) {
        mapper.updateEntity(entity, request);
    }

    private void applyReasonAndNotice(Offboarding entity, OffboardingRequestDto request) {
        String reasonCode = entity.getEsocialDismissalReasonCode();
        if (reasonCode != null && !reasonCode.isBlank()) {
            EsocialDismissalReason reason = esocialDismissalReasonRepository
                    .findByReasonCodeAndStatusNot(reasonCode.trim(), StatusEnum.DELETED)
                    .orElseThrow(OffboardingException::reasonInvalid);
            entity.setEsocialDismissalReasonCode(reason.getReasonCode());
            entity.setEsocialDismissalReasonLabel(reason.getDescription());
            try {
                entity.setDismissalType(DismissalTypeEnum.valueOf(reason.getDismissalType()));
            } catch (Exception ignored) {
                entity.setDismissalType(DismissalTypeEnum.OTHER);
            }
        } else if (entity.getDismissalType() != null) {
            // Compat: tipo legado sem motivo eSocial ainda no draft.
            mapLegacyTypeToReason(entity);
        }

        LocalDate lastWorkDay =
                entity.getLastWorkDay() != null ? entity.getLastWorkDay() : entity.getDismissalDate();
        entity.setLastWorkDay(lastWorkDay);
        if (entity.getDismissalDate() == null) {
            entity.setDismissalDate(lastWorkDay);
        }

        LocalDate contractStart = employmentContractRepository
                .findFirstByCollaboratorIdAndStatusNotOrderByStartDateDesc(
                        entity.getCollaboratorId(), StatusEnum.DELETED)
                .map(EmploymentContract::getStartDate)
                .orElse(null);

        var notice = OffboardingNoticeCalculator.compute(
                entity.getDismissalType(),
                request != null ? request.getNoticeType() : entity.getNoticeType(),
                lastWorkDay,
                contractStart);
        entity.setNoticeType(notice.noticeType());
        entity.setNoticeDays(notice.noticeDays());
        entity.setNoticeStartDate(notice.noticeStartDate());
        entity.setNoticeEndDate(notice.noticeEndDate());
        entity.setWorkloadReductionApplicable(notice.workloadReductionApplicable());
    }

    private void mapLegacyTypeToReason(Offboarding entity) {
        String code =
                switch (entity.getDismissalType()) {
                    case WITH_CAUSE -> "01";
                    case WITHOUT_CAUSE -> "02";
                    case RESIGNATION -> "07";
                    case AGREEMENT -> "08";
                    case END_OF_CONTRACT -> "09";
                    case OTHER -> "07";
                };
        esocialDismissalReasonRepository
                .findByReasonCodeAndStatusNot(code, StatusEnum.DELETED)
                .ifPresent(reason -> {
                    entity.setEsocialDismissalReasonCode(reason.getReasonCode());
                    entity.setEsocialDismissalReasonLabel(reason.getDescription());
                });
    }

    private OffboardingDemissionalPreviewDto buildDemissionalPreview(
            UUID collaboratorId, LocalDate dismissalDate, Offboarding entity) {
        int riskGrade = 2;
        LocalDate lastClinical = occupationalExamRepository
                .findByCollaboratorIdAndStatusNotOrderByClinicalExamDateDesc(collaboratorId, StatusEnum.DELETED)
                .stream()
                .filter(exam -> exam.getClinicalExamDate() != null)
                .filter(exam -> exam.getResult() != null)
                .findFirst()
                .map(OccupationalExam::getClinicalExamDate)
                .orElse(null);
        DismissalWaiverDecision decision = OccupationalExamComplianceRules.evaluateDismissalWaiver(
                lastClinical, dismissalDate, riskGrade, false);
        Integer daysSince = null;
        if (lastClinical != null && dismissalDate != null) {
            daysSince = (int) Math.max(0, ChronoUnit.DAYS.between(lastClinical, dismissalDate));
        }
        int window = riskGrade >= 3
                ? OccupationalExamComplianceRules.WAIVER_DAYS_RISK_3_4
                : OccupationalExamComplianceRules.WAIVER_DAYS_RISK_1_2;
        String message = decision.reason();
        if (decision.waived() && daysSince != null) {
            message = "Dispensável: o último exame foi há "
                    + daysSince
                    + " dias, dentro do limite de "
                    + window
                    + " dias para o grau de risco "
                    + riskGrade
                    + " (NR-7).";
        }
        return OffboardingDemissionalPreviewDto.builder()
                .waived(decision.waived())
                .required(!decision.waived())
                .message(message)
                .lastClinicalExamDate(lastClinical)
                .daysSinceLastExam(daysSince)
                .riskGrade(riskGrade)
                .waiverWindowDays(window)
                .dueDate(OccupationalExamComplianceRules.dismissalExamDueDate(dismissalDate))
                .waiverRegistered(entity != null && entity.isDemissionalWaiverRegistered())
                .waiverNotes(entity != null ? entity.getDemissionalWaiverNotes() : null)
                .build();
    }

    private void revokeGesintAccessIfMarked(Offboarding entity) {
        List<OffboardingChecklistItemDto> items =
                entity.getExitChecklist() != null ? entity.getExitChecklist() : List.of();
        boolean revoke = items.stream()
                .anyMatch(item -> ACCESS_GESINT_KEY.equalsIgnoreCase(item.getKey())
                        && item.getStatus() != null
                        && !"PENDING".equalsIgnoreCase(item.getStatus()));
        if (!revoke) {
            return;
        }
        appUserRepository
                .findFirstByCollaboratorIdAndStatusNot(entity.getCollaboratorId(), StatusEnum.DELETED)
                .ifPresent(user -> {
                    user.setStatus(StatusEnum.INACTIVE);
                    appUserRepository.save(user);
                });
    }

    private void prepareAccountantPackage(Offboarding entity, boolean sendEmail) {
        OffboardingAccountantPackageDto pack = buildAccountantPackage(entity);
        entity.setAccountantPackageDetail(pack.getSummaryText());
        if (!sendEmail) {
            if (entity.getAccountantPackageStatus() == null
                    || entity.getAccountantPackageStatus() == AccountantPackageStatusEnum.PENDING) {
                entity.setAccountantPackageStatus(AccountantPackageStatusEnum.READY);
            }
            return;
        }
        String to = pack.getAccountantEmail();
        if (to == null || to.isBlank()) {
            entity.setAccountantPackageStatus(AccountantPackageStatusEnum.READY);
            entity.setAccountantPackageDetail(
                    (pack.getSummaryText() != null ? pack.getSummaryText() : "")
                            + "\n\nE-mail do contador não configurado na empresa.");
            return;
        }
        EmailSendResult result = emailService.send(EmailMessage.text(
                to,
                "Pacote de desligamento #" + entity.getCode() + " — " + pack.getCollaboratorName(),
                pack.getSummaryText()));
        if (result.status() == EmailSendStatusEnum.SENT) {
            entity.setAccountantPackageStatus(AccountantPackageStatusEnum.SENT);
            entity.setAccountantPackageSentAt(OffsetDateTime.now());
            entity.setAccountantPackageDetail(pack.getSummaryText() + "\n\nEnviado para " + to);
        } else if (result.status() == EmailSendStatusEnum.NOT_CONFIGURED) {
            entity.setAccountantPackageStatus(AccountantPackageStatusEnum.READY);
            entity.setAccountantPackageDetail(
                    pack.getSummaryText() + "\n\nEnvio de e-mail não configurado. Pacote pronto para o contador.");
        } else {
            entity.setAccountantPackageStatus(AccountantPackageStatusEnum.FAILED);
            entity.setAccountantPackageDetail(
                    pack.getSummaryText() + "\n\nFalha no envio: " + result.detail());
        }
    }

    private OffboardingAccountantPackageDto buildAccountantPackage(Offboarding entity) {
        Collaborator collaborator = collaboratorRepository
                .findByIdAndStatusNot(entity.getCollaboratorId(), StatusEnum.DELETED)
                .orElse(null);
        Company company = null;
        if (collaborator != null && collaborator.getCompanyId() != null) {
            company = companyRepository
                    .findByIdAndStatusNot(collaborator.getCompanyId(), StatusEnum.DELETED)
                    .orElse(null);
        }
        StringBuilder summary = new StringBuilder();
        summary.append("PACOTE DE DESLIGAMENTO (Gesint → Contador)\n");
        summary.append("========================================\n");
        summary.append("Código: ").append(entity.getCode()).append('\n');
        summary.append("Colaborador: ")
                .append(collaborator != null ? collaborator.getFullName() : entity.getCollaboratorId())
                .append('\n');
        summary.append("CPF: ")
                .append(collaborator != null ? collaborator.getCpf() : "—")
                .append('\n');
        summary.append("Motivo eSocial: ")
                .append(entity.getEsocialDismissalReasonCode() != null ? entity.getEsocialDismissalReasonCode() : "—")
                .append(" · ")
                .append(
                        entity.getEsocialDismissalReasonLabel() != null
                                ? entity.getEsocialDismissalReasonLabel()
                                : "—")
                .append('\n');
        summary.append("Último dia trabalhado: ")
                .append(entity.getLastWorkDay() != null ? entity.getLastWorkDay() : "—")
                .append('\n');
        summary.append("Data do desligamento: ")
                .append(entity.getDismissalDate() != null ? entity.getDismissalDate() : "—")
                .append('\n');
        summary.append("Aviso prévio: ")
                .append(entity.getNoticeType() != null ? entity.getNoticeType().name() : "—")
                .append(" / ")
                .append(entity.getNoticeDays() != null ? entity.getNoticeDays() + " dias" : "—")
                .append('\n');
        if (entity.getNoticeStartDate() != null || entity.getNoticeEndDate() != null) {
            summary.append("Período do aviso: ")
                    .append(entity.getNoticeStartDate())
                    .append(" a ")
                    .append(entity.getNoticeEndDate())
                    .append('\n');
        }
        summary.append("Redução de jornada: ")
                .append(entity.isWorkloadReductionApplicable() ? "Sim" : "Não se aplica")
                .append('\n');
        summary.append("\nChecklist de saída:\n");
        List<OffboardingChecklistItemDto> checklist =
                entity.getExitChecklist() != null ? entity.getExitChecklist() : List.of();
        if (checklist.isEmpty()) {
            summary.append("  (sem itens)\n");
        } else {
            for (OffboardingChecklistItemDto item : checklist) {
                summary.append("  - [")
                        .append(item.getStatus() != null ? item.getStatus() : "PENDING")
                        .append("] ")
                        .append(item.getDescription() != null ? item.getDescription() : item.getKey())
                        .append('\n');
            }
        }
        summary.append("\nObservações: ")
                .append(entity.getDismissalNotes() != null ? entity.getDismissalNotes() : "—")
                .append('\n');
        summary.append("Homologação: ")
                .append(entity.getHomologationNotes() != null ? entity.getHomologationNotes() : "—")
                .append('\n');
        summary.append("\nCampos de apoio ao S-2299 (mtvDeslig=")
                .append(entity.getEsocialDismissalReasonCode() != null ? entity.getEsocialDismissalReasonCode() : "—")
                .append("). Transmissão eSocial fora deste pacote.\n");

        return OffboardingAccountantPackageDto.builder()
                .offboardingId(entity.getId())
                .offboardingCode(entity.getCode())
                .collaboratorId(entity.getCollaboratorId())
                .collaboratorName(collaborator != null ? collaborator.getFullName() : null)
                .collaboratorCpf(collaborator != null ? collaborator.getCpf() : null)
                .esocialDismissalReasonCode(entity.getEsocialDismissalReasonCode())
                .esocialDismissalReasonLabel(entity.getEsocialDismissalReasonLabel())
                .dismissalDate(entity.getDismissalDate())
                .lastWorkDay(entity.getLastWorkDay())
                .noticeType(entity.getNoticeType() != null ? entity.getNoticeType().name() : null)
                .noticeDays(entity.getNoticeDays())
                .noticeStartDate(entity.getNoticeStartDate())
                .noticeEndDate(entity.getNoticeEndDate())
                .accountantEmail(company != null ? company.getAccountantEmail() : null)
                .accountantName(company != null ? company.getAccountantName() : null)
                .packageStatus(
                        entity.getAccountantPackageStatus() != null
                                ? entity.getAccountantPackageStatus().name()
                                : AccountantPackageStatusEnum.PENDING.name())
                .packageSentAt(entity.getAccountantPackageSentAt())
                .packageDetail(entity.getAccountantPackageDetail())
                .checklist(checklist != null ? new ArrayList<>(checklist) : new ArrayList<>())
                .summaryText(summary.toString())
                .build();
    }

    private static String dismissalTypeLabel(DismissalTypeEnum type) {
        if (type == null) {
            return "tipo não informado";
        }
        return switch (type) {
            case WITHOUT_CAUSE -> "sem justa causa";
            case WITH_CAUSE -> "por justa causa";
            case RESIGNATION -> "pedido de demissão";
            case AGREEMENT -> "acordo";
            case END_OF_CONTRACT -> "término de contrato";
            case OTHER -> "outro";
        };
    }

    private List<OffboardingResponseDto> mapToResponses(List<Offboarding> entities) {
        Map<UUID, Collaborator> collaborators = loadCollaborators(entities);
        return entities.stream()
                .map(entity -> mapper.toResponse(entity, collaboratorName(entity, collaborators)))
                .toList();
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
        return collaborator != null && collaborator.getStatus() != StatusEnum.DELETED
                ? collaborator.getFullName()
                : null;
    }

    private void markCollaboratorOffboarded(UUID collaboratorId) {
        Collaborator collaborator = collaboratorRepository
                .findByIdAndStatusNot(collaboratorId, StatusEnum.DELETED)
                .orElseThrow(CollaboratorException::notFound);
        collaborator.setStatus(StatusEnum.INACTIVE);
        collaboratorRepository.save(collaborator);
        searchDocumentIndexer.remove(SearchDocumentType.PERSON, collaboratorId);
    }

    private void restoreCollaboratorIfNoOffboarding(UUID collaboratorId, UUID exceptSameCollaboratorId) {
        if (collaboratorId == null || collaboratorId.equals(exceptSameCollaboratorId)) {
            return;
        }
        boolean stillOffboarded = repository.existsByCollaboratorIdAndProcessStatusAndStatusNot(
                collaboratorId, OffboardingProcessStatusEnum.COMPLETED, StatusEnum.DELETED);
        if (stillOffboarded) {
            return;
        }
        Collaborator collaborator = collaboratorRepository
                .findByIdAndStatusNot(collaboratorId, StatusEnum.DELETED)
                .orElse(null);
        if (collaborator != null) {
            collaborator.setStatus(StatusEnum.ACTIVE);
            collaboratorRepository.save(collaborator);
            String displayName = collaborator.getSocialName() != null && !collaborator.getSocialName().isBlank()
                    ? collaborator.getSocialName()
                    : collaborator.getFullName();
            String searchText = collaborator.getFullName()
                    + (collaborator.getSocialName() != null ? " " + collaborator.getSocialName() : "")
                    + (collaborator.getCpf() != null ? " " + collaborator.getCpf() : "");
            searchDocumentIndexer.upsert(
                    SearchDocumentType.PERSON,
                    collaborator.getId(),
                    collaborator.getCompanyId(),
                    displayName,
                    CollaboratorGlobalSearchProvider.formatCpfLabel(collaborator.getCpf()),
                    searchText,
                    CollaboratorGlobalSearchProvider.HREF);
        }
    }
}
