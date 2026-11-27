package br.com.gesint.modules.gp.notification.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.core.mail.EmailMessage;
import br.com.gesint.core.mail.EmailService;
import br.com.gesint.core.tenant.TenantContext;
import br.com.gesint.core.tenant.TenantContextHolder;
import br.com.gesint.modules.cfg.settings.notification.service.SystemNotificationService;
import br.com.gesint.modules.gp.attendance.domain.AttendanceAlertEnum;
import br.com.gesint.modules.gp.attendance.domain.AttendanceDayEvaluation;
import br.com.gesint.modules.gp.attendance.domain.AttendanceDayStatusEnum;
import br.com.gesint.modules.gp.attendance.domain.AttendanceTimeFormat;
import br.com.gesint.modules.gp.attendance.domain.CollaboratorPeriodEvaluation;
import br.com.gesint.modules.gp.attendance.repository.AttendanceRequestRepository;
import br.com.gesint.modules.gp.attendance.service.AttendanceEvaluationService;
import br.com.gesint.modules.gp.settings.dto.TimeTrackingSettings;
import br.com.gesint.modules.gp.settings.service.TimeTrackingSettingsService;
import br.com.gesint.modules.rh.person.collaborators.people.repository.CollaboratorContactRepository;
import br.com.gesint.modules.root.entity.AppUser;
import br.com.gesint.modules.root.repository.AppUserRepository;

/**
 * Saude do ponto: avisa o colaborador (sino e e-mail) sobre o dia anterior com pendencia ou limite
 * da CLT estourado, manda ao RH um resumo por filial e, durante o dia, avisa quem esta perto de
 * 10 horas trabalhadas ou de 6 horas sem intervalo. Roda pelos jobs, sem usuario logado.
 */
@Service
public class AttendanceHealthService {

    public static final String HEALTH_DAY = "ATTENDANCE_HEALTH_DAY";
    public static final String HEALTH_SUMMARY = "ATTENDANCE_HEALTH_SUMMARY";
    public static final String NEAR_10_HOURS = "ATTENDANCE_NEAR_10_HOURS";
    public static final String NEAR_6_HOURS_NO_BREAK = "ATTENDANCE_NEAR_6_HOURS_NO_BREAK";
    public static final String REF_DAY = "ATTENDANCE_DAY";
    public static final String REF_HEALTH = "ATTENDANCE_HEALTH";

    private static final Logger log = LoggerFactory.getLogger(AttendanceHealthService.class);
    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final UUID NO_BRANCH = new UUID(0L, 0L);
    private static final int NEAR_10_HOURS_FROM = 9 * 60 + 30;
    private static final int NEAR_6_HOURS_FROM = 5 * 60 + 30;

    private final AttendanceEvaluationService evaluationService;
    private final TimeTrackingSettingsService settingsService;
    private final SystemNotificationService notificationService;
    private final AttendanceRequestRepository requestRepository;
    private final AppUserRepository appUserRepository;
    private final CollaboratorContactRepository contactRepository;
    private final EmailService emailService;

    public AttendanceHealthService(
            AttendanceEvaluationService evaluationService,
            TimeTrackingSettingsService settingsService,
            SystemNotificationService notificationService,
            AttendanceRequestRepository requestRepository,
            AppUserRepository appUserRepository,
            CollaboratorContactRepository contactRepository,
            EmailService emailService) {
        this.evaluationService = evaluationService;
        this.settingsService = settingsService;
        this.notificationService = notificationService;
        this.requestRepository = requestRepository;
        this.appUserRepository = appUserRepository;
        this.contactRepository = contactRepository;
        this.emailService = emailService;
    }

