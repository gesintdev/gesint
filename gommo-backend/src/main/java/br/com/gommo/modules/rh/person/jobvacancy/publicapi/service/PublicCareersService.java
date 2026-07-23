package br.com.gommo.modules.rh.person.jobvacancy.publicapi.service;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.entity.AdmissionProcessKanbanColumn;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.repository.AdmissionProcessKanbanColumnRepository;
import br.com.gommo.modules.rh.person.candidate.entity.Candidate;
import br.com.gommo.modules.rh.person.candidate.repository.CandidateRepository;
import br.com.gommo.modules.rh.person.candidate.service.CandidateExperienceService;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancy;
import br.com.gommo.modules.rh.person.jobvacancy.lib.JobVacancySlug;
import br.com.gommo.modules.rh.person.jobvacancy.publicapi.dto.PublicJobApplicationRequestDto;
import br.com.gommo.modules.rh.person.jobvacancy.publicapi.dto.PublicJobApplicationResponseDto;
import br.com.gommo.modules.rh.person.jobvacancy.publicapi.dto.PublicJobVacancyResponseDto;
import br.com.gommo.modules.rh.person.jobvacancy.publicapi.exception.PublicCareersException;
import br.com.gommo.modules.rh.person.jobvacancy.repository.JobVacancyRepository;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplication;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplicationStatusEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.repository.JobVacancyApplicationRepository;
import br.com.gommo.modules.storage.dto.StorageObjectResponseDto;
import br.com.gommo.modules.storage.service.IStorageService;

@Service
public class PublicCareersService {

    public static final String CANDIDATE_ENTITY_TYPE = "candidate";
    public static final String CURRICULUM_LINK_ROLE = "CURRICULUM";

    private final JobVacancyRepository jobVacancyRepository;
    private final CandidateRepository candidateRepository;
    private final JobVacancyApplicationRepository applicationRepository;
    private final AdmissionProcessKanbanColumnRepository kanbanColumnRepository;
    private final CandidateExperienceService experienceService;
    private final IStorageService storageService;

    public PublicCareersService(
            JobVacancyRepository jobVacancyRepository,
            CandidateRepository candidateRepository,
            JobVacancyApplicationRepository applicationRepository,
            AdmissionProcessKanbanColumnRepository kanbanColumnRepository,
            CandidateExperienceService experienceService,
            IStorageService storageService) {
        this.jobVacancyRepository = jobVacancyRepository;
        this.candidateRepository = candidateRepository;
        this.applicationRepository = applicationRepository;
        this.kanbanColumnRepository = kanbanColumnRepository;
        this.experienceService = experienceService;
        this.storageService = storageService;
    }

    @Transactional(readOnly = true)
    public PublicJobVacancyResponseDto getPublishedBySlug(String slug) {
        JobVacancy vacancy = findPublishedVacancy(slug);
        return PublicJobVacancyResponseDto.builder()
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
                .workModality(vacancy.getWorkModality())
                .contractType(vacancy.getContractType())
                .workSchedule(vacancy.getWorkSchedule())
                .seniorityLevel(vacancy.getSeniorityLevel())
                .salary(vacancy.getSalary())
                .salaryMax(vacancy.getSalaryMax())
                .publishedAt(vacancy.getPublishedAt())
                .build();
    }

    @Transactional
    public PublicJobApplicationResponseDto apply(
            String slug, PublicJobApplicationRequestDto request, MultipartFile resume) {
        JobVacancy vacancy = findPublishedVacancy(slug);

        String fullName = request.getFullName() == null ? "" : request.getFullName().trim();
        if (fullName.isEmpty()) {
            throw PublicCareersException.nameRequired();
        }
        String cpf = digitsOnly(request.getCpf());
        if (cpf.isEmpty()) {
            throw PublicCareersException.cpfRequired();
        }

        Candidate candidate = candidateRepository
                .findByCpfAndStatusNot(cpf, StatusEnum.DELETED)
                .orElseGet(() -> Candidate.builder()
                        .status(StatusEnum.ACTIVE)
                        .cpf(cpf)
                        .fullName(fullName)
                        .build());

        candidate.setFullName(fullName);
        candidate.setCpf(cpf);
        candidate.setEmail(trimToNull(request.getEmail()));
        candidate.setPhone(trimToNull(request.getPhone()));
        candidate.setBirthDate(request.getBirthDate());
        candidate.setCity(trimToNull(request.getCity()));
        candidate.setStateCode(normalizeState(request.getStateCode()));
        candidate.setLinkedinUrl(trimToNull(request.getLinkedinUrl()));
        candidate.setPortfolioUrl(trimToNull(request.getPortfolioUrl()));
        if (candidate.getStatus() == null) {
            candidate.setStatus(StatusEnum.ACTIVE);
        }
        candidate = candidateRepository.save(candidate);

        boolean alreadyApplied = applicationRepository
                .findByJobVacancyIdAndCandidateIdAndStatusNot(vacancy.getId(), candidate.getId(), StatusEnum.DELETED)
                .isPresent();
        if (alreadyApplied) {
            throw PublicCareersException.alreadyApplied();
        }

        experienceService.replaceAll(candidate.getId(), request.getExperiences());
        storeResumeIfPresent(candidate.getId(), resume);

        String firstColumnKey = kanbanColumnRepository
                .findAllByStatusNotOrderByDisplayOrderAscNameAsc(StatusEnum.DELETED)
                .stream()
                .map(AdmissionProcessKanbanColumn::getColumnKey)
                .filter(key -> key != null && !key.isBlank())
                .findFirst()
                .orElse(null);

        JobVacancyApplication application = JobVacancyApplication.builder()
                .status(StatusEnum.ACTIVE)
                .jobVacancyId(vacancy.getId())
                .candidateId(candidate.getId())
                .applicationStatus(JobVacancyApplicationStatusEnum.APPLIED)
                .appliedAt(OffsetDateTime.now())
                .kanbanColumnKey(firstColumnKey)
                .stageComments(new LinkedHashMap<>())
                .coverLetter(trimToNull(request.getCoverLetter()))
                .referralSource(trimToNull(request.getReferralSource()))
                .build();
        applicationRepository.save(application);

        return PublicJobApplicationResponseDto.builder()
                .message("Candidatura enviada com sucesso")
                .build();
    }

    private void storeResumeIfPresent(java.util.UUID candidateId, MultipartFile resume) {
        if (resume == null || resume.isEmpty()) {
            return;
        }
        StorageObjectResponseDto uploaded = storageService.uploadInternal(resume);
        storageService.softDeleteLinksByEntityAndRole(CANDIDATE_ENTITY_TYPE, candidateId, CURRICULUM_LINK_ROLE);
        storageService.linkToEntityInternal(
                CANDIDATE_ENTITY_TYPE,
                candidateId,
                uploaded.getId(),
                CURRICULUM_LINK_ROLE,
                resume.getOriginalFilename(),
                "CURRICULUM");
    }

    private JobVacancy findPublishedVacancy(String rawSlug) {
        String slug = JobVacancySlug.normalize(rawSlug);
        if (slug == null) {
            throw PublicCareersException.vacancyNotFound();
        }
        return jobVacancyRepository
                .findBySlugAndIsPublicTrueAndStatus(slug, StatusEnum.ACTIVE)
                .orElseThrow(PublicCareersException::vacancyNotFound);
    }

    private static String digitsOnly(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("\\D", "");
    }

    private static String normalizeState(String value) {
        String trimmed = trimToNull(value);
        return trimmed == null ? null : trimmed.toUpperCase();
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
