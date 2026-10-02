package br.com.gommo.core.mail;

public record EmailSendResult(EmailSendStatusEnum status, String detail) {

    public static EmailSendResult sent() {
        return new EmailSendResult(EmailSendStatusEnum.SENT, null);
    }

    public static EmailSendResult failed(String detail) {
        return new EmailSendResult(EmailSendStatusEnum.FAILED, detail);
    }

    public static EmailSendResult notConfigured() {
        return new EmailSendResult(EmailSendStatusEnum.NOT_CONFIGURED, "Envio de e-mail não configurado no Admin.");
    }

    public boolean isSent() {
        return status == EmailSendStatusEnum.SENT;
    }
}