    /** Resumo do dia anterior (job diario). Devolve quantos colaboradores tiveram aviso. */
    @Transactional
    public int processDailyHealth(LocalDate day) {
        TimeTrackingSettings settings = settingsService.current();
        if (!settings.isNotifyCollaborator() && !settings.isNotifyHr()
                && !settings.isEmailCollaborator() && !settings.isEmailHrDigest()) {
            return 0;
        }
        List<CollaboratorPeriodEvaluation> evaluations = evaluationService.evaluate(day, day, null, settings);
        Map<UUID, List<String[]>> issuesByBranch = new LinkedHashMap<>();
        Map<UUID, int[]> countsByBranch = new HashMap<>();
        int notified = 0;
        for (CollaboratorPeriodEvaluation evaluation : evaluations) {
            AttendanceDayEvaluation evaluated = evaluation.getDays().isEmpty() ? null : evaluation.getDays().get(0);
            List<String> issues = evaluated != null ? issues(evaluated) : List.of();
            if (issues.isEmpty()) {
                continue;
            }
            UUID branch = evaluation.getCompanyId() != null ? evaluation.getCompanyId() : NO_BRANCH;
            issuesByBranch.computeIfAbsent(branch, key -> new ArrayList<>())
                    .add(new String[] {evaluation.getCollaboratorName(), String.join("; ", issues)});
            int[] counts = countsByBranch.computeIfAbsent(branch, key -> new int[4]);
            counts[0] += evaluated.getStatus() == AttendanceDayStatusEnum.MISSING ? 1 : 0;
            counts[1] += evaluated.getStatus() == AttendanceDayStatusEnum.INCOMPLETE ? 1 : 0;
            counts[2] += evaluated.hasAlert(AttendanceAlertEnum.OVER_10_HOURS) ? 1 : 0;
            counts[3] += evaluated.hasAlert(AttendanceAlertEnum.SHORT_INTERJOURNEY) ? 1 : 0;

            AppUser user = appUserRepository
                    .findFirstByCollaboratorIdAndStatusNot(evaluation.getCollaboratorId(), StatusEnum.DELETED)
                    .orElse(null);
            String title = "Seu ponto de " + DAY.format(day) + " precisa de atenção";
            String message = String.join("; ", issues) + ". Confira o registro e peça o ajuste, se for o caso.";
            if (settings.isNotifyCollaborator() && user != null) {
                notificationService.publish(HEALTH_DAY, REF_DAY, evaluation.getCollaboratorId(), day,
                        title, message, user.getId(), evaluation.getCompanyId());
            }
            if (settings.isEmailCollaborator()) {
                String email = collaboratorEmail(evaluation.getCollaboratorId(), user);
                if (email != null) {
                    sendCollaboratorEmail(email, evaluation.getCollaboratorName(), day, issues);
                }
            }
            notified++;
        }

        long pendingRequests = requestRepository
                .findByRequestStatusAndStatusNotOrderBySubmittedAtDesc("PENDING", StatusEnum.DELETED)
                .size();
        for (Map.Entry<UUID, List<String[]>> entry : issuesByBranch.entrySet()) {
            int[] counts = countsByBranch.get(entry.getKey());
            String summary = summaryText(entry.getValue().size(), counts, pendingRequests);
            if (settings.isNotifyHr()) {
                notificationService.publish(HEALTH_SUMMARY, REF_HEALTH, entry.getKey(), day,
                        "Saúde do ponto em " + DAY.format(day), summary, null,
                        NO_BRANCH.equals(entry.getKey()) ? null : entry.getKey());
            }
        }
        if (settings.isEmailHrDigest() && !issuesByBranch.isEmpty()) {
            List<String> recipients = TimeTrackingSettingsService.recipients(settings.getHrDigestRecipients());
            List<String[]> allIssues = issuesByBranch.values().stream().flatMap(List::stream).toList();
            int[] total = new int[4];
            countsByBranch.values().forEach(counts -> {
                for (int i = 0; i < 4; i++) {
                    total[i] += counts[i];
                }
            });
            for (String recipient : recipients) {
                sendHrDigest(recipient, day, allIssues, summaryText(allIssues.size(), total, pendingRequests));
            }
        }
        return notified;
    }

    /** Disparo manual pelo RH (Preferencias de ponto): roda o resumo do dia informado agora. */
    @Transactional
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('attendance:write')")
    public int runNow(LocalDate day) {
        return processDailyHealth(day != null ? day : evaluationService.today().minusDays(1));
    }

