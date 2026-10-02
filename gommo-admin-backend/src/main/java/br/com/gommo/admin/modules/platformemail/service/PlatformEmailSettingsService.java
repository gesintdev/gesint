package br.com.gommo.admin.modules.platformemail.service;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Properties;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.core.security.SecretEncryptionService;
import br.com.gommo.admin.modules.platformemail.dto.PlatformEmailSettingsRequestDto;
import br.com.gommo.admin.modules.platformemail.dto.PlatformEmailSettingsResponseDto;
import br.com.gommo.admin.modules.platformemail.entity.PlatformEmailSecurityEnum;
import br.com.gommo.admin.modules.platformemail.entity.PlatformEmailSettings;
import br.com.gommo.admin.modules.platformemail.exception.PlatformEmailSettingsException;
import br.com.gommo.admin.modules.platformemail.repository.PlatformEmailSettingsRepository;

/** Configuracao SMTP unica da Gesint, lida pelo Client para todos os disparos de e-mail. */
@Service
public class PlatformEmailSettingsService {

    private static final Logger log = LoggerFactory.getLogger(PlatformEmailSettingsService.class);
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final int TIMEOUT_MS = 15_000;

    private final PlatformEmailSettingsRepository repository;
    private final SecretEncryptionService secretEncryptionService;

    public PlatformEmailSettingsService(
            PlatformEmailSettingsRepository repository, SecretEncryptionService secretEncryptionService) {
        this.repository = repository;
        this.secretEncryptionService = secretEncryptionService;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('platform:admin')")
    public PlatformEmailSettingsResponseDto get() {
        return repository
                .findFirstByStatusNotOrderByCreatedAtAsc(StatusEnum.DELETED)
                .map(this::toResponse)
                .orElseGet(PlatformEmailSettingsService::defaults);
    }

    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public PlatformEmailSettingsResponseDto save(PlatformEmailSettingsRequestDto request) {
        PlatformEmailSettings entity = repository
                .findFirstByStatusNotOrderByCreatedAtAsc(StatusEnum.DELETED)
                .orElseGet(() -> PlatformEmailSettings.builder()
                        .status(StatusEnum.ACTIVE)
                        .security(PlatformEmailSecurityEnum.STARTTLS)
                        .build());

        entity.setHost(trimToNull(request.getHost()));
        entity.setPort(request.getPort());
        entity.setSecurity(request.getSecurity() == null ? PlatformEmailSecurityEnum.STARTTLS : request.getSecurity());
        entity.setUsername(trimToNull(request.getUsername()));
        entity.setFromAddress(trimToNull(request.getFromAddress()));
        entity.setFromName(trimToNull(request.getFromName()));
        entity.setReplyTo(trimToNull(request.getReplyTo()));
        if (request.isClearPassword()) {
            entity.setPasswordEncrypted(null);
        } else if (request.getPassword() != null && !request.getPassword().isBlank()) {
            // Senha de app do Gmail e exibida em blocos com espacos; o SMTP espera sem espacos.
            entity.setPasswordEncrypted(secretEncryptionService.encryptString(request.getPassword().replace(" ", "")));
        }
        entity.setEnabled(request.isEnabled());

        validate(entity);
        return toResponse(repository.save(entity));
    }

    @Transactional
    @PreAuthorize("hasAuthority('platform:admin')")
    public PlatformEmailSettingsResponseDto sendTest(String to) {
        PlatformEmailSettings entity = repository
                .findFirstByStatusNotOrderByCreatedAtAsc(StatusEnum.DELETED)
                .orElseThrow(PlatformEmailSettingsException::notConfigured);
        requireConnectionFields(entity);

        entity.setLastTestAt(OffsetDateTime.now());
        try {
            JavaMailSenderImpl sender = buildSender(entity);
            var message = sender.createMimeMessage();
            var helper = new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
            helper.setFrom(resolveFrom(entity), entity.getFromName() == null ? "Gesint" : entity.getFromName());
            if (entity.getReplyTo() != null) {
                helper.setReplyTo(entity.getReplyTo());
            }
            helper.setTo(to.trim());
            helper.setSubject("Teste de envio - Gesint");
            helper.setText(
                    "Este e-mail confirma que a configuração SMTP da Gesint está funcionando.\n\n"
                            + "Servidor: " + entity.getHost() + ":" + entity.getPort() + " (" + entity.getSecurity() + ")",
                    false);
            sender.send(message);
            entity.setLastTestSuccess(true);
            entity.setLastTestMessage("E-mail de teste enviado para " + to.trim());
        } catch (Exception ex) {
            log.warn("Platform email test failed: {}", ex.getMessage());
            entity.setLastTestSuccess(false);
            entity.setLastTestMessage(truncate(describeFailure(ex), 500));
        }
        return toResponse(repository.save(entity));
    }

    private JavaMailSenderImpl buildSender(PlatformEmailSettings entity) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(entity.getHost());
        sender.setPort(entity.getPort());
        sender.setUsername(entity.getUsername());
        if (entity.getPasswordEncrypted() != null) {
            sender.setPassword(secretEncryptionService.decryptString(entity.getPasswordEncrypted()));
        }
        sender.setDefaultEncoding(StandardCharsets.UTF_8.name());
        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", String.valueOf(entity.getUsername() != null));
        props.put("mail.smtp.connectiontimeout", String.valueOf(TIMEOUT_MS));
        props.put("mail.smtp.timeout", String.valueOf(TIMEOUT_MS));
        props.put("mail.smtp.writetimeout", String.valueOf(TIMEOUT_MS));
        switch (entity.getSecurity()) {
            case STARTTLS -> {
                props.put("mail.smtp.starttls.enable", "true");
                props.put("mail.smtp.starttls.required", "true");
            }
            case SSL -> props.put("mail.smtp.ssl.enable", "true");
            case NONE -> { }
        }
        return sender;
    }

