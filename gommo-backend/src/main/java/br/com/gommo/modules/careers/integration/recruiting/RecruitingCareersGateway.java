package br.com.gommo.modules.careers.integration.recruiting;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.tenant.TenantContext;
import br.com.gommo.core.tenant.TenantContextHolder;
import br.com.gommo.modules.careers.integration.CareersApplicationCommand;
import br.com.gommo.modules.careers.integration.CareersApplicationOutcome;
import br.com.gommo.modules.careers.integration.CareersExperience;
import br.com.gommo.modules.careers.integration.CareersPlatformGateway;
import br.com.gommo.modules.careers.integration.CareersVacancy;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.entity.AdmissionProcessKanbanColumn;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.repository.AdmissionProcessKanbanColumnRepository;
import br.com.gommo.modules.rh.person.candidate.dto.CandidateExperienceDto;
import br.com.gommo.modules.rh.person.candidate.entity.Candidate;
import br.com.gommo.modules.rh.person.candidate.repository.CandidateRepository;
import br.com.gommo.modules.rh.person.candidate.service.CandidateExperienceService;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancy;
import br.com.gommo.modules.rh.person.jobvacancy.lib.JobVacancySlug;
import br.com.gommo.modules.rh.person.jobvacancy.repository.JobVacancyRepository;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.ApplicationAiStatusEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplication;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplicationStatusEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.repository.JobVacancyApplicationRepository;
import br.com.gommo.modules.rh.person.recruiting.ai.ApplicationAiAnalysisService;
import br.com.gommo.modules.storage.dto.StorageObjectResponseDto;
import br.com.gommo.modules.storage.service.IStorageService;

/** Implementacao da porta do site de carreiras sobre o recrutamento do Gommo (mesmo processo). */
@Component
public class RecruitingCareersGateway implements CareersPlatformGateway {

    public static final String CANDIDATE_ENTITY_TYPE = "candidate";
    public static final String CURRICULUM_LINK_ROLE = "CURRICULUM";

    private final JobVacancyRepository jobVacancyRepository;
    private final CandidateRepository candidateRepository;
    private final JobVacancyApplicationRepository applicationRepository;
    private final AdmissionProcessKanbanColumnRepository kanbanColumnRepository;
    private final CandidateExperienceService experienceService;
    private final IStorageService storageService;
    private final ApplicationAiAnalysisService applicationAiAnalysisService;

    public RecruitingCareersGateway(
            JobVacancyRepository jobVacancyRepository,
            CandidateRepository candidateRepository,
            JobVacancyApplicationRepository applicationRepository,
            AdmissionProcessKanbanColumnRepository kanbanColumnRepository,
            CandidateExperienceService experienceService,
            IStorageService storageService,
            ApplicationAiAnalysisService applicationAiAnalysisService) {
        this.jobVacancyRepository = jobVacancyRepository;
        this.candidateRepository = candidateRepository;
        this.applicationRepository = applicationRepository;
        this.kanbanColumnRepository = kanbanColumnRepository;
        this.experienceService = experienceService;
        this.storageService = storageService;
        this.applicationAiAnalysisService = applicationAiAnalysisService;
    }

    @Override
    public String organizationName() {
        return TenantContextHolder.getOptional()
                .map(TenantContext::name)
                .filter(name -> name != null && !name.isBlank())
                .orElse("");
    }

