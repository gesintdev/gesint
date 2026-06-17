package br.com.gommo.modules.dp.payment.exception;

import br.com.gommo.core.exception.BusinessException;

public class PaymentException extends BusinessException {

    private PaymentException(String code, String message) {
        super(code, message);
    }

    public static PaymentException notFound() {
        return new PaymentException("PAYMENT_NOT_FOUND", "Registro de pagamento nao encontrado.");
    }

    public static PaymentException periodDuplicate() {
        return new PaymentException("PAYMENT_PERIOD_DUPLICATE", "Ja existe periodo cadastrado para esta competencia.");
    }

    public static PaymentException batchProcessingFailed() {
        return new PaymentException("PAYMENT_BATCH_PROCESSING_FAILED", "Falha ao processar arquivo PDF.");
    }

    public static PaymentException slipNotSendable() {
        return new PaymentException("PAYMENT_SLIP_NOT_SENDABLE", "Holerite divergente ou ja enviado.");
    }

    public static PaymentException slipNotValidatable() {
        return new PaymentException("PAYMENT_SLIP_NOT_VALIDATABLE", "Holerite nao pode ser validado.");
    }

    public static PaymentException duplicateSourceFile() {
        return new PaymentException(
                "PAYMENT_BATCH_DUPLICATE_FILE", "Este arquivo PDF ja foi processado neste periodo.");
    }

    public static PaymentException contactMissing() {
        return new PaymentException("PAYMENT_CONTACT_MISSING", "Colaborador sem contato cadastrado.");
    }
}
