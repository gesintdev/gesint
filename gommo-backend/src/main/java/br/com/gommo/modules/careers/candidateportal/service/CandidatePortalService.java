package br.com.gommo.modules.careers.candidateportal.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.tenant.TenantContext;
import br.com.gommo.core.tenant.TenantContextHolder;
import br.com.gommo.modules.careers.candidateportal.auth.CandidatePortalSecurity;
import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalApplicationSummaryDto;
import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalConsentUpdateRequestDto;
import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalMeResponseDto;
import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalProfileUpdateRequestDto;
import br.com.gommo.modules.careers.candidateportal.entity.CandidateAccount;
import br.com.gommo.modules.careers.candidateportal.exception.CandidatePortalException;
import br.com.gommo.modules.careers.candidateportal.lib.CandidatePortalTimeline;
import br.com.gommo.modules.careers.candidateportal.repository.CandidateAccountRepository;
import br.com.gommo.modules.rh.person.candidate.entity.Candidate;
import br.com.gommo.modules.rh.person.candidate.repository.CandidateRepository;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancy;
import br.com.gommo.modules.rh.person.jobvacancy.lib.JobVacancySlug;
import br.com.gommo.modules.rh.person.jobvacancy.repository.JobVacancyRepository;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplication;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplicationStatusEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.repository.JobVacancyApplicationRepository;

@Service
public class CandidatePortalService {

    private final CandidateAccountRepository accountRepository;
    private final CandidateRepository candidateRepository;
    private final JobVacancyApplicationRepository applicationRepository;
    private final JobVacancyRepository jobVacancyRepository;

    public CandidatePortalService(
            CandidateAccountRepository accountRepository,
            CandidateRepository candidateRepository,
            JobVacancyApplicationRepository applicationRepository,
            JobVacancyRepository jobVacancyRepository) {
        this.accountRepository = accountRepository;
        this.candidateRepository = candidateRepository;
        this.applicationRepository = applicationRepository;
        this.jobVacancyRepository = jobVacancyRepository;
    }

    @Transactional(readOnly = true)
    public CandidatePortalMeResponseDto me() {
        CandidateAccount account = requireAccount();
        Candidate candidate = requireCandidate(account.getCandidateId());
        List<JobVacancyApplication> applications = applicationRepository.findByCandidateIdAndStatusNotOrderByAppliedAtDesc(
                account.getCandidateId(), StatusEnum.DELETED);
        boolean privacy = applications.stream().anyMatch(app -> app.getPrivacyConsentAt() != null);
        boolean talentPool = applications.stream()
                .anyMatch(app -> app.getTalentPoolConsentAt() != null
                        && (app.getTalentPoolConsentUntil() == null
                                || !app.getTalentPoolConsentUntil().isBefore(LocalDate.now())));
        return CandidatePortalMeResponseDto.builder()
                .accountId(account.getId())
                .candidateId(account.getCandidateId())
                .fullName(account.getFullName())
                .email(account.getEmail())
                .phone(firstNonBlank(account.getPhone(), candidate.getPhone()))
                .emailVerified(account.isEmailVerified())
                .hasPassword(account.getPasswordHash() != null)
                .googleLinked(account.getGoogleSub() != null)
                .privacyConsentActive(privacy)
                .talentPoolConsentActive(talentPool)
                .organizationName(organizationName())
                .build();
    }

