package br.com.gesint.admin.modules.clientsubscription.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.admin.core.exception.BusinessException;

public final class ClientSubscriptionException {

    private ClientSubscriptionException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                "CLIENT_SUBSCRIPTION_NOT_FOUND", "Assinatura não encontrada", HttpStatus.NOT_FOUND);
    }

    public static BusinessException clientNotFound() {
        return new BusinessException("CLIENT_NOT_FOUND", "Cliente não encontrado", HttpStatus.NOT_FOUND);
    }
}
