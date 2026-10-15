package br.com.gommo.modules.careers.site.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.com.gommo.modules.careers.integration.CareersApplicationCommand;
import br.com.gommo.modules.careers.integration.CareersExperience;
import br.com.gommo.modules.careers.integration.CareersPlatformGateway;
import br.com.gommo.modules.careers.integration.CareersVacancy;
import br.com.gommo.modules.careers.page.dto.CareersBlockDto;
import br.com.gommo.modules.careers.page.dto.CareersPageSnapshotDto;
import br.com.gommo.modules.careers.page.dto.CareersThemeDto;
import br.com.gommo.modules.careers.page.lib.CareersDefaultBlocks;
import br.com.gommo.modules.careers.page.lib.CareersPrivacyNotice;
import br.com.gommo.modules.careers.page.service.CareersPageService;
import br.com.gommo.modules.careers.page.service.CareersPublicAsset;
import br.com.gommo.modules.careers.site.dto.CareersApplicationRequestDto;
import br.com.gommo.modules.careers.site.dto.CareersApplicationResponseDto;
import br.com.gommo.modules.careers.site.dto.CareersBrandingDto;
import br.com.gommo.modules.careers.site.dto.CareersPrivacyDto;
import br.com.gommo.modules.careers.site.dto.CareersSiteResponseDto;
import br.com.gommo.modules.careers.site.dto.CareersVacancyResponseDto;
import br.com.gommo.modules.careers.site.dto.CareersVacancySummaryDto;
import br.com.gommo.modules.careers.site.exception.CareersSiteException;

/** Site publico de carreiras (sem login). Fala com o recrutamento apenas pelo gateway. */
@Service
public class CareersSiteService {

    /** Mesma resposta para candidatura nova e repetida: nao revela se o e-mail ja existe. */
    public static final String APPLICATION_RECEIVED_MSG = "Candidatura recebida! O recrutador vai analisar seu perfil.";

    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final long MAX_RESUME_BYTES = 10L * 1024 * 1024;
    private static final List<String> RESUME_EXTENSIONS = List.of(".pdf", ".doc", ".docx");

    private final CareersPlatformGateway platformGateway;
    private final CareersPageService pageService;

    public CareersSiteService(CareersPlatformGateway platformGateway, CareersPageService pageService) {
        this.platformGateway = platformGateway;
        this.pageService = pageService;
    }

    public CareersSiteResponseDto getSite() {
        String organizationName = platformGateway.organizationName();
        CareersPageSnapshotDto published = pageService.findPublished().orElse(null);
        CareersThemeDto theme = published == null ? null : published.getTheme();
        boolean showSalary = theme == null || !Boolean.FALSE.equals(theme.getShowSalary());

        List<CareersBlockDto> blocks = published == null
                ? fallbackBlocks(organizationName)
                : published.getBlocks().stream().filter(block -> !Boolean.FALSE.equals(block.getVisible())).toList();

        return CareersSiteResponseDto.builder()
                .organizationName(organizationName)
                .customized(published != null)
                .branding(toBranding(theme))
                .blocks(blocks)
                .vacancies(platformGateway.listPublishedVacancies().stream()
                        .map(vacancy -> toSummary(vacancy, showSalary))
                        .toList())
                .privacy(toPrivacy(published, organizationName))
                .build();
    }

    public CareersVacancyResponseDto getVacancy(String slug) {
        CareersVacancy vacancy = platformGateway.findPublishedVacancy(slug).orElseThrow(CareersSiteException::vacancyNotFound);
        String organizationName = platformGateway.organizationName();
        CareersPageSnapshotDto published = pageService.findPublished().orElse(null);
        CareersThemeDto theme = published == null ? null : published.getTheme();
        boolean showSalary = theme == null || !Boolean.FALSE.equals(theme.getShowSalary());
        return CareersVacancyResponseDto.builder()
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
                .salary(showSalary ? vacancy.getSalary() : null)
                .salaryMax(showSalary ? vacancy.getSalaryMax() : null)
                .publishedAt(vacancy.getPublishedAt())
                .expectedCompletionDate(vacancy.getExpectedCompletionDate())
                .publishGoogleJobs(vacancy.getPublishGoogleJobs() == null || Boolean.TRUE.equals(vacancy.getPublishGoogleJobs()))
                .organizationName(organizationName)
                .customized(published != null)
                .branding(toBranding(theme))
                .privacy(toPrivacy(published, organizationName))
                .build();
    }