    @Transactional
    public CandidatePortalMeResponseDto updateProfile(CandidatePortalProfileUpdateRequestDto request) {
        CandidateAccount account = requireAccount();
        Candidate candidate = requireCandidate(account.getCandidateId());
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            account.setFullName(request.getFullName().trim());
            // Contato: candidato existente so atualiza campos vazios no cadastro RH (SEG-04).
            if (candidate.getFullName() == null || candidate.getFullName().isBlank()) {
                candidate.setFullName(account.getFullName());
            }
        }
        if (request.getPhone() != null) {
            String phone = request.getPhone().trim();
            account.setPhone(phone.isEmpty() ? null : phone);
            candidate.setPhone(account.getPhone());
        }
        accountRepository.save(account);
        candidateRepository.save(candidate);
        return me();
    }

    @Transactional(readOnly = true)
    public List<CandidatePortalApplicationSummaryDto> listApplications() {
        CandidateAccount account = requireAccount();
        return applicationRepository
                .findByCandidateIdAndStatusNotOrderByAppliedAtDesc(account.getCandidateId(), StatusEnum.DELETED)
                .stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public CandidatePortalApplicationSummaryDto findByVacancySlug(String rawSlug) {
        CandidateAccount account = requireAccount();
        String slug = JobVacancySlug.normalize(rawSlug);
        if (slug == null) {
            throw CandidatePortalException.applicationNotFound();
        }
        JobVacancy vacancy = jobVacancyRepository
                .findBySlugAndStatusNot(slug, StatusEnum.DELETED)
                .orElseThrow(CandidatePortalException::applicationNotFound);
        JobVacancyApplication application = applicationRepository
                .findByJobVacancyIdAndCandidateIdAndStatusNot(
                        vacancy.getId(), account.getCandidateId(), StatusEnum.DELETED)
                .orElseThrow(CandidatePortalException::applicationNotFound);
        return toSummary(application, vacancy);
    }

    @Transactional
    public CandidatePortalApplicationSummaryDto withdraw(UUID applicationId) {
        CandidateAccount account = requireAccount();
        JobVacancyApplication application = applicationRepository
                .findById(applicationId)
                .filter(app -> app.getStatus() != StatusEnum.DELETED)
                .filter(app -> account.getCandidateId().equals(app.getCandidateId()))
                .orElseThrow(CandidatePortalException::applicationNotFound);
        if (!CandidatePortalTimeline.withdrawable(application)) {
            throw CandidatePortalException.withdrawNotAllowed();
        }
        application.setApplicationStatus(JobVacancyApplicationStatusEnum.WITHDRAWN);
        applicationRepository.save(application);
        return toSummary(application);
    }

    @Transactional
    public CandidatePortalMeResponseDto updateConsents(CandidatePortalConsentUpdateRequestDto request) {
        CandidateAccount account = requireAccount();
        if (Boolean.FALSE.equals(request.getTalentPoolConsent())) {
            List<JobVacancyApplication> applications =
                    applicationRepository.findByCandidateIdAndStatusNotOrderByAppliedAtDesc(
                            account.getCandidateId(), StatusEnum.DELETED);
            OffsetDateTime now = OffsetDateTime.now();
            for (JobVacancyApplication application : applications) {
                if (application.getTalentPoolConsentAt() != null) {
                    application.setTalentPoolConsentUntil(now.toLocalDate());
                    applicationRepository.save(application);
                }
            }
        }
        return me();
    }

    private CandidatePortalApplicationSummaryDto toSummary(JobVacancyApplication application) {
        JobVacancy vacancy = jobVacancyRepository.findById(application.getJobVacancyId()).orElse(null);
        return toSummary(application, vacancy);
    }

    private CandidatePortalApplicationSummaryDto toSummary(JobVacancyApplication application, JobVacancy vacancy) {
        return CandidatePortalApplicationSummaryDto.builder()
                .applicationId(application.getId())
                .vacancyId(application.getJobVacancyId())
                .vacancySlug(vacancy != null ? vacancy.getSlug() : null)
                .jobTitle(vacancy != null ? vacancy.getJobTitle() : "Vaga")
                .location(vacancy != null ? vacancy.getLocation() : null)
                .appliedAt(application.getAppliedAt())
                .stageKey(CandidatePortalTimeline.stageKey(application))
                .stageLabel(CandidatePortalTimeline.stageLabel(application))
                .resultLabel(CandidatePortalTimeline.resultLabel(application))
                .withdrawable(CandidatePortalTimeline.withdrawable(application))
                .timeline(CandidatePortalTimeline.build(application))
                .build();
    }

    private CandidateAccount requireAccount() {
        UUID accountId = CandidatePortalSecurity.requireAccountId();
        return accountRepository
                .findByIdAndStatusNot(accountId, StatusEnum.DELETED)
                .orElseThrow(CandidatePortalException::unauthorized);
    }

    private Candidate requireCandidate(UUID candidateId) {
        return candidateRepository
                .findById(candidateId)
                .filter(candidate -> candidate.getStatus() != StatusEnum.DELETED)
                .orElseThrow(CandidatePortalException::accountNotFound);
    }

    private static String organizationName() {
        return TenantContextHolder.getOptional()
                .map(TenantContext::name)
                .filter(name -> name != null && !name.isBlank())
                .orElse("");
    }

    private static String firstNonBlank(String primary, String fallback) {
        if (primary != null && !primary.isBlank()) {
            return primary;
        }
        return fallback;
    }
}