    /** Aviso preventivo durante o dia (job de alguns em alguns minutos). */
    @Transactional
    public int processNearLimits() {
        TimeTrackingSettings settings = settingsService.current();
        if (!settings.isNotifyNearLimits()) {
            return 0;
        }
        LocalDate today = evaluationService.today();
        LocalTime now = LocalTime.now(AttendanceEvaluationService.BUSINESS_ZONE);
        int sent = 0;
        for (CollaboratorPeriodEvaluation evaluation : evaluationService.evaluate(today, today, null, settings)) {
            for (AttendanceDayEvaluation day : evaluation.getDays()) {
                if (day.getStatus() != AttendanceDayStatusEnum.IN_PROGRESS) {
                    continue;
                }
                UUID userId = appUserRepository
                        .findFirstByCollaboratorIdAndStatusNot(evaluation.getCollaboratorId(), StatusEnum.DELETED)
                        .map(AppUser::getId)
                        .orElse(null);
                if (userId == null) {
                    continue;
                }
                int worked = day.getWorkedMinutes();
                if (worked >= NEAR_10_HOURS_FROM && worked < 10 * 60) {
                    notificationService.publish(NEAR_10_HOURS, REF_DAY, evaluation.getCollaboratorId(), today,
                            "Você está perto de 10 horas de trabalho",
                            "Hoje você já trabalhou " + AttendanceTimeFormat.duration(worked)
                                    + ". A CLT limita a jornada a 10 horas por dia.",
                            userId, evaluation.getCompanyId());
                    sent++;
                }
                boolean onBreak = day.getBreakStart() != null && day.getBreakEnd() == null;
                int block = continuousBlock(day, now);
                if (!onBreak && block >= NEAR_6_HOURS_FROM && block < 6 * 60) {
                    notificationService.publish(NEAR_6_HOURS_NO_BREAK, REF_DAY, evaluation.getCollaboratorId(), today,
                            "Hora de fazer o intervalo",
                            "Você está há " + AttendanceTimeFormat.duration(block)
                                    + " sem intervalo. Acima de 6 horas seguidas, a CLT exige pausa de pelo menos 1 hora.",
                            userId, evaluation.getCompanyId());
                    sent++;
                }
            }
        }
        return sent;
    }

    static List<String> issues(AttendanceDayEvaluation day) {
        List<String> issues = new ArrayList<>();
        if (day.getStatus() == AttendanceDayStatusEnum.MISSING) {
            issues.add("dia de trabalho sem nenhuma marcação");
        }
        if (day.getStatus() == AttendanceDayStatusEnum.INCOMPLETE) {
            issues.add("marcação incompleta (falta entrada, saída ou volta do intervalo)");
        }
        if (day.hasAlert(AttendanceAlertEnum.OVER_10_HOURS)) {
            issues.add("jornada de " + AttendanceTimeFormat.duration(day.getWorkedMinutes()) + ", acima de 10 horas");
        }
        if (day.hasAlert(AttendanceAlertEnum.NO_BREAK)) {
            issues.add("jornada acima de 6 horas sem intervalo");
        } else if (day.hasAlert(AttendanceAlertEnum.SHORT_BREAK)) {
            issues.add("intervalo de " + AttendanceTimeFormat.duration(day.getBreakMinutes()) + ", menor que 1 hora");
        }
        if (day.hasAlert(AttendanceAlertEnum.SHORT_INTERJOURNEY) && day.getRestBeforeMinutes() != null) {
            issues.add("descanso de " + AttendanceTimeFormat.duration(day.getRestBeforeMinutes())
                    + " desde a jornada anterior, menor que 11 horas");
        }
        return issues;
    }

    private static String summaryText(int people, int[] counts, long pendingRequests) {
        List<String> parts = new ArrayList<>();
        if (counts[0] > 0) {
            parts.add(counts[0] + " sem registro");
        }
        if (counts[1] > 0) {
            parts.add(counts[1] + " com marcação incompleta");
        }
        if (counts[2] > 0) {
            parts.add(counts[2] + " acima de 10 horas");
        }
        if (counts[3] > 0) {
            parts.add(counts[3] + " com descanso menor que 11 horas");
        }
        String head = people == 1 ? "1 colaborador precisa de atenção" : people + " colaboradores precisam de atenção";
        String detail = parts.isEmpty() ? "" : ": " + String.join(", ", parts);
        String pending = pendingRequests == 0 ? ""
                : (pendingRequests == 1 ? ". 1 ajuste aguarda decisão" : ". " + pendingRequests + " ajustes aguardam decisão");
        return head + detail + pending + ".";
    }

    private static int continuousBlock(AttendanceDayEvaluation day, LocalTime now) {
        if (day.getClockIn() == null) {
            return 0;
        }
        LocalTime start = day.getBreakEnd() != null ? day.getBreakEnd() : day.getClockIn();
        if (day.getBreakStart() != null && day.getBreakEnd() == null) {
            return 0;
        }
        long minutes = java.time.Duration.between(start, now).toMinutes();
        return minutes < 0 ? (int) minutes + 24 * 60 : (int) minutes;
    }

    private String collaboratorEmail(UUID collaboratorId, AppUser user) {
        if (user != null && user.getEmail() != null && user.getEmail().contains("@")) {
            return user.getEmail();
        }
        return contactRepository
                .findFirstByCollaboratorIdAndPrimaryContactTrueAndStatusNot(collaboratorId, StatusEnum.DELETED)
                .map(contact -> contact.getEmail())
                .filter(email -> email != null && email.contains("@"))
                .orElse(null);
    }

