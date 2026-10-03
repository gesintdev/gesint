package br.com.gommo.modules.rh.person.jobvacancyapplication.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.mail.EmailMessage;
import br.com.gommo.core.mail.EmailSendResult;
import br.com.gommo.core.mail.EmailService;
import br.com.gommo.core.tenant.TenantContext;
import br.com.gommo.core.tenant.TenantContextHolder;
import br.com.gommo.core.util.BrazilianBusinessCalendar;
import br.com.gommo.modules.cfg.settings.notification.entity.SystemNotification;
import br.com.gommo.modules.cfg.settings.notification.repository.SystemNotificationRepository;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.entity.AdmissionProcessKanbanColumn;
import br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.repository.AdmissionProcessKanbanColumnRepository;
import br.com.gommo.modules.rh.person.candidate.entity.Candidate;
import br.com.gommo.modules.rh.person.candidate.repository.CandidateRepository;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancy;
import br.com.gommo.modules.rh.person.jobvacancy.repository.JobVacancyRepository;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplication;
import br.com.gommo.modules.rh.person.jobvacancyapplication.repository.JobVacancyApplicationRepository;
import br.com.gommo.modules.root.entity.AppUser;
import br.com.gommo.modules.root.repository.AppUserRepository;

/**
 * SLA por etapa do kanban: a partir de 2 dias uteis antes do limite, avisa recrutadores todo dia util
 * (e-mail + caixa HR). Ao estourar, envia uma vez ao candidato que o processo segue em analise.
 */
@Service
public class JobVacancyApplicationKanbanSlaReminderService {

    private static final Logger log = LoggerFactory.getLogger(JobVacancyApplicationKanbanSlaReminderService.class);
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("America/Sao_Paulo");
    private static final int REMINDER_WINDOW_BUSINESS_DAYS = 2;
    private static final String NOTIFICATION_TYPE = "KANBAN_SLA_REMINDER";
    private static final String REFERENCE_TYPE = "JOB_VACANCY_APPLICATION";

    private final JobVacancyApplicationRepository applicationRepository;
    private final AdmissionProcessKanbanColumnRepository kanbanColumnRepository;
    private final JobVacancyRepository jobVacancyRepository;
    private final CandidateRepository candidateRepository;
    private final SystemNotificationRepository notificationRepository;
    private final AppUserRepository appUserRepository;
    private final EmailService emailService;