    public CareersApplicationResponseDto apply(String slug, CareersApplicationRequestDto request, MultipartFile resume) {
        CareersVacancy vacancy = platformGateway.findPublishedVacancy(slug).orElseThrow(CareersSiteException::vacancyNotFound);

        String fullName = trimToNull(request.getFullName());
        if (fullName == null) {
            throw CareersSiteException.nameRequired();
        }
        String email = trimToNull(request.getEmail());
        if (email == null || !EMAIL.matcher(email).matches()) {
            throw CareersSiteException.emailRequired();
        }
        String phoneDigits = request.getPhone() == null ? "" : request.getPhone().replaceAll("\\D", "");
        if (phoneDigits.length() < 10 || phoneDigits.length() > 13) {
            throw CareersSiteException.phoneRequired();
        }
        if (!Boolean.TRUE.equals(request.getPrivacyConsent())) {
            throw CareersSiteException.privacyConsentRequired();
        }
        boolean hasResume = resume != null && !resume.isEmpty();
        if (hasResume) {
            validateResume(resume);
        }
        List<CareersExperience> experiences = request.getExperiences() == null ? List.of() : request.getExperiences();
        if (!hasResume && experiences.stream().noneMatch(item -> item != null && item.isComplete())) {
            throw CareersSiteException.resumeOrExperienceRequired();
        }

        CareersPageSnapshotDto published = pageService.findPublished().orElse(null);
        CareersPrivacyDto privacy = toPrivacy(published, platformGateway.organizationName());
        OffsetDateTime now = OffsetDateTime.now();
        boolean talentPool = Boolean.TRUE.equals(request.getTalentPoolConsent());

        platformGateway.submitApplication(
                CareersApplicationCommand.builder()
                        .vacancyId(vacancy.getId())
                        .companyId(vacancy.getCompanyId())
                        .vacancyTitle(vacancy.getJobTitle())
                        .fullName(fullName)
                        .email(email.toLowerCase(Locale.ROOT))
                        .phone(trimToNull(request.getPhone()))
                        .city(trimToNull(request.getCity()))
                        .stateCode(upperOrNull(request.getStateCode()))
                        .linkedinUrl(trimToNull(request.getLinkedinUrl()))
                        .portfolioUrl(trimToNull(request.getPortfolioUrl()))
                        .coverLetter(trimToNull(request.getCoverLetter()))
                        .referralSource(trimToNull(request.getReferralSource()))
                        .salaryExpectation(request.getSalaryExpectation())
                        .experiences(experiences)
                        .privacyConsentAt(now)
                        .privacyConsentVersion(privacy.getVersion())
                        .talentPoolConsentAt(talentPool ? now : null)
                        .talentPoolConsentVersion(talentPool ? privacy.getVersion() : null)
                        .talentPoolConsentUntil(talentPool ? LocalDate.now().plusMonths(privacy.getTalentPoolMonths()) : null)
                        .build(),
                resume);

        return CareersApplicationResponseDto.builder().message(APPLICATION_RECEIVED_MSG).build();
    }

    public CareersPublicAsset openAsset(UUID objectId) {
        return pageService.openPublicAsset(objectId);
    }

    private static void validateResume(MultipartFile resume) {
        String name = resume.getOriginalFilename() == null ? "" : resume.getOriginalFilename().toLowerCase(Locale.ROOT);
        boolean allowedExtension = RESUME_EXTENSIONS.stream().anyMatch(name::endsWith);
        if (!allowedExtension || resume.getSize() > MAX_RESUME_BYTES) {
            throw CareersSiteException.resumeInvalid();
        }
    }

    private static List<CareersBlockDto> fallbackBlocks(String organizationName) {
        return CareersDefaultBlocks.create(organizationName).stream()
                .filter(block -> CareersDefaultBlocks.FALLBACK_SITE_TYPES.contains(block.getType()))
                .map(block -> {
                    block.setVisible(true);
                    return block;
                })
                .toList();
    }

    private static CareersBrandingDto toBranding(CareersThemeDto theme) {
        if (theme == null) {
            return CareersBrandingDto.builder().showSalary(true).socialLinks(new LinkedHashMap<>()).build();
        }
        return CareersBrandingDto.builder()
                .displayName(theme.getDisplayName())
                .logoObjectId(theme.getLogoObjectId())
                .primaryColor(theme.getPrimaryColor())
                .accentColor(theme.getAccentColor())
                .fontStyle(theme.getFontStyle() == null ? null : theme.getFontStyle().name())
                .cornerStyle(theme.getCornerStyle() == null ? null : theme.getCornerStyle().name())
                .showSalary(!Boolean.FALSE.equals(theme.getShowSalary()))
                .seoTitle(theme.getSeoTitle())
                .seoDescription(theme.getSeoDescription())
                .socialLinks(theme.getSocialLinks() == null ? new LinkedHashMap<>() : theme.getSocialLinks())
                .build();
    }

    private static CareersPrivacyDto toPrivacy(CareersPageSnapshotDto published, String organizationName) {
        CareersThemeDto theme = published == null ? null : published.getTheme();
        String customText = theme == null ? null : theme.getPrivacyNotice();
        Integer months = theme == null ? null : theme.getTalentPoolMonths();
        return CareersPrivacyDto.builder()
                .notice(CareersPrivacyNotice.effectiveText(customText, organizationName))
                .version(CareersPrivacyNotice.versionOf(customText, published == null ? null : published.getPrivacyNoticeVersion()))
                .talentPoolMonths(months == null ? 12 : months)
                .build();
    }

    private static CareersVacancySummaryDto toSummary(CareersVacancy vacancy, boolean showSalary) {
        return CareersVacancySummaryDto.builder()
                .slug(vacancy.getSlug())
                .code(vacancy.getCode())
                .jobTitle(vacancy.getJobTitle())
                .department(vacancy.getDepartment())
                .location(vacancy.getLocation())
                .workModality(vacancy.getWorkModality())
                .contractType(vacancy.getContractType())
                .seniorityLevel(vacancy.getSeniorityLevel())
                .salary(showSalary ? vacancy.getSalary() : null)
                .salaryMax(showSalary ? vacancy.getSalaryMax() : null)
                .publishedAt(vacancy.getPublishedAt())
                .expectedCompletionDate(vacancy.getExpectedCompletionDate())
                .build();
    }

    private static String upperOrNull(String value) {
        String trimmed = trimToNull(value);
        return trimmed == null ? null : trimmed.toUpperCase(Locale.ROOT);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
