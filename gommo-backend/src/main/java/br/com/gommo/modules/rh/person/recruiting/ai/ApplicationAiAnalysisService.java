package br.com.gommo.modules.rh.person.recruiting.ai;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.llm.LlmProperties;
import br.com.gommo.modules.rh.person.candidate.dto.CandidateExperienceDto;
import br.com.gommo.modules.rh.person.candidate.service.CandidateExperienceService;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancy;
import br.com.gommo.modules.rh.person.jobvacancy.repository.JobVacancyRepository;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.ApplicationAiStatusEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplication;
import br.com.gommo.modules.rh.person.jobvacancyapplication.repository.JobVacancyApplicationRepository;
import br.com.gommo.modules.storage.dto.StorageObjectLinkResponseDto;
import br.com.gommo.modules.storage.service.IStorageService;

@Service
public class ApplicationAiAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(ApplicationAiAnalysisService.class);
    private static final String CANDIDATE_ENTITY_TYPE = "candidate";
    private static final String CURRICULUM_LINK_ROLE = "CURRICULUM";

    private final JobVacancyApplicationRepository applicationRepository;
    private final JobVacancyRepository vacancyRepository;
    private final CandidateExperienceService experienceService;
    private final IStorageService storageService;
    private final ResumeTextExtractor resumeTextExtractor;
    private final ResumeParseService resumeParseService;
    private final ExperienceMergeService experienceMergeService;
    private final VacancyFitScoringService scoringService;
    private final LlmProperties llmProperties;
    private final TransactionTemplate transactionTemplate;

    public ApplicationAiAnalysisService(
            JobVacancyApplicationRepository applicationRepository,
            JobVacancyRepository vacancyRepository,
            CandidateExperienceService experienceService,
            IStorageService storageService,
            ResumeTextExtractor resumeTextExtractor,
            ResumeParseService resumeParseService,
            ExperienceMergeService experienceMergeService,
            VacancyFitScoringService scoringService,
            LlmProperties llmProperties,
            TransactionTemplate transactionTemplate) {
        this.applicationRepository = applicationRepository;
        this.vacancyRepository = vacancyRepository;
        this.experienceService = experienceService;
        this.storageService = storageService;
        this.resumeTextExtractor = resumeTextExtractor;
        this.resumeParseService = resumeParseService;
        this.experienceMergeService = experienceMergeService;
        this.scoringService = scoringService;
        this.llmProperties = llmProperties;
        this.transactionTemplate = transactionTemplate;
    }

    @Async("recruitingAiExecutor")
    public void analyzeAsync(UUID applicationId) {
        transactionTemplate.executeWithoutResult(status -> analyzeInTransaction(applicationId));
    }

    private void analyzeInTransaction(UUID applicationId) {
        JobVacancyApplication application = applicationRepository
                .findByIdAndStatusNot(applicationId, StatusEnum.DELETED)
                .orElse(null);
        if (application == null) {
            return;
        }

        try {
            application.setAiStatus(ApplicationAiStatusEnum.PROCESSING);
            applicationRepository.save(application);

            JobVacancy vacancy = vacancyRepository
                    .findByIdAndStatusNot(application.getJobVacancyId(), StatusEnum.DELETED)
                    .orElse(null);
            if (vacancy == null) {
                applyFailed(application, "Vaga não encontrada");
                return;
            }

            List<CandidateExperienceDto> manual = findExperiences(application);
            StorageObjectLinkResponseDto curriculum = findCurriculum(application);
            boolean hasCurriculum = curriculum != null;

            String resumeText = "";
            if (hasCurriculum) {
                try (InputStream stream = storageService.downloadInternal(curriculum.getStorageObjectId())) {
                    resumeText = resumeTextExtractor.extract(stream, curriculum.getDisplayName());
                } catch (Exception ex) {
                    log.warn(
                            "Não foi possível ler o currículo da candidatura {}: {}",
                            applicationId,
                            ex.getMessage());
                }
            }

            if (!hasCurriculum && (manual == null || manual.isEmpty())) {
                application.setAiStatus(ApplicationAiStatusEnum.SKIPPED);
                application.setAiScore(null);
                application.setAiAnalyzedAt(OffsetDateTime.now());
                application.setAiAnalysis(Map.of(
                        "summary",
                        "Sem currículo e sem experiências para analisar.",
                        "criteria",
                        List.of(),
                        "rubricVersion",
                        "v1"));
                applicationRepository.save(application);
                return;
            }

            ResumeParseService.ParsedResume parsed =
                    hasCurriculum && StringUtils.hasText(resumeText)
                            ? resumeParseService.parse(resumeText, vacancy.getJobTitle())
                            : ResumeParseService.ParsedResume.empty();

            List<Map<String, String>> merged = experienceMergeService.merge(parsed.experiences(), manual);
            VacancyFitScoringService.ScoreResult scored = scoringService.score(
                    vacancy,
                    merged,
                    parsed.skills(),
                    parsed.seniorityGuess(),
                    hasCurriculum,
                    application.getSalaryExpectation());

            Map<String, Object> analysis = new LinkedHashMap<>(scored.analysis());
            analysis.put("provider", llmProperties.getProvider());
            analysis.put("model", llmProperties.getModel());

            application.setAiScore(scored.score());
            application.setAiStatus(ApplicationAiStatusEnum.READY);
            application.setAiAnalyzedAt(OffsetDateTime.now());
            application.setAiAnalysis(analysis);
            applicationRepository.save(application);
        } catch (RuntimeException ex) {
            log.warn("Falha na análise de currículo da candidatura {}: {}", applicationId, ex.getMessage());
            applyFailed(application, ex.getMessage());
        }
    }

    @Transactional
    public JobVacancyApplication reanalyze(UUID applicationId) {
        JobVacancyApplication application = applicationRepository
                .findByIdAndStatusNot(applicationId, StatusEnum.DELETED)
                .orElseThrow(br.com.gommo.modules.rh.person.jobvacancyapplication.exception
                        .JobVacancyApplicationException::notFound);
        application.setAiStatus(ApplicationAiStatusEnum.PENDING);
        application.setAiScore(null);
        application.setAiAnalysis(null);
        application.setAiAnalyzedAt(null);
        applicationRepository.save(application);
        return application;
    }

    private void applyFailed(JobVacancyApplication application, String detail) {
        application.setAiStatus(ApplicationAiStatusEnum.FAILED);
        application.setAiAnalyzedAt(OffsetDateTime.now());
        Map<String, Object> analysis = new LinkedHashMap<>();
        analysis.put("summary", "Falha ao analisar candidatura.");
        if (StringUtils.hasText(detail)) {
            analysis.put("error", detail.length() > 180 ? detail.substring(0, 180) : detail);
        }
        analysis.put("rubricVersion", "v1");
        application.setAiAnalysis(analysis);
        applicationRepository.save(application);
    }

    /** Candidatura publica guarda o curriculo enviado naquela vaga; o candidato pode ter varios. */
    private StorageObjectLinkResponseDto findCurriculum(JobVacancyApplication application) {
        List<StorageObjectLinkResponseDto> curricula =
                storageService.listByEntityInternal(CANDIDATE_ENTITY_TYPE, application.getCandidateId()).stream()
                        .filter(link -> CURRICULUM_LINK_ROLE.equalsIgnoreCase(link.getLinkRole()))
                        .toList();
        String submittedObjectId = snapshotText(application, "resumeObjectId");
        if (submittedObjectId != null) {
            for (StorageObjectLinkResponseDto link : curricula) {
                if (link.getStorageObjectId() != null
                        && submittedObjectId.equals(link.getStorageObjectId().toString())) {
                    return link;
                }
            }
        }
        return curricula.isEmpty() ? null : curricula.get(0);
    }

    private List<CandidateExperienceDto> findExperiences(JobVacancyApplication application) {
        Map<String, Object> snapshot = application.getApplicantSnapshot();
        if (snapshot != null && snapshot.get("experiences") instanceof List<?> submitted && !submitted.isEmpty()) {
            List<CandidateExperienceDto> experiences = new ArrayList<>();
            for (Object item : submitted) {
                if (item instanceof Map<?, ?> map) {
                    CandidateExperienceDto experience = toExperience(map);
                    if (experience != null) {
                        experiences.add(experience);
                    }
                }
            }
            if (!experiences.isEmpty()) {
                return experiences;
            }
        }
        return experienceService.listByCandidateId(application.getCandidateId());
    }

    private static CandidateExperienceDto toExperience(Map<?, ?> map) {
        LocalDate startDate = parseDate(map.get("startDate"));
        Object companyName = map.get("companyName");
        Object jobTitle = map.get("jobTitle");
        if (startDate == null || companyName == null || jobTitle == null) {
            return null;
        }
        Object description = map.get("description");
        return CandidateExperienceDto.builder()
                .companyName(companyName.toString())
                .jobTitle(jobTitle.toString())
                .startDate(startDate)
                .endDate(parseDate(map.get("endDate")))
                .currentJob(Boolean.TRUE.equals(map.get("currentJob")))
                .description(description == null ? null : description.toString())
                .build();
    }

    private static LocalDate parseDate(Object value) {
        if (value == null || value.toString().isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value.toString());
        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    private static String snapshotText(JobVacancyApplication application, String key) {
        Map<String, Object> snapshot = application.getApplicantSnapshot();
        if (snapshot == null) {
            return null;
        }
        Object value = snapshot.get(key);
        return value == null || value.toString().isBlank() ? null : value.toString();
    }
}