    public JobVacancyApplicationKanbanSlaReminderService(
            JobVacancyApplicationRepository applicationRepository,
            AdmissionProcessKanbanColumnRepository kanbanColumnRepository,
            JobVacancyRepository jobVacancyRepository,
            CandidateRepository candidateRepository,
            SystemNotificationRepository notificationRepository,
            AppUserRepository appUserRepository,
            EmailService emailService) {
        this.applicationRepository = applicationRepository;
        this.kanbanColumnRepository = kanbanColumnRepository;
        this.jobVacancyRepository = jobVacancyRepository;
        this.candidateRepository = candidateRepository;
        this.notificationRepository = notificationRepository;
        this.appUserRepository = appUserRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void processDailyReminders() {
        LocalDate today = LocalDate.now(BUSINESS_ZONE);
        if (!BrazilianBusinessCalendar.isBusinessDay(today)) {
            return;
        }

        Map<String, AdmissionProcessKanbanColumn> columnsByKey = kanbanColumnRepository
                .findAllByStatusNotOrderByDisplayOrderAscNameAsc(StatusEnum.DELETED)
                .stream()
                .filter(column -> column.getColumnKey() != null && !column.getColumnKey().isBlank())
                .collect(Collectors.toMap(
                        column -> column.getColumnKey().trim().toLowerCase(),
                        Function.identity(),
                        (left, right) -> left));

        List<JobVacancyApplication> applications =
                applicationRepository.findKanbanSlaCandidates(StatusEnum.DELETED, AdmissionProcessKanbanColumn.CLOSED_COLUMN_KEY);

        for (JobVacancyApplication application : applications) {
            processApplication(application, columnsByKey, today);
        }
    }

    private void processApplication(
            JobVacancyApplication application,
            Map<String, AdmissionProcessKanbanColumn> columnsByKey,
            LocalDate today) {
        String columnKey = application.getKanbanColumnKey();
        if (columnKey == null || columnKey.isBlank()) {
            return;
        }
        AdmissionProcessKanbanColumn column = columnsByKey.get(columnKey.trim().toLowerCase());
        if (column == null || column.isSystemColumn() || !column.isSlaEnabled()) {
            return;
        }
        if (application.getKanbanColumnEnteredAt() == null) {
            application.setKanbanColumnEnteredAt(
                    application.getUpdatedAt() != null ? application.getUpdatedAt() : OffsetDateTime.now(BUSINESS_ZONE));
        }

        int slaDays = column.getSlaBusinessDays() != null ? column.getSlaBusinessDays() : 5;
        LocalDate enteredDate = application.getKanbanColumnEnteredAt().atZoneSameInstant(BUSINESS_ZONE).toLocalDate();
        int daysInStage = BrazilianBusinessCalendar.businessDaysBetweenExclusive(enteredDate, today);
        int remainingBusinessDays = slaDays - daysInStage;
        if (remainingBusinessDays > REMINDER_WINDOW_BUSINESS_DAYS) {
            return;
        }
        if (Objects.equals(application.getKanbanSlaLastReminderDate(), today)) {
            return;
        }

        JobVacancy vacancy = jobVacancyRepository.findById(application.getJobVacancyId()).orElse(null);
        Candidate candidate = candidateRepository.findById(application.getCandidateId()).orElse(null);
        if (vacancy == null || candidate == null) {
            return;
        }

        notifyRecruiters(application, vacancy, candidate, column, daysInStage, remainingBusinessDays);
        if (remainingBusinessDays <= 0) {
            notifyCandidateOnce(application, vacancy, candidate);
        }

        application.setKanbanSlaLastReminderDate(today);
        applicationRepository.save(application);
    }

    private void notifyRecruiters(
            JobVacancyApplication application,
            JobVacancy vacancy,
            Candidate candidate,
            AdmissionProcessKanbanColumn column,
            int daysInStage,
            int remainingBusinessDays) {
        LocalDate slaDueDate = BrazilianBusinessCalendar.addBusinessDays(
                application.getKanbanColumnEnteredAt().atZoneSameInstant(BUSINESS_ZONE).toLocalDate(), slaDays(column));
        String candidateName = safeName(candidate.getFullName());
        String vacancyTitle = vacancy.getJobTitle() != null ? vacancy.getJobTitle() : "Vaga";
        String columnName = column.getName() != null ? column.getName() : column.getColumnKey();
        boolean breached = remainingBusinessDays <= 0;
        String title = breached ? "SLA de etapa estourado" : "SLA de etapa proximo do limite";
        String remainingText = breached
                ? "O prazo de " + slaDays(column) + " dias uteis foi ultrapassado."
                : remainingBusinessDays == 1
                        ? "Falta 1 dia util para estourar o prazo."
                        : "Faltam " + remainingBusinessDays + " dias uteis para estourar o prazo.";
        String message = candidateName
                + " esta ha "
                + daysInStage
                + " dia(s) util(is) na etapa \""
                + columnName
                + "\" da vaga "
                + vacancyTitle
                + ". "
                + remainingText;

        notificationRepository.save(SystemNotification.builder()
                .notificationType(NOTIFICATION_TYPE)
                .title(title)
                .message(message)
                .referenceType(REFERENCE_TYPE)
                .referenceId(application.getId())
                .referenceDueDate(slaDueDate)
                .status(StatusEnum.ACTIVE)
                .build());

        String organization = TenantContextHolder.getOptional()
                .map(TenantContext::name)
                .filter(name -> name != null && !name.isBlank())
                .orElse("Gommo");
        String emailSubject = title + " - " + vacancyTitle;
        String emailBody = message + "\n\nAcesse o kanban da vaga para atualizar a etapa do candidato.\n\n" + organization;
        String html = "<div style=\"font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#1f2937\"><p>"
                + HtmlUtils.htmlEscape(emailBody).replace("\n\n", "</p><p>").replace("\n", "<br>")
                + "</p></div>";

        List<AppUser> recipients = appUserRepository.findRecruitingNotificationRecipients(StatusEnum.DELETED);
        for (AppUser user : recipients) {
            if (user.getEmail() == null || user.getEmail().isBlank()) {
                continue;
            }
            EmailSendResult result = emailService.send(EmailMessage.html(user.getEmail(), emailSubject, emailBody, html));
            if (!result.isSent()) {
                log.warn(
                        "Kanban SLA e-mail nao enviado para {} (application={}): {}",
                        user.getEmail(),
                        application.getId(),
                        result.detail());
            }
        }
    }

    private void notifyCandidateOnce(JobVacancyApplication application, JobVacancy vacancy, Candidate candidate) {
        if (application.getKanbanSlaCandidateNotifiedAt() != null) {
            return;
        }
        if (candidate.getEmail() == null || candidate.getEmail().isBlank()) {
            return;
        }
        String vacancyTitle = vacancy.getJobTitle() != null ? vacancy.getJobTitle() : "a vaga";
        String organization = TenantContextHolder.getOptional()
                .map(TenantContext::name)
                .filter(name -> name != null && !name.isBlank())
                .orElse("nossa empresa");
        String firstName = firstName(candidate.getFullName());
        String subject = "Atualizacao do seu processo seletivo - " + vacancyTitle;
        String text = "Ola, "
                + firstName
                + ".\n\nSeu processo seletivo para a vaga "
                + vacancyTitle
                + " na "
                + organization
                + " segue em analise.\n\nAssim que houver novidades, entraremos em contato.\n\n"
                + organization;
        String html = "<div style=\"font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#1f2937\"><p>"
                + HtmlUtils.htmlEscape(text).replace("\n\n", "</p><p>").replace("\n", "<br>")
                + "</p></div>";
        EmailSendResult result = emailService.send(EmailMessage.html(candidate.getEmail(), subject, text, html));
        if (result.isSent()) {
            application.setKanbanSlaCandidateNotifiedAt(OffsetDateTime.now(BUSINESS_ZONE));
        } else {
            log.warn(
                    "Kanban SLA follow-up nao enviado ao candidato {} (application={}): {}",
                    candidate.getEmail(),
                    application.getId(),
                    result.detail());
        }
    }

    private static int slaDays(AdmissionProcessKanbanColumn column) {
        return column.getSlaBusinessDays() != null ? column.getSlaBusinessDays() : 5;
    }

    private static String safeName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "Candidato";
        }
        return fullName.trim();
    }

    private static String firstName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "candidato(a)";
        }
        return fullName.trim().split("\\s+")[0];
    }
}