    private void validate(PlatformEmailSettings entity) {
        if (entity.getFromAddress() != null && !EMAIL.matcher(entity.getFromAddress()).matches()) {
            throw PlatformEmailSettingsException.fromAddressInvalid();
        }
        if (entity.getReplyTo() != null && !EMAIL.matcher(entity.getReplyTo()).matches()) {
            throw PlatformEmailSettingsException.replyToInvalid();
        }
        if (entity.isEnabled()) {
            requireConnectionFields(entity);
        }
    }

    private void requireConnectionFields(PlatformEmailSettings entity) {
        if (entity.getHost() == null) {
            throw PlatformEmailSettingsException.hostRequired();
        }
        if (entity.getPort() == null) {
            throw PlatformEmailSettingsException.portRequired();
        }
        if (entity.getUsername() == null || entity.getPasswordEncrypted() == null) {
            throw PlatformEmailSettingsException.credentialsRequired();
        }
        if (resolveFrom(entity) == null || !EMAIL.matcher(resolveFrom(entity)).matches()) {
            throw PlatformEmailSettingsException.fromAddressInvalid();
        }
    }

    private static String resolveFrom(PlatformEmailSettings entity) {
        return entity.getFromAddress() != null ? entity.getFromAddress() : entity.getUsername();
    }

    private static String describeFailure(Exception ex) {
        String message = ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage();
        if (message.contains("535") || message.toLowerCase().contains("authentication failed")) {
            return "Usuário ou senha recusados pelo servidor. No Gmail, use uma senha de app (não a senha da conta). "
                    + "Detalhe: " + message;
        }
        if (message.toLowerCase().contains("timed out") || message.toLowerCase().contains("couldn't connect")) {
            return "Não foi possível conectar ao servidor SMTP. Confira host, porta e criptografia. Detalhe: " + message;
        }
        return message;
    }

    private PlatformEmailSettingsResponseDto toResponse(PlatformEmailSettings entity) {
        return PlatformEmailSettingsResponseDto.builder()
                .persisted(true)
                .enabled(entity.isEnabled())
                .host(entity.getHost())
                .port(entity.getPort())
                .security(entity.getSecurity())
                .username(entity.getUsername())
                .passwordConfigured(entity.getPasswordEncrypted() != null)
                .fromAddress(entity.getFromAddress())
                .fromName(entity.getFromName())
                .replyTo(entity.getReplyTo())
                .lastTestAt(entity.getLastTestAt())
                .lastTestSuccess(entity.getLastTestSuccess())
                .lastTestMessage(entity.getLastTestMessage())
                .updatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt() : entity.getCreatedAt())
                .build();
    }

    private static PlatformEmailSettingsResponseDto defaults() {
        return PlatformEmailSettingsResponseDto.builder()
                .persisted(false)
                .enabled(false)
                .host("smtp.gmail.com")
                .port(587)
                .security(PlatformEmailSecurityEnum.STARTTLS)
                .fromName("Gesint")
                .build();
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String truncate(String value, int max) {
        return value.length() <= max ? value : value.substring(0, max);
    }
}
