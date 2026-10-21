package br.com.gesint.core.mail;

/** Configuracao SMTP da Gesint mantida no Admin ({@code admin.platform_email_settings}). */
public record PlatformEmailSettings(
        String host,
        int port,
        String security,
        String username,
        byte[] passwordEncrypted,
        String fromAddress,
        String fromName,
        String replyTo) {

    public String resolvedFrom() {
        return fromAddress != null && !fromAddress.isBlank() ? fromAddress : username;
    }
}
