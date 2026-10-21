package br.com.gesint.modules.rh.person.jobvacancyapplication.service;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import br.com.gesint.core.audit.CurrentAuditor;
import br.com.gesint.core.audit.trail.AuditActionEnum;
import br.com.gesint.core.audit.trail.AuditTrailEntry;
import br.com.gesint.core.audit.trail.AuditTrailRecorder;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.offboarding.entity.DismissalTypeEnum;
import br.com.gesint.modules.dp.offboarding.entity.Offboarding;
import br.com.gesint.modules.dp.offboarding.repository.OffboardingRepository;
import br.com.gesint.modules.rh.person.admissionprocess.kanbancolumn.entity.AdmissionProcessKanbanColumn;
import br.com.gesint.modules.rh.person.admissionprocess.kanbancolumn.entity.KanbanColumnActionEnum;
import br.com.gesint.modules.rh.person.admissionprocess.kanbancolumn.repository.AdmissionProcessKanbanColumnRepository;
import br.com.gesint.modules.rh.person.candidate.entity.Candidate;
import br.com.gesint.modules.rh.person.candidate.repository.CandidateRepository;
import br.com.gesint.modules.rh.person.collaborators.admission.dto.AdmissionProcessRequestDto;
import br.com.gesint.modules.rh.person.collaborators.admission.dto.AdmissionProcessResponseDto;
import br.com.gesint.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gesint.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gesint.modules.rh.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gesint.modules.rh.person.collaborators.admission.service.AdmissionProcessService;
import br.com.gesint.modules.rh.person.collaborators.people.entity.Collaborator;
import br.com.gesint.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gesint.modules.rh.person.contract.entity.ContractTypeEnum;
import br.com.gesint.modules.rh.person.jobrequisition.entity.JobRequisition;
import br.com.gesint.modules.rh.person.jobrequisition.entity.JobRequisitionExperiencePeriodEnum;
import br.com.gesint.modules.rh.person.jobrequisition.repository.JobRequisitionRepository;
import br.com.gesint.modules.rh.person.jobvacancy.entity.JobVacancy;
import br.com.gesint.modules.rh.person.jobvacancy.entity.JobVacancyContractTypeEnum;
import br.com.gesint.modules.rh.person.jobvacancy.repository.JobVacancyRepository;
import br.com.gesint.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationHirePreviewDto;
import br.com.gesint.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationHireRequestDto;
import br.com.gesint.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationHireResponseDto;
import br.com.gesint.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationOfferRequestDto;
import br.com.gesint.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationOfferResponseDto;
import br.com.gesint.modules.rh.person.jobvacancyapplication.entity.AcceptanceChannelEnum;
import br.com.gesint.modules.rh.person.jobvacancyapplication.entity.CandidateAcceptanceEnum;
import br.com.gesint.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplication;
import br.com.gesint.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplicationRejectionReasonEnum;
import br.com.gesint.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplicationStatusEnum;
import br.com.gesint.modules.rh.person.jobvacancyapplication.entity.RejectionFeedbackStatusEnum;
import br.com.gesint.modules.rh.person.jobvacancyapplication.exception.JobVacancyApplicationException;
import br.com.gesint.modules.rh.person.jobvacancyapplication.repository.JobVacancyApplicationRepository;
import br.com.gesint.modules.root.entity.AppUser;
import br.com.gesint.modules.root.repository.AppUserRepository;

@Service
public class JobVacancyApplicationHireService {

    private static final int REHIRE_WARNING_DAYS = 90;
    private static final int PRE_ADMISSION_TOKEN_DAYS = 30;
    private static final DateTimeFormatter DATE_BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final JobVacancyApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final JobVacancyRepository jobVacancyRepository;
    private final AdmissionProcessKanbanColumnRepository kanbanColumnRepository;
    private final AdmissionProcessService admissionProcessService;
    private final AdmissionProcessRepository admissionProcessRepository;
    private final CollaboratorRepository collaboratorRepository;
    private final OffboardingRepository offboardingRepository;
    private final AppUserRepository appUserRepository;
    private final JobVacancyApplicationRejectionFeedbackService rejectionFeedbackService;
    private final AuditTrailRecorder auditTrail;
    private final JobRequisitionRepository jobRequisitionRepository;