    @Override
    @Transactional(readOnly = true)
    public List<CareersVacancy> listPublishedVacancies() {
        return jobVacancyRepository.findAllByIsPublicTrueAndStatusOrderByPublishedAtDesc(StatusEnum.ACTIVE).stream()
                .filter(vacancy -> vacancy.getSlug() != null && !vacancy.getSlug().isBlank())
                .map(RecruitingCareersGateway::toVacancy)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CareersVacancy> findPublishedVacancy(String rawSlug) {
        String slug = JobVacancySlug.normalize(rawSlug);
        if (slug == null) {
            return Optional.empty();
        }
        return jobVacancyRepository
                .findBySlugAndIsPublicTrueAndStatus(slug, StatusEnum.ACTIVE)
                .map(RecruitingCareersGateway::toVacancy);
    }

    /**
     * Deduplica por e-mail (RN-02). Candidato existente nunca e alterado: o que veio no formulario
     * fica no snapshot da candidatura e o curriculo entra como anexo adicional.
     */
    @Override
    @Transactional
    public CareersApplicationOutcome submitApplication(CareersApplicationCommand command, MultipartFile resume) {
        Optional<Candidate> existing =
                candidateRepository.findFirstByEmailIgnoreCaseAndStatusNotOrderByCreatedAtAsc(
                        command.getEmail(), StatusEnum.DELETED);

        if (existing.isPresent()
                && applicationRepository
                        .findByJobVacancyIdAndCandidateIdAndStatusNot(
                                command.getVacancyId(), existing.get().getId(), StatusEnum.DELETED)
                        .isPresent()) {
            return CareersApplicationOutcome.ALREADY_APPLIED;
        }

        Candidate candidate = existing.orElseGet(() -> createCandidate(command));
        if (existing.isEmpty()) {
            experienceService.replaceAll(candidate.getId(), toExperienceDtos(command.getExperiences()));
        }

        StorageObjectResponseDto resumeObject = storeResume(candidate.getId(), resume, command.getCompanyId());

        JobVacancyApplication application = JobVacancyApplication.builder()
                .status(StatusEnum.ACTIVE)
                .jobVacancyId(command.getVacancyId())
                .candidateId(candidate.getId())
                .applicationStatus(JobVacancyApplicationStatusEnum.APPLIED)
                .appliedAt(OffsetDateTime.now())
                .kanbanColumnKey(firstKanbanColumnKey())
                .stageComments(new LinkedHashMap<>())
                .coverLetter(command.getCoverLetter())
                .referralSource(command.getReferralSource())
                .salaryExpectation(command.getSalaryExpectation())
                .aiStatus(ApplicationAiStatusEnum.PENDING)
                .companyId(command.getCompanyId())
                .privacyConsentAt(command.getPrivacyConsentAt())
                .privacyConsentVersion(command.getPrivacyConsentVersion())
                .talentPoolConsentAt(command.getTalentPoolConsentAt())
                .talentPoolConsentVersion(command.getTalentPoolConsentVersion())
                .talentPoolConsentUntil(command.getTalentPoolConsentUntil())
                .applicantSnapshot(snapshot(command, resumeObject, resume, existing.isPresent()))
                .build();
        application = applicationRepository.save(application);
        enqueueAnalysisAfterCommit(application.getId());
        return CareersApplicationOutcome.CREATED;
    }

    private Candidate createCandidate(CareersApplicationCommand command) {
        Candidate candidate = Candidate.builder()
                .status(StatusEnum.ACTIVE)
                .fullName(command.getFullName())
                .email(command.getEmail())
                .phone(command.getPhone())
                .city(command.getCity())
                .stateCode(command.getStateCode())
                .linkedinUrl(command.getLinkedinUrl())
                .portfolioUrl(command.getPortfolioUrl())
                .build();
        if (command.getCompanyId() != null) {
            candidate.setCompanyId(command.getCompanyId());
        }
        return candidateRepository.save(candidate);
    }

    private StorageObjectResponseDto storeResume(UUID candidateId, MultipartFile resume, UUID companyId) {
        if (resume == null || resume.isEmpty()) {
            return null;
        }
        StorageObjectResponseDto object = storageService.uploadInternal(resume, companyId);
        storageService.linkToEntityInternal(
                CANDIDATE_ENTITY_TYPE,
                candidateId,
                object.getId(),
                CURRICULUM_LINK_ROLE,
                resume.getOriginalFilename(),
                "CURRICULUM",
                companyId);
        return object;
    }

    private String firstKanbanColumnKey() {
        return kanbanColumnRepository.findAllByStatusNotOrderByDisplayOrderAscNameAsc(StatusEnum.DELETED).stream()
                .map(AdmissionProcessKanbanColumn::getColumnKey)
                .filter(key -> key != null && !key.isBlank())
                .findFirst()
                .orElse(null);
    }

    private void enqueueAnalysisAfterCommit(UUID applicationId) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            applicationAiAnalysisService.analyzeAsync(applicationId);
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                applicationAiAnalysisService.analyzeAsync(applicationId);
            }
        });
    }

    private static Map<String, Object> snapshot(
            CareersApplicationCommand command,
            StorageObjectResponseDto resumeObject,
            MultipartFile resume,
            boolean matchedExistingCandidate) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("fullName", command.getFullName());
        snapshot.put("email", command.getEmail());
        snapshot.put("phone", command.getPhone());
        snapshot.put("city", command.getCity());
        snapshot.put("stateCode", command.getStateCode());
        snapshot.put("linkedinUrl", command.getLinkedinUrl());
        snapshot.put("portfolioUrl", command.getPortfolioUrl());
        List<Map<String, Object>> experiences = new ArrayList<>();
        for (CareersExperience experience : safeExperiences(command.getExperiences())) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("companyName", experience.getCompanyName().trim());
            item.put("jobTitle", experience.getJobTitle().trim());
            item.put("startDate", experience.getStartDate().toString());
            item.put("endDate", experience.getEndDate() == null ? null : experience.getEndDate().toString());
            item.put("currentJob", Boolean.TRUE.equals(experience.getCurrentJob()));
            item.put("description", experience.getDescription());
            experiences.add(item);
        }
        snapshot.put("experiences", experiences);
        if (resumeObject != null) {
            snapshot.put("resumeObjectId", resumeObject.getId().toString());
            snapshot.put("resumeFileName", resume.getOriginalFilename());
        }
        snapshot.put("matchedExistingCandidate", matchedExistingCandidate);
        return snapshot;
    }

    private static List<CandidateExperienceDto> toExperienceDtos(List<CareersExperience> experiences) {
        return safeExperiences(experiences).stream()
                .map(experience -> CandidateExperienceDto.builder()
                        .companyName(experience.getCompanyName().trim())
                        .jobTitle(experience.getJobTitle().trim())
                        .startDate(experience.getStartDate())
                        .endDate(experience.getEndDate())
                        .currentJob(Boolean.TRUE.equals(experience.getCurrentJob()))
                        .description(experience.getDescription())
                        .build())
                .toList();
    }

    private static List<CareersExperience> safeExperiences(List<CareersExperience> experiences) {
        if (experiences == null) {
            return List.of();
        }
        return experiences.stream().filter(item -> item != null && item.isComplete()).toList();
    }

    private static CareersVacancy toVacancy(JobVacancy vacancy) {
        return CareersVacancy.builder()
                .id(vacancy.getId())
                .companyId(vacancy.getCompanyId())
                .slug(vacancy.getSlug())
                .code(vacancy.getCode())
                .jobTitle(vacancy.getJobTitle())
                .description(vacancy.getDescription())
                .activities(vacancy.getActivities())
                .assignments(vacancy.getAssignments())
                .requirements(vacancy.getRequirements())
                .benefits(vacancy.getBenefits())
                .department(vacancy.getDepartment())
                .location(vacancy.getLocation())
                .workModality(vacancy.getWorkModality() == null ? null : vacancy.getWorkModality().name())
                .contractType(vacancy.getContractType() == null ? null : vacancy.getContractType().name())
                .workSchedule(vacancy.getWorkSchedule())
                .seniorityLevel(vacancy.getSeniorityLevel() == null ? null : vacancy.getSeniorityLevel().name())
                .salary(vacancy.getSalary())
                .salaryMax(vacancy.getSalaryMax())
                .publishedAt(vacancy.getPublishedAt())
                .expectedCompletionDate(vacancy.getExpectedCompletionDate())
                .build();
    }
}
