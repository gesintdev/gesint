package br.com.gommo.modules.dp.payment.notification;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import br.com.gommo.core.mail.EmailMessage;
import br.com.gommo.core.mail.EmailSendResult;
import br.com.gommo.core.mail.EmailSendStatusEnum;
import br.com.gommo.core.mail.EmailService;
import br.com.gommo.modules.dp.payment.exception.PaymentException;

@Service
public class PaymentSlipNotificationService {

    private static final Logger log = LoggerFactory.getLogger(PaymentSlipNotificationService.class);

    private final EmailService emailService;

    @Value("${gommo.payment.whatsapp-base-url:https://wa.me/}")
    private String whatsappBaseUrl;

    public PaymentSlipNotificationService(EmailService emailService) {
        this.emailService = emailService;
    }

    public void sendEmail(String to, String collaboratorName, String periodLabel, byte[] pdfBytes, String filename) {
        if (to == null || to.isBlank()) {
            throw PaymentException.contactMissing();
        }
        EmailMessage message = EmailMessage
                .text(to, "Recibo de pagamento - " + periodLabel, buildEmailBody(collaboratorName, periodLabel))
                .withAttachment(filename, pdfBytes, "application/pdf");
        EmailSendResult result = emailService.send(message);
        if (result.status() == EmailSendStatusEnum.FAILED) {
            log.error("Failed to send payment slip email to {}: {}", to, result.detail());
            throw PaymentException.batchProcessingFailed();
        }
    }

    public String buildWhatsappUrl(String phone, String collaboratorName, String periodLabel) {
        if (phone == null || phone.isBlank()) {
            throw PaymentException.contactMissing();
        }
        String digits = phone.replaceAll("\\D", "");
        if (digits.startsWith("0")) {
            digits = digits.substring(1);
        }
        if (digits.length() == 10 || digits.length() == 11) {
            digits = "55" + digits;
        }
        String message = String.format(
                Locale.ROOT, "Ola %s, segue seu recibo de pagamento referente a %s.", collaboratorName, periodLabel);
        return whatsappBaseUrl + digits + "?text=" + java.net.URLEncoder.encode(message, StandardCharsets.UTF_8);
    }

    private String buildEmailBody(String collaboratorName, String periodLabel) {
        return "Ola " + collaboratorName + ",\n\nSegue em anexo seu recibo de pagamento referente a " + periodLabel
                + ".\n\nDepartamento Pessoal";
    }
}