    private void sendCollaboratorEmail(String to, String name, LocalDate day, List<String> issues) {
        String firstName = name != null ? name.trim().split("\\s+")[0] : "";
        String subject = "Seu ponto de " + DAY.format(day) + " precisa de atenção";
        StringBuilder text = new StringBuilder("Olá, " + firstName + ".\n\nNo dia " + DAY.format(day)
                + ", o seu registro de ponto teve:\n");
        issues.forEach(issue -> text.append("- ").append(issue).append('\n'));
        text.append("\nConfira o registro no ").append(organization())
                .append(" e, se algo estiver errado, peça o ajuste ao RH pelo aplicativo ou pelo Gesint.\n");
        StringBuilder items = new StringBuilder();
        issues.forEach(issue -> items.append("<li style=\"margin:0 0 6px\">").append(HtmlUtils.htmlEscape(issue)).append("</li>"));
        String html = layout(subject,
                "<p style=\"margin:0 0 12px\">Olá, " + HtmlUtils.htmlEscape(firstName) + ".</p>"
                        + "<p style=\"margin:0 0 12px\">No dia <strong>" + DAY.format(day)
                        + "</strong>, o seu registro de ponto teve:</p>"
                        + "<ul style=\"margin:0 0 16px;padding-left:18px\">" + items + "</ul>"
                        + "<p style=\"margin:0\">Confira o registro e, se algo estiver errado, peça o ajuste ao RH "
                        + "pelo aplicativo ou pelo Gesint.</p>");
        send(to, subject, text.toString(), html);
    }

    private void sendHrDigest(String to, LocalDate day, List<String[]> rows, String summary) {
        String subject = "Saúde do ponto em " + DAY.format(day);
        StringBuilder text = new StringBuilder(summary + "\n\n");
        StringBuilder table = new StringBuilder();
        for (String[] row : rows) {
            text.append("- ").append(row[0]).append(": ").append(row[1]).append('\n');
            table.append("<tr><td style=\"padding:8px 10px;border-bottom:1px solid #e2e8f0;font-weight:600;vertical-align:top\">")
                    .append(HtmlUtils.htmlEscape(row[0] != null ? row[0] : "-"))
                    .append("</td><td style=\"padding:8px 10px;border-bottom:1px solid #e2e8f0;color:#475569\">")
                    .append(HtmlUtils.htmlEscape(row[1]))
                    .append("</td></tr>");
        }
        String html = layout(subject,
                "<p style=\"margin:0 0 16px\">" + HtmlUtils.htmlEscape(summary) + "</p>"
                        + "<table style=\"width:100%;border-collapse:collapse;font-size:13px\">"
                        + "<thead><tr><th style=\"text-align:left;padding:8px 10px;background:#f8fafc;color:#64748b;font-size:12px\">Colaborador</th>"
                        + "<th style=\"text-align:left;padding:8px 10px;background:#f8fafc;color:#64748b;font-size:12px\">O que aconteceu</th></tr></thead>"
                        + "<tbody>" + table + "</tbody></table>"
                        + "<p style=\"margin:16px 0 0;color:#64748b;font-size:12px\">Abra a Gestão de Ponto no Gesint para ver "
                        + "o painel completo e resolver as pendências.</p>");
        send(to, subject, text.toString(), html);
    }

    private void send(String to, String subject, String text, String html) {
        try {
            emailService.send(EmailMessage.html(to, subject, text, html));
        } catch (RuntimeException ex) {
            log.warn("Falha ao enviar e-mail de saude do ponto: {}", ex.getMessage());
        }
    }

    private String organization() {
        return TenantContextHolder.getOptional()
                .map(TenantContext::name)
                .filter(name -> name != null && !name.isBlank())
                .orElse("Gesint");
    }

    private String layout(String title, String body) {
        return "<div style=\"background:#f3f7f8;padding:24px 12px;font-family:'Segoe UI',Arial,sans-serif;color:#1e293b\">"
                + "<div style=\"max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden\">"
                + "<div style=\"border-left:4px solid #007bff;padding:16px 20px;background:#f8fafc\">"
                + "<div style=\"font-size:12px;color:#64748b;margin-bottom:4px\">Gestão de Ponto · " + HtmlUtils.htmlEscape(organization()) + "</div>"
                + "<div style=\"font-size:17px;font-weight:600\">" + HtmlUtils.htmlEscape(title) + "</div></div>"
                + "<div style=\"padding:20px;font-size:14px;line-height:1.6\">" + body + "</div></div>"
                + "<div style=\"max-width:560px;margin:10px auto 0;font-size:11px;color:#94a3b8;text-align:center\">"
                + "Aviso automático do Gesint. Para deixar de receber, peça ao RH para ajustar as preferências de ponto.</div></div>";
    }
}