    public JobVacancyApplicationHireService(
            JobVacancyApplicationRepository applicationRepository,
            CandidateRepository candidateRepository,
            JobVacancyRepository jobVacancyRepository,
            AdmissionProcessKanbanColumnRepository kanbanColumnRepository,
            AdmissionProcessService admissionProcessService,
            AdmissionProcessRepository admissionProcessRepository,
            CollaboratorRepository collaboratorRepository,
            OffboardingRepository offboardingRepository,
            AppUserRepository appUserRepository,
            JobVacancyApplicationRejectionFeedbackService rejectionFeedbackService,
            AuditTrailRecorder auditTrail,
            JobRequisitionRepository jobRequisitionRepository) {
        this.applicationRepository = applicationRepository;
        this.candidateRepository = candidateRepository;
        this.jobVacancyRepository = jobVacancyRepository;
        this.kanbanColumnRepository = kanbanColumnRepository;
        this.admissionProcessService = admissionProcessService;
        this.admissionProcessRepository = admissionProcessRepository;
        this.collaboratorRepository = collaboratorRepository;
        this.offboardingRepository = offboardingRepository;
        this.appUserRepository = appUserRepository;
        this.rejectionFeedbackService = rejectionFeedbackService;
        this.auditTrail = auditTrail;
        this.jobRequisitionRepository = jobRequisitionRepository;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyAuthority('jobvacancyapplication:read', 'admission:read')")
    public JobVacancyApplicationHirePreviewDto preview(UUID applicationId) {
        JobVacancyApplication application = requireApplication(applicationId);
        Candidate candidate = requireCandidate(application.getCandidateId());
        JobVacancy vacancy = requireVacancy(application.getJobVacancyId());

        int others = (int) applicationRepository
                .findByJobVacancyIdAndStatusNotOrderByAppliedAtDesc(
                        application.getJobVacancyId(), StatusEnum.DELETED)
                .stream()
                .filter(row -> !row.getId().equals(applicationId))
                .filter(row -> !row.isRejected())
                .filter(row -> row.getApplicationStatus() != JobVacancyApplicationStatusEnum.HIRED)
                .count();

        ContractTypeEnum suggestedContract = mapContractType(vacancy.getContractType());
        boolean portalAccepted = application.getCandidateAcceptance() == CandidateAcceptanceEnum.ACCEPTED
                && application.getAcceptanceChannel() == AcceptanceChannelEnum.PORTAL;
        boolean portalDeclined = application.getCandidateAcceptance() == CandidateAcceptanceEnum.DECLINED
                && application.getAcceptanceChannel() == AcceptanceChannelEnum.PORTAL;
        boolean offerPending = application.getApplicationStatus() == JobVacancyApplicationStatusEnum.OFFER
                && application.getCandidateAcceptance() == CandidateAcceptanceEnum.PENDING
                && application.getOfferSentAt() != null;

        ContractTypeEnum offerContract = parseContractType(application.getOfferContractType());
        if (offerContract != null) {
            suggestedContract = offerContract;
        }

        return JobVacancyApplicationHirePreviewDto.builder()
                .applicationId(application.getId())
                .candidateId(candidate.getId())
                .candidateFullName(candidate.getFullName())
                .candidateCpf(candidate.getCpf())
                .candidateEmail(candidate.getEmail())
                .candidatePhone(candidate.getPhone())
                .candidateBirthDate(
                        candidate.getBirthDate() != null ? candidate.getBirthDate().toString() : null)
                .jobVacancyId(vacancy.getId())
                .jobVacancyTitle(vacancy.getJobTitle())
                .jobPositionId(vacancy.getJobPositionId())
                .vacancyContractType(vacancy.getContractType())
                .suggestedContractType(suggestedContract)
                .suggestedExperiencePeriod(
                        application.getOfferExperiencePeriod() != null
                                ? parseExperiencePeriod(application.getOfferExperiencePeriod())
                                : resolveSuggestedExperiencePeriod(vacancy.getId(), suggestedContract))
                .suggestedSalary(
                        application.getOfferBaseSalary() != null
                                ? application.getOfferBaseSalary()
                                : vacancy.getSalary())
                .suggestedSalaryMax(vacancy.getSalaryMax())
                .vacancyWorkSchedule(vacancy.getWorkSchedule())
                .alreadyHired(application.getAdmissionProcessId() != null
                        || application.getApplicationStatus() == JobVacancyApplicationStatusEnum.HIRED)
                .admissionProcessId(application.getAdmissionProcessId())
                .rehireWarning(resolveRehireWarning(digitsOnly(candidate.getCpf())))
                .otherActiveApplicationsCount(others)
                .candidateAcceptance(application.getCandidateAcceptance())
                .acceptanceDate(application.getAcceptanceDate())
                .acceptanceChannel(application.getAcceptanceChannel())
                .offerPending(offerPending)
                .portalAccepted(portalAccepted)
                .portalDeclined(portalDeclined)
                .offerSentAt(application.getOfferSentAt())
                .offerExpectedStartDate(application.getOfferExpectedStartDate())
                .offerBaseSalary(application.getOfferBaseSalary())
                .offerContractType(offerContract)
                .offerExperiencePeriod(application.getOfferExperiencePeriod())
                .offerWorkScheduleId(application.getOfferWorkScheduleId())
                .affirmativePcd(Boolean.TRUE.equals(vacancy.getAffirmativePcd()))
                .build();
    }

    @Transactional
    @PreAuthorize("hasAnyAuthority('jobvacancyapplication:write', 'admission:write')")
    public JobVacancyApplicationOfferResponseDto sendOffer(
            UUID applicationId, JobVacancyApplicationOfferRequestDto request) {
        JobVacancyApplication application = requireApplication(applicationId);
        if (application.getAdmissionProcessId() != null
                || application.getApplicationStatus() == JobVacancyApplicationStatusEnum.HIRED) {
            throw JobVacancyApplicationException.hireAlreadyDone();
        }
        if (application.isRejected()) {
            throw JobVacancyApplicationException.alreadyRejected();
        }
        if (application.getCandidateAcceptance() == CandidateAcceptanceEnum.ACCEPTED
                && application.getAcceptanceChannel() == AcceptanceChannelEnum.PORTAL) {
            throw JobVacancyApplicationException.offerAlreadySent();
        }
        if (application.getApplicationStatus() == JobVacancyApplicationStatusEnum.OFFER
                && application.getCandidateAcceptance() == CandidateAcceptanceEnum.PENDING
                && application.getOfferSentAt() != null) {
            throw JobVacancyApplicationException.offerAlreadySent();
        }

        Candidate candidate = requireCandidate(application.getCandidateId());
        JobVacancy vacancy = requireVacancy(application.getJobVacancyId());

        application.setApplicationStatus(JobVacancyApplicationStatusEnum.OFFER);
        application.setCandidateAcceptance(CandidateAcceptanceEnum.PENDING);
        application.setAcceptanceDate(null);
        application.setAcceptanceChannel(null);
        application.setOfferSentAt(OffsetDateTime.now());
        application.setOfferContractType(request.getContractType().name());
        application.setOfferBaseSalary(request.getBaseSalary());
        application.setOfferExpectedStartDate(request.getExpectedStartDate());
        application.setOfferExperiencePeriod(
                resolveExperiencePeriod(vacancy.getId(), request.getContractType(), request.getExperiencePeriod()));
        application.setOfferWorkScheduleId(request.getWorkScheduleId());
        application.setOfferDeclineReason(null);
        application.clearRejection();
        applicationRepository.save(application);

        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.UPDATE, application)
                .detail("Proposta de contratacao enviada ao portal")
                .reason("Aguardando aceite do candidato"));

