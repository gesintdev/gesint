package br.com.gommo.admin.modules.clientpayment.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.admin.core.exception.BusinessException;

public final class ClientPaymentException {

    private ClientPaymentException() {}

    public static BusinessException notFound() {
        return new BusinessException("CLIENT_PAYMENT_NOT_FOUND", "Pagamento não encontrado", HttpStatus.NOT_FOUND);
    }

    public static BusinessException clientNotFound() {
        return new BusinessException("CLIENT_NOT_FOUND", "Cliente não encontrado", HttpStatus.NOT_FOUND);
    }
}
