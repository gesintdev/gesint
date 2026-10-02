package br.com.gommo.core.mail;

import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.Properties;
import java.util.function.Consumer;

import jakarta.mail.internet.MimeMessage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import br.com.gommo.core.security.SecretEncryptionService;

/**
 * Disparo central de e-mails. Usa a conta SMTP da Gesint configurada no Admin; sem ela, recorre ao
 * {@code spring.mail.*} da aplicacao, quando existir.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final int TIMEOUT_MS = 15_000;
    private static final int DETAIL_MAX = 500;

    private final JdbcPlatformEmailSettingsLookup settingsLookup;
    private final SecretEncryptionService secretEncryptionService;
    private final ObjectProvider<JavaMailSender> fallbackSenderProvider;

    @Value("${spring.mail.username:}")
    private String fallbackFrom;

    public EmailService(
            JdbcPlatformEmailSettingsLookup settingsLookup,
            SecretEncryptionService secretEncryptionService,
            ObjectProvider<JavaMailSender> fallbackSenderProvider) {
        this.settingsLookup = settingsLookup;
        this.secretEncryptionService = secretEncryptionService;
        this.fallbackSenderProvider = fallbackSenderProvider;
    }

    public boolean isConfigured() {
        return settingsLookup.findEnabled().isPresent() || fallbackAvailable();
    }

    /** Envia imediatamente; nunca lanca excecao, o resultado indica sucesso ou falha. */
    public EmailSendResult send(EmailMessage message) {
        if (message.to() == null || message.to().isBlank()) {
            return EmailSendResult.failed("Destinatário sem e-mail.");
        }
        Optional<PlatformEmailSettings> settings = settingsLookup.findEnabled();
        try {
            if (settings.isPresent()) {
                PlatformEmailSettings cfg = settings.get();
                JavaMailSenderImpl sender = buildSender(cfg);
                sender.send(buildMime(sender, message, cfg.resolvedFrom(), cfg.fromName(), cfg.replyTo()));
                return EmailSendResult.sent();
            }
            if (fallbackAvailable()) {
                JavaMailSender sender = fallbackSenderProvider.getObject();
                sender.send(buildMime(sender, message, fallbackFrom, null, null));
                return EmailSendResult.sent();
            }
            log.warn("Mail not configured. Skipping email '{}' to {}", message.subject(), message.to());
            return EmailSendResult.notConfigured();
        } catch (Exception ex) {
            log.error("Failed to send email '{}' to {}", message.subject(), message.to(), ex);
            String detail = ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage();
            return EmailSendResult.failed(detail.length() > DETAIL_MAX ? detail.substring(0, DETAIL_MAX) : detail);
        }
    }

    /**
     * Agenda o envio para depois do commit da transacao corrente (ou envia na hora, se nao houver transacao),
     * para que um rollback nao dispare e-mail de algo que nao aconteceu.
     */
    public void sendAfterCommit(EmailMessage message, Consumer<EmailSendResult> onResult) {
        Runnable task = () -> {
            EmailSendResult result = send(message);
            if (onResult != null) {
                try {
                    onResult.accept(result);
                } catch (Exception ex) {
                    log.error("Email result callback failed for '{}'", message.subject(), ex);
                }
            }
        };
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    task.run();
                }
            });
            return;
        }
        task.run();
    }

    private boolean fallbackAvailable() {
        return fallbackFrom != null && !fallbackFrom.isBlank() && fallbackSenderProvider.getIfAvailable() != null;
    }

    private MimeMessage buildMime(
            JavaMailSender sender, EmailMessage message, String from, String fromName, String replyTo)
            throws Exception {
        var mime = sender.createMimeMessage();
        boolean multipart = !message.attachments().isEmpty() || message.htmlBody() != null;
        var helper = new MimeMessageHelper(mime, multipart, StandardCharsets.UTF_8.name());
        if (fromName != null && !fromName.isBlank()) {
            helper.setFrom(from, fromName);
        } else {
            helper.setFrom(from);
        }
        if (replyTo != null && !replyTo.isBlank()) {
            helper.setReplyTo(replyTo);
        }
        helper.setTo(message.to().trim());
        helper.setSubject(message.subject());
        String text = message.textBody() == null ? "" : message.textBody();
        if (message.htmlBody() != null) {
            helper.setText(text, message.htmlBody());
        } else {
            helper.setText(text, false);
        }
        for (EmailMessage.Attachment attachment : message.attachments()) {
            helper.addAttachment(
                    attachment.filename(), new ByteArrayResource(attachment.content()), attachment.contentType());
        }
        return mime;
    }

    private JavaMailSenderImpl buildSender(PlatformEmailSettings cfg) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(cfg.host());
        sender.setPort(cfg.port());
        sender.setUsername(cfg.username());
        if (cfg.passwordEncrypted() != null) {
            sender.setPassword(secretEncryptionService.decryptString(cfg.passwordEncrypted()));
        }
        sender.setDefaultEncoding(StandardCharsets.UTF_8.name());
        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", String.valueOf(cfg.username() != null));
        props.put("mail.smtp.connectiontimeout", String.valueOf(TIMEOUT_MS));
        props.put("mail.smtp.timeout", String.valueOf(TIMEOUT_MS));
        props.put("mail.smtp.writetimeout", String.valueOf(TIMEOUT_MS));
        switch (cfg.security() == null ? "STARTTLS" : cfg.security()) {
            case "SSL" -> props.put("mail.smtp.ssl.enable", "true");
            case "NONE" -> { }
            default -> {
                props.put("mail.smtp.starttls.enable", "true");
                props.put("mail.smtp.starttls.required", "true");
            }
        }
        return sender;
    }
}
