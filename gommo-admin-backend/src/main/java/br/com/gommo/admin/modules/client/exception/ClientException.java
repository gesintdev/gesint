package br.com.gommo.admin.modules.client.exception;

import br.com.gommo.admin.core.exception.BusinessException;
import org.springframework.http.HttpStatus;

public final class ClientException {

    private ClientException() {}

    public static BusinessException notFound() {
        return new BusinessException("CLIENT_NOT_FOUND", "Cliente não encontrado", HttpStatus.NOT_FOUND);
    }

    public static BusinessException slugAlreadyExists() {
        return new BusinessException("CLIENT_SLUG_EXISTS", "Slug já cadastrado", HttpStatus.CONFLICT);
    }

    public static BusinessException databaseConfigIncomplete(String detail) {
        return new BusinessException("CLIENT_DB_CONFIG_INCOMPLETE", detail, HttpStatus.BAD_REQUEST);
    }

    public static BusinessException databaseConnectionFailed(String detail) {
        return new BusinessException("CLIENT_DB_CONNECTION_FAILED", detail, HttpStatus.BAD_GATEWAY);
    }

    public static BusinessException provisioningInProgress() {
        return new BusinessException(
                "CLIENT_PROVISIONING_IN_PROGRESS",
                "Provisionamento já está em andamento para este cliente",
                HttpStatus.CONFLICT);
    }
}
