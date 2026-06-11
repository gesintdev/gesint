package br.com.gommo.modules.payment.notification;

import br.com.gommo.modules.payment.exception.PaymentException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class PaymentSlipNotificationService {

    private static final Logger log = LoggerFactory.getLogger(PaymentSlipNotificationService.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    @Value("${gommo.payment.whatsapp-base-url:https://wa.me/}")
    private String whatsappBaseUrl;

    public PaymentSlipNotificationService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

    public void sendEmail(String to, String collaboratorName, String periodLabel, byte[] pdfBytes, String filename) {
        if (to == null || to.isBlank()) {
            throw PaymentException.contactMissing();
        }
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null || mailFrom == null || mailFrom.isBlank()) {
            log.warn("Mail not configured. Skipping email to {} for {}", to, collaboratorName);
            return;
        }
        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(Objects.requireNonNull(mailFrom));
            helper.setTo(to.trim());
            helper.setSubject("Recibo de pagamento - " + periodLabel);
            helper.setText(buildEmailBody(collaboratorName, periodLabel), false);
            helper.addAttachment(filename, new ByteArrayResource(pdfBytes), "application/pdf");
            mailSender.send(message);
        } catch (Exception ex) {
            log.error("Failed to send payment slip email to {}", to, ex);
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
                Locale.ROOT,
                "Ola %s, segue seu recibo de pagamento referente a %s.",
                collaboratorName,
                periodLabel);
        return whatsappBaseUrl + digits + "?text=" + java.net.URLEncoder.encode(message, StandardCharsets.UTF_8);
    }

    private String buildEmailBody(String collaboratorName, String periodLabel) {
        return "Ola " + collaboratorName + ",\n\nSegue em anexo seu recibo de pagamento referente a "
                + periodLabel + ".\n\nDepartamento Pessoal";
    }
}