        return toOfferResponse(application, candidate, vacancy);
    }

    @Transactional
    @PreAuthorize("hasAnyAuthority('jobvacancyapplication:write', 'admission:write')")
    public JobVacancyApplicationHireResponseDto hire(
            UUID applicationId, JobVacancyApplicationHireRequestDto request) {
        JobVacancyApplication application = requireApplication(applicationId);
        if (application.getAdmissionProcessId() != null
                || application.getApplicationStatus() == JobVacancyApplicationStatusEnum.HIRED) {
            throw JobVacancyApplicationException.hireAlreadyDone();
        }
        if (application.isRejected()) {
            throw JobVacancyApplicationException.alreadyRejected();
        }
        if (request.getCandidateAcceptance() != CandidateAcceptanceEnum.ACCEPTED) {
            throw JobVacancyApplicationException.hireAcceptanceRequired();
        }
        if (request.getAcceptanceChannel() == AcceptanceChannelEnum.PORTAL
                && !(application.getCandidateAcceptance() == CandidateAcceptanceEnum.ACCEPTED
                        && application.getAcceptanceChannel() == AcceptanceChannelEnum.PORTAL)) {
            throw JobVacancyApplicationException.portalAcceptanceRequired();
        }

        requireHireColumn(request.getColumnKey());
        Candidate candidate = requireCandidate(application.getCandidateId());
        JobVacancy vacancy = requireVacancy(application.getJobVacancyId());

        String cpf = firstNonBlank(digitsOnly(request.getCpf()), digitsOnly(candidate.getCpf()));
        if (cpf == null || cpf.length() != 11) {
            throw JobVacancyApplicationException.hireCpfRequired();
        }

        LocalDate birthDate = request.getBirthDate() != null ? request.getBirthDate() : candidate.getBirthDate();
        String email = firstNonBlank(trimToNull(request.getEmail()), trimToNull(candidate.getEmail()));
        String phone = firstNonBlank(trimToNull(request.getPhone()), trimToNull(candidate.getPhone()));

        LocalDate acceptanceDate = request.getAcceptanceDate();
        AcceptanceChannelEnum acceptanceChannel = request.getAcceptanceChannel();
        if (application.getCandidateAcceptance() == CandidateAcceptanceEnum.ACCEPTED
                && application.getAcceptanceChannel() == AcceptanceChannelEnum.PORTAL) {
            acceptanceChannel = AcceptanceChannelEnum.PORTAL;
            if (application.getAcceptanceDate() != null) {
                acceptanceDate = application.getAcceptanceDate();
            }
        }

        AdmissionProcessRequestDto admissionRequest = AdmissionProcessRequestDto.builder()
                .admissionStatus(AdmissionStatusEnum.IN_PROGRESS)
                .fullName(candidate.getFullName().trim())
                .cpf(cpf)
                .birthDate(birthDate)
                .email(email)
                .phone(phone)
                .expectedStartDate(request.getExpectedStartDate())
                .startedAt(request.getExpectedStartDate())
                .contractStartDate(request.getExpectedStartDate())
                .contractType(request.getContractType())
                .baseSalary(request.getBaseSalary())
                .workScheduleId(request.getWorkScheduleId())
                .jobPositionId(vacancy.getJobPositionId())
                .companyId(vacancy.getCompanyId())
                .experiencePeriod(resolveExperiencePeriod(
                        vacancy.getId(), request.getContractType(), request.getExperiencePeriod()))
                .notes("Criado a partir da proposta de contratacao da vaga "
                        + (vacancy.getJobTitle() != null ? vacancy.getJobTitle() : ""))
                .build();

        AdmissionProcessResponseDto admission = admissionProcessService.create(admissionRequest);
        String preAdmissionToken = null;
        boolean preAdmissionLinkSent = false;
        AdmissionProcess admissionEntity = admissionProcessRepository
                .findByIdAndStatusNot(admission.getId(), StatusEnum.DELETED)
                .orElse(null);
        if (admissionEntity != null) {
            admissionEntity.setSourceApplicationId(application.getId());
            admissionEntity.setSourceCandidateId(candidate.getId());
            if (acceptanceChannel == AcceptanceChannelEnum.PORTAL) {
                preAdmissionToken = newPreAdmissionToken();
                admissionEntity.setPreAdmissionToken(preAdmissionToken);
                admissionEntity.setPreAdmissionTokenExpiresAt(
                        OffsetDateTime.now().plusDays(PRE_ADMISSION_TOKEN_DAYS));
                admissionEntity.setPreAdmissionLinkSentAt(OffsetDateTime.now());
                preAdmissionLinkSent = true;
            }
            admissionProcessRepository.save(admissionEntity);
        }

        assignColumn(application, request.getColumnKey());
        application.setApplicationStatus(JobVacancyApplicationStatusEnum.HIRED);
        application.setAdmissionProcessId(admission.getId());
        application.setCandidateAcceptance(CandidateAcceptanceEnum.ACCEPTED);
        application.setAcceptanceDate(acceptanceDate);
        application.setAcceptanceChannel(acceptanceChannel);
        application.clearRejection();
        applicationRepository.save(application);

        List<UUID> closedIds = closeOtherApplications(application, vacancy.getId());

        String rehireWarning = resolveRehireWarning(cpf);
        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.HIRE, application)
                .detail("Contratacao a partir do kanban")
                .reason("Proposta confirmada"));

        return JobVacancyApplicationHireResponseDto.builder()
                .applicationId(application.getId())
                .admissionProcessId(admission.getId())
                .admissionCode(admission.getCode())
                .candidateFullName(candidate.getFullName())
                .closedApplicationIds(closedIds)
                .closedApplicationsCount(closedIds.size())
                .rehireWarning(rehireWarning)
                .preAdmissionPortalPath(
                        preAdmissionToken != null
                                ? "/careers/portal/pre-admission?token=" + preAdmissionToken
                                : null)
                .preAdmissionLinkSent(preAdmissionLinkSent)
                .asoPredicted(true)
                .build();
    }

    /**
     * Aceite pelo candidato autenticado no portal. Sem {@code @PreAuthorize} de staff —
     * chamado apenas pelo {@code CandidatePortalService}.
     */
    @Transactional
    public JobVacancyApplicationOfferResponseDto acceptOfferByCandidate(UUID applicationId, UUID candidateId) {
        JobVacancyApplication application = requireOwnedPendingOffer(applicationId, candidateId);
        Candidate candidate = requireCandidate(candidateId);
        JobVacancy vacancy = requireVacancy(application.getJobVacancyId());

        application.setCandidateAcceptance(CandidateAcceptanceEnum.ACCEPTED);
        application.setAcceptanceDate(LocalDate.now());
        application.setAcceptanceChannel(AcceptanceChannelEnum.PORTAL);
        application.setOfferDeclineReason(null);
        applicationRepository.save(application);

        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.UPDATE, application)
                .detail("Candidato aceitou a proposta no portal")
                .reason("Aceite PORTAL"));

        return toOfferResponse(application, candidate, vacancy);
    }

    /**
     * Recusa pelo candidato autenticado no portal. Sem {@code @PreAuthorize} de staff.
     */
    @Transactional
    public JobVacancyApplicationOfferResponseDto declineOfferByCandidate(
            UUID applicationId, UUID candidateId, String reason) {
        JobVacancyApplication application = requireOwnedPendingOffer(applicationId, candidateId);
        Candidate candidate = requireCandidate(candidateId);
        JobVacancy vacancy = requireVacancy(application.getJobVacancyId());

        application.setCandidateAcceptance(CandidateAcceptanceEnum.DECLINED);
        application.setAcceptanceDate(LocalDate.now());
        application.setAcceptanceChannel(AcceptanceChannelEnum.PORTAL);
        application.setOfferDeclineReason(trimToNull(reason));
        applicationRepository.save(application);

        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.UPDATE, application)
                .detail("Candidato recusou a proposta no portal")
                .reason(trimToNull(reason) != null ? reason.trim() : "Recusa PORTAL"));

        return toOfferResponse(application, candidate, vacancy);
    }

    private JobVacancyApplication requireOwnedPendingOffer(UUID applicationId, UUID candidateId) {
        JobVacancyApplication application = requireApplication(applicationId);
        if (!candidateId.equals(application.getCandidateId())) {
            throw JobVacancyApplicationException.notFound();
        }
        if (application.getAdmissionProcessId() != null
                || application.getApplicationStatus() == JobVacancyApplicationStatusEnum.HIRED) {
            throw JobVacancyApplicationException.hireAlreadyDone();
        }
        if (application.getApplicationStatus() != JobVacancyApplicationStatusEnum.OFFER
                || application.getCandidateAcceptance() != CandidateAcceptanceEnum.PENDING
                || application.getOfferSentAt() == null) {
            throw JobVacancyApplicationException.offerNotPending();
        }
        return application;
    }

    private JobVacancyApplicationOfferResponseDto toOfferResponse(
            JobVacancyApplication application, Candidate candidate, JobVacancy vacancy) {
        return JobVacancyApplicationOfferResponseDto.builder()
                .applicationId(application.getId())
                .candidateAcceptance(application.getCandidateAcceptance())
                .offerSentAt(application.getOfferSentAt())
                .contractType(parseContractType(application.getOfferContractType()))
                .baseSalary(application.getOfferBaseSalary())
                .expectedStartDate(application.getOfferExpectedStartDate())
                .experiencePeriod(application.getOfferExperiencePeriod())
                .workScheduleId(application.getOfferWorkScheduleId())
                .candidateFullName(candidate.getFullName())
                .jobVacancyTitle(vacancy.getJobTitle())
                .build();
    }

    private static String newPreAdmissionToken() {
        byte[] bytes = new byte[24];
        SECURE_RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private static ContractTypeEnum parseContractType(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return ContractTypeEnum.valueOf(raw.trim());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private static JobRequisitionExperiencePeriodEnum parseExperiencePeriod(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return JobRequisitionExperiencePeriodEnum.valueOf(raw.trim());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private List<UUID> closeOtherApplications(JobVacancyApplication hired, UUID vacancyId) {
        boolean closedExists = kanbanColumnRepository
                .findAllByStatusNotOrderByDisplayOrderAscNameAsc(StatusEnum.DELETED)
                .stream()
                .anyMatch(column -> AdmissionProcessKanbanColumn.CLOSED_COLUMN_KEY.equals(column.getColumnKey()));
        if (!closedExists) {
            return List.of();
        }

        UUID userId = CurrentAuditor.userId().orElse(null);
        String userName =
                userId == null ? null : appUserRepository.findById(userId).map(AppUser::getName).orElse(null);

        List<UUID> closedIds = new ArrayList<>();
        List<UUID> feedbackIds = new ArrayList<>();
        for (JobVacancyApplication other : applicationRepository.findByJobVacancyIdAndStatusNotOrderByAppliedAtDesc(
                vacancyId, StatusEnum.DELETED)) {
            if (other.getId().equals(hired.getId())) {
                continue;
            }
            if (other.isRejected() || other.getApplicationStatus() == JobVacancyApplicationStatusEnum.HIRED) {
                continue;
            }
            assignColumn(other, AdmissionProcessKanbanColumn.CLOSED_COLUMN_KEY);
            other.setApplicationStatus(JobVacancyApplicationStatusEnum.REJECTED);
            other.setRejectionReason(JobVacancyApplicationRejectionReasonEnum.MORE_ALIGNED_CANDIDATE);
            other.setRejectionRequirement(null);
            other.setRejectionNote("Encerrada automaticamente: outro candidato foi contratado nesta vaga.");
            other.setRejectedAt(OffsetDateTime.now());
            other.setRejectedBy(userId);
            other.setRejectedByName(userName);
            other.setRejectionFeedbackStatus(RejectionFeedbackStatusEnum.PENDING);
            other.setRejectionFeedbackAt(null);
            other.setRejectionFeedbackDetail(null);
            applicationRepository.save(other);
            closedIds.add(other.getId());
            feedbackIds.add(other.getId());
        }

        for (UUID feedbackId : feedbackIds) {
            runAfterCommit(() -> rejectionFeedbackService.sendAsync(feedbackId));
        }
        return closedIds;
    }

    private String resolveRehireWarning(String cpf) {
        if (cpf == null || cpf.isBlank()) {
            return null;
        }
        Collaborator collaborator = collaboratorRepository
                .findByCpfAndStatusNot(cpf, StatusEnum.DELETED)
                .orElse(null);
        if (collaborator == null) {
            return null;
        }
        List<Offboarding> offboardings = offboardingRepository.findByCollaboratorIdAndStatusNotOrderByDismissalDateDesc(
                collaborator.getId(), StatusEnum.DELETED);
        if (offboardings.isEmpty()) {
            return null;
        }
        Offboarding latest = offboardings.get(0);
        if (latest.getDismissalType() != DismissalTypeEnum.WITHOUT_CAUSE || latest.getDismissalDate() == null) {
            return null;
        }
        long days = ChronoUnit.DAYS.between(latest.getDismissalDate(), LocalDate.now());
        if (days < 0 || days >= REHIRE_WARNING_DAYS) {
            return null;
        }
        return "Candidato foi colaborador ate "
                + latest.getDismissalDate().format(DATE_BR)
                + " (dispensa sem justa causa). Recontratar antes de 90 dias da dispensa e presumido fraudulento "
                + "(Portaria MTP 671/2021, arts. 311-312).";
    }

    private void requireHireColumn(String columnKey) {
        String normalized = normalizeColumnKey(columnKey);
        if (normalized == null) {
            throw JobVacancyApplicationException.hireColumnRequired();
        }
        boolean ok = kanbanColumnRepository
                .findAllByStatusNotOrderByDisplayOrderAscNameAsc(StatusEnum.DELETED)
                .stream()
                .anyMatch(column -> normalized.equals(column.getColumnKey())
                        && column.getColumnAction() == KanbanColumnActionEnum.CREATE_ADMISSION
                        && !column.isSystemColumn());
        if (!ok) {
            throw JobVacancyApplicationException.hireColumnRequired();
        }
    }

    private JobVacancyApplication requireApplication(UUID id) {
        return applicationRepository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(JobVacancyApplicationException::notFound);
    }

    private Candidate requireCandidate(UUID id) {
        return candidateRepository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(JobVacancyApplicationException::hireCandidateRequired);
    }

    private JobVacancy requireVacancy(UUID id) {
        return jobVacancyRepository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(JobVacancyApplicationException::vacancyNotFound);
    }

    private void assignColumn(JobVacancyApplication entity, String columnKey) {
        String normalized = normalizeColumnKey(columnKey);
        if (normalized == null) {
            return;
        }
        if (!normalized.equals(entity.getKanbanColumnKey())) {
            entity.setKanbanColumnKey(normalized);
            entity.setKanbanColumnEnteredAt(OffsetDateTime.now());
            entity.setKanbanSlaLastReminderDate(null);
            entity.setKanbanSlaCandidateNotifiedAt(null);
        }
    }

    private static ContractTypeEnum mapContractType(JobVacancyContractTypeEnum vacancyType) {
        if (vacancyType == null) {
            return ContractTypeEnum.CLT;
        }
        return switch (vacancyType) {
            case CLT -> ContractTypeEnum.CLT;
            case PJ, FREELANCER -> ContractTypeEnum.PJ;
            case ESTAGIO -> ContractTypeEnum.INTERN;
            case TEMPORARIO -> ContractTypeEnum.INTERMITTENT;
        };
    }

    private JobRequisitionExperiencePeriodEnum resolveSuggestedExperiencePeriod(
            UUID jobVacancyId, ContractTypeEnum contractType) {
        if (contractType != ContractTypeEnum.CLT) {
            return JobRequisitionExperiencePeriodEnum.NONE;
        }
        return jobRequisitionRepository
                .findFirstByJobVacancyIdAndStatusNotOrderByCreatedAtDesc(jobVacancyId, StatusEnum.DELETED)
                .map(JobRequisition::getExperiencePeriod)
                .map(period -> period == null || period == JobRequisitionExperiencePeriodEnum.NONE
                        ? JobRequisitionExperiencePeriodEnum.DAYS_45_45
                        : period)
                .orElse(JobRequisitionExperiencePeriodEnum.DAYS_45_45);
    }

    private String resolveExperiencePeriod(
            UUID jobVacancyId,
            ContractTypeEnum contractType,
            JobRequisitionExperiencePeriodEnum requested) {
        if (contractType != ContractTypeEnum.CLT) {
            return JobRequisitionExperiencePeriodEnum.NONE.name();
        }
        if (requested != null) {
            return requested.name();
        }
        return resolveSuggestedExperiencePeriod(jobVacancyId, contractType).name();
    }

    private static String normalizeColumnKey(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim().toLowerCase();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String digitsOnly(String value) {
        if (value == null) {
            return null;
        }
        String digits = value.replaceAll("\\D", "");
        return digits.isEmpty() ? null : digits;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }
        if (second != null && !second.isBlank()) {
            return second;
        }
        return null;
    }

    private static void runAfterCommit(Runnable task) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    task.run();
                }
            });
        } else {
            task.run();
        }
    }
}
