package br.com.gesint.admin.modules.platformemail.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

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
        send(email, "Primeiro acesso — Gesint", "criar sua senha de acesso", clientSetupUrl(slug, token));
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
