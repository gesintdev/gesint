package br.com.gesint.modules.rh.person.jobvacancyapplication.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.util.HtmlUtils;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.core.mail.EmailMessage;
import br.com.gesint.core.mail.EmailSendResult;
import br.com.gesint.core.mail.EmailService;
import br.com.gesint.core.tenant.TenantContext;
import br.com.gesint.core.tenant.TenantContextHolder;
import br.com.gesint.modules.rh.person.candidate.entity.Candidate;
import br.com.gesint.modules.rh.person.candidate.repository.CandidateRepository;
import br.com.gesint.modules.rh.person.jobvacancy.entity.JobVacancy;
import br.com.gesint.modules.rh.person.jobvacancy.repository.JobVacancyRepository;
import br.com.gesint.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplication;
import br.com.gesint.modules.rh.person.jobvacancyapplication.entity.RejectionFeedbackStatusEnum;
import br.com.gesint.modules.rh.person.jobvacancyapplication.repository.JobVacancyApplicationRepository;

/**
 * Retorno automatico ao candidato reprovado (RN-05). O texto e neutro: nunca expoe o motivo interno da
 * reprovacao.
 */
@Service
public class JobVacancyApplicationRejectionFeedbackService {

    private static final DateTimeFormatter DATE_BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final int DETAIL_MAX = 500;

    private final JobVacancyApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final JobVacancyRepository jobVacancyRepository;
    private final EmailService emailService;
    private final TransactionTemplate transactionTemplate;

    public JobVacancyApplicationRejectionFeedbackService(
            JobVacancyApplicationRepository applicationRepository,
            CandidateRepository candidateRepository,
            JobVacancyRepository jobVacancyRepository,
            EmailService emailService,
            TransactionTemplate transactionTemplate) {
        this.applicationRepository = applicationRepository;
        this.candidateRepository = candidateRepository;
        this.jobVacancyRepository = jobVacancyRepository;
        this.emailService = emailService;
        this.transactionTemplate = transactionTemplate;
    }

    @Async("mailExecutor")
    public void sendAsync(UUID applicationId) {
        EmailMessage message = transactionTemplate.execute(status -> buildMessage(applicationId));
        if (message == null) {
            return;
        }
        EmailSendResult result = emailService.send(message);
        transactionTemplate.executeWithoutResult(status -> applyResult(applicationId, result));
    }

    private EmailMessage buildMessage(UUID applicationId) {
        JobVacancyApplication application = applicationRepository
                .findByIdAndStatusNot(applicationId, StatusEnum.DELETED)
                .orElse(null);
        if (application == null || application.getRejectionFeedbackStatus() != RejectionFeedbackStatusEnum.PENDING) {
            return null;
        }
        Candidate candidate = candidateRepository.findById(application.getCandidateId()).orElse(null);
        if (candidate == null || candidate.getEmail() == null || candidate.getEmail().isBlank()) {
            markFailed(application, "Candidato sem e-mail cadastrado.");
            return null;
        }
        JobVacancy vacancy = jobVacancyRepository.findById(application.getJobVacancyId()).orElse(null);
        String vacancyTitle = vacancy != null && vacancy.getJobTitle() != null ? vacancy.getJobTitle() : "a vaga";
        String organization = TenantContextHolder.getOptional()
                .map(TenantContext::name)
                .filter(name -> name != null && !name.isBlank())
                .orElse("nossa empresa");
        String firstName = firstName(candidate.getFullName());
        LocalDate talentPoolUntil = application.getTalentPoolConsentUntil();
        boolean inTalentPool = talentPoolUntil != null && !talentPoolUntil.isBefore(LocalDate.now());

        String subject = "Atualização da sua candidatura - " + vacancyTitle;
        StringBuilder text = new StringBuilder()
                .append("Olá, ").append(firstName).append(".\n\n")
                .append("Agradecemos seu interesse na vaga ").append(vacancyTitle).append(" na ").append(organization)
                .append(" e o tempo dedicado ao nosso processo seletivo.\n\n")
                .append("Após análise, decidimos não seguir com a sua candidatura nesta vaga.");
        if (inTalentPool) {
            text.append("\n\nConforme sua autorização, seu currículo continuará em nosso banco de talentos até ")
                    .append(talentPoolUntil.format(DATE_BR))
                    .append(" e poderá ser considerado em novas oportunidades.");
        }
        text.append("\n\nDesejamos sucesso na sua trajetória.\n\n").append(organization);

        String html = "<div style=\"font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#1f2937\">"
                + HtmlUtils.htmlEscape(text.toString()).replace("\n\n", "</p><p>").replace("\n", "<br>")
                        .transform(body -> "<p>" + body + "</p>")
                + "</div>";
        return EmailMessage.html(candidate.getEmail(), subject, text.toString(), html);
    }

    private void applyResult(UUID applicationId, EmailSendResult result) {
        applicationRepository.findByIdAndStatusNot(applicationId, StatusEnum.DELETED).ifPresent(application -> {
            if (application.getRejectionFeedbackStatus() != RejectionFeedbackStatusEnum.PENDING) {
                return;
            }
            if (result.isSent()) {
                application.setRejectionFeedbackStatus(RejectionFeedbackStatusEnum.SENT);
                application.setRejectionFeedbackAt(OffsetDateTime.now());
                application.setRejectionFeedbackDetail(null);
                applicationRepository.save(application);
            } else {
                markFailed(application, result.detail());
            }
        });
    }

    private void markFailed(JobVacancyApplication application, String detail) {
        application.setRejectionFeedbackStatus(RejectionFeedbackStatusEnum.FAILED);
        application.setRejectionFeedbackAt(OffsetDateTime.now());
        String safe = detail == null ? "Falha no envio." : detail;
        application.setRejectionFeedbackDetail(safe.length() > DETAIL_MAX ? safe.substring(0, DETAIL_MAX) : safe);
        applicationRepository.save(application);
    }

    private static String firstName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "candidato(a)";
        }
        return fullName.trim().split("\\s+")[0];
    }
}
