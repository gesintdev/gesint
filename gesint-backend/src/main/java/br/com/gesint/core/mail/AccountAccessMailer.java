package br.com.gesint.core.mail;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.stereotype.Service;

import br.com.gesint.core.tenant.MultiTenantProperties;
import br.com.gesint.core.tenant.TenantContext;
import br.com.gesint.core.tenant.TenantContextHolder;

/** E-mails de primeiro acesso e redefinição de senha do Client. */
@Service
public class AccountAccessMailer {

    private final EmailService emailService;
    private final MultiTenantProperties multiTenantProperties;

    public AccountAccessMailer(EmailService emailService, MultiTenantProperties multiTenantProperties) {
        this.emailService = emailService;
        this.multiTenantProperties = multiTenantProperties;
    }

    public void sendPasswordReset(String email, String token) {
        send(email, "Redefinição de senha — Gesint", "criar uma nova senha", token, currentSlug());
    }

    public void sendFirstAccess(String email, String token) {
        send(email, "Primeiro acesso — Gesint", "criar sua senha de acesso", token, currentSlug());
    }

    private void send(String email, String subject, String action, String token, String slug) {
        if (email == null || email.isBlank() || token == null || token.isBlank()) {
            return;
        }
        String link = setupUrl(slug, token);
        String body = """
                Olá,

                Para %s no Gesint, abra o link abaixo:

                %s

                Se você não solicitou, ignore este e-mail.
                """.formatted(action, link);
        emailService.sendAfterCommit(EmailMessage.text(email.trim(), subject, body), null);
    }

    private String currentSlug() {
        TenantContext tenant = TenantContextHolder.getOptional().orElse(null);
        if (tenant == null || tenant.slug() == null || tenant.slug().isBlank()) {
            return multiTenantProperties.getDevTenantSlug();
        }
        return tenant.slug();
    }

    private String setupUrl(String slug, String token) {
        String encoded = URLEncoder.encode(token, StandardCharsets.UTF_8);
        return clientBase(slug) + "/definir-senha?token=" + encoded;
    }

    private String clientBase(String slug) {
        String domain = multiTenantProperties.getBaseDomain();
        boolean local = domain == null || domain.isBlank() || "localhost".equalsIgnoreCase(domain);
        if (slug == null || slug.isBlank() || "dev-public".equalsIgnoreCase(slug)) {
            return local ? "http://localhost:3000" : "https://app." + domain;
        }
        return local ? "http://" + slug + ".localhost:3000" : "https://" + slug + "." + domain;
    }
}
