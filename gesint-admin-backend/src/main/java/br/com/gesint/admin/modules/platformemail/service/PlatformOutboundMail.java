package br.com.gesint.admin.modules.platformemail.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** E-mails de credencial do Admin e o link do Client correspondente. */
@Service
public class PlatformOutboundMail {

    private final PlatformEmailSettingsService settingsService;
    private final String adminPublicBaseUrl;
    private final String clientBaseDomain;

    public PlatformOutboundMail(
            PlatformEmailSettingsService settingsService,
            @Value("${gesint-admin.public-base-url:http://localhost:3001}") String adminPublicBaseUrl,
            @Value("${gesint-admin.client-base-domain:localhost}") String clientBaseDomain) {
        this.settingsService = settingsService;
        this.adminPublicBaseUrl = adminPublicBaseUrl;
        this.clientBaseDomain = clientBaseDomain;
    }

    public void sendAdminPasswordReset(String email, String token) {
        send(email, "Redefinição de senha — Gesint Admin", "criar uma nova senha", adminSetupUrl(token));
    }

    public void sendAdminFirstAccess(String email, String token) {
        send(email, "Primeiro acesso — Gesint Admin", "criar sua senha de acesso", adminSetupUrl(token));
    }

    public void sendClientFirstAccess(String email, String token, String slug) {
        sendClientFirstAccess(email, token, slug, null);
    }

    public void sendClientFirstAccess(String email, String token, String slug, ClientFirstAccessMailContext context) {
        String link = clientSetupUrl(slug, token);
        if (email == null || email.isBlank() || link == null) {
            return;
        }
        String subject = "Primeiro acesso — Gesint";
        String body = context == null ? simpleFirstAccessBody(link) : detailedFirstAccessBody(context, link);
        String to = email.trim();
        Runnable task = () -> settingsService.sendPlain(to, subject, body);
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

    private static String simpleFirstAccessBody(String link) {
        return """
                Olá,

                Para criar sua senha de acesso no Gesint, abra o link abaixo:

                %s

                Se você não solicitou, ignore este e-mail.
                """.formatted(link);
    }

    private static String detailedFirstAccessBody(ClientFirstAccessMailContext context, String link) {
        String greeting = context.getDisplayName() != null && !context.getDisplayName().isBlank()
                ? "Olá, " + context.getDisplayName().trim() + ","
                : "Olá,";
        StringBuilder body = new StringBuilder();
        body.append(greeting).append("\n\n");
        body.append("Sua conta no Gesint foi criada. Segue um resumo do acesso:\n\n");
        if (hasText(context.getClientName())) {
            body.append("Cliente: ").append(context.getClientName().trim()).append('\n');
        }
        if (hasText(context.getClientLegalName())
                && !context.getClientLegalName().trim().equalsIgnoreCase(
                        context.getClientName() == null ? "" : context.getClientName().trim())) {
            body.append("Razão social: ").append(context.getClientLegalName().trim()).append('\n');
        }
        if (hasText(context.getUsername())) {
            body.append("Usuário: ").append(context.getUsername().trim()).append('\n');
        }
        if (hasText(context.getEmail())) {
            body.append("E-mail: ").append(context.getEmail().trim()).append('\n');
        }
        if (hasText(context.getSlug())) {
            body.append("Ambiente: ").append(context.getSlug().trim()).append('\n');
        }
        body.append('\n');
        List<ClientFirstAccessMailContext.ContractedSystemLine> systems =
                context.getSystems() == null ? List.of() : context.getSystems();
        if (!systems.isEmpty()) {
            body.append("Sistemas contratados:\n");
            for (ClientFirstAccessMailContext.ContractedSystemLine system : systems) {
                body.append("- ");
                String label = hasText(system.getName())
                        ? system.getName().trim()
                        : (hasText(system.getModuleKey()) ? system.getModuleKey().trim() : "Sistema");
                body.append(label);
                if (hasText(system.getModuleKey())
                        && hasText(system.getName())
                        && !system.getName().trim().equalsIgnoreCase(system.getModuleKey().trim())) {
                    body.append(" (").append(system.getModuleKey().trim()).append(')');
                }
                if (hasText(system.getContractType())) {
                    body.append(" · Contrato ").append(contractTypeLabel(system.getContractType()));
                }
                if (hasText(system.getContractDate())) {
                    body.append(" · Início ").append(system.getContractDate());
                }
                if (hasText(system.getEndDate())) {
                    body.append(" · Término ").append(system.getEndDate());
                }
                if (system.isWithAi()) {
                    body.append(" · Com IA");
                }
                if (hasText(system.getOperationalStatus())) {
                    body.append(" · Status ").append(system.getOperationalStatus());
                }
                body.append('\n');
            }
            body.append('\n');
        }
        body.append("Para criar sua senha de acesso, abra o link abaixo:\n\n");
        body.append(link).append("\n\n");
        body.append("Se você não solicitou, ignore este e-mail.\n");
        return body.toString();
    }

    private static String contractTypeLabel(String contractType) {
        if ("ANNUAL".equalsIgnoreCase(contractType)) {
            return "anual";
        }
        if ("MONTHLY".equalsIgnoreCase(contractType)) {
            return "mensal";
        }
        return contractType;
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private void send(String email, String subject, String action, String link) {
        if (email == null || email.isBlank() || link == null) {
            return;
        }
        String body = """
                Olá,

                Para %s no Gesint, abra o link abaixo:

                %s

                Se você não solicitou, ignore este e-mail.
                """.formatted(action, link);
        String to = email.trim();
        Runnable task = () -> settingsService.sendPlain(to, subject, body);
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

    private String adminSetupUrl(String token) {
        return strip(adminPublicBaseUrl) + "/definir-senha?token=" + encode(token);
    }

    private String clientSetupUrl(String slug, String token) {
        return clientBase(slug) + "/definir-senha?token=" + encode(token);
    }

    private String clientBase(String slug) {
        boolean local = clientBaseDomain == null
                || clientBaseDomain.isBlank()
                || "localhost".equalsIgnoreCase(clientBaseDomain);
        if (slug == null || slug.isBlank()) {
            return local ? "http://localhost:3000" : "https://app." + clientBaseDomain;
        }
        return local ? "http://" + slug + ".localhost:3000" : "https://" + slug + "." + clientBaseDomain;
    }

    private static String strip(String url) {
        if (url == null || url.isBlank()) {
            return "http://localhost:3001";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    private static String encode(String token) {
        return URLEncoder.encode(token, StandardCharsets.UTF_8);
    }
}
