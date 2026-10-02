package br.com.gommo.core.mail;

import java.util.ArrayList;
import java.util.List;

public record EmailMessage(String to, String subject, String textBody, String htmlBody, List<Attachment> attachments) {

    public EmailMessage {
        attachments = attachments == null ? List.of() : List.copyOf(attachments);
    }

    public static EmailMessage text(String to, String subject, String textBody) {
        return new EmailMessage(to, subject, textBody, null, List.of());
    }

    public static EmailMessage html(String to, String subject, String textBody, String htmlBody) {
        return new EmailMessage(to, subject, textBody, htmlBody, List.of());
    }

    public EmailMessage withAttachment(String filename, byte[] content, String contentType) {
        var next = new ArrayList<>(attachments);
        next.add(new Attachment(filename, content, contentType));
        return new EmailMessage(to, subject, textBody, htmlBody, next);
    }

    public record Attachment(String filename, byte[] content, String contentType) {}
}
