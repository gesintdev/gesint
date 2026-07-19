package br.com.gommo.admin.modules.clientcontractedsystem.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.admin.core.exception.BusinessException;

public final class ClientContractedSystemException {

    private ClientContractedSystemException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                "CLIENT_CONTRACTED_SYSTEM_NOT_FOUND", "Sistema contratado não encontrado", HttpStatus.NOT_FOUND);
    }

    public static BusinessException clientNotFound() {
        return new BusinessException("CLIENT_NOT_FOUND", "Cliente não encontrado", HttpStatus.NOT_FOUND);
    }

    public static BusinessException alreadyContracted() {
        return new BusinessException(
                "CLIENT_CONTRACTED_SYSTEM_EXISTS",
                "Este sistema já está contratado para o cliente",
                HttpStatus.CONFLICT);
    }

    public static BusinessException deactivateAtRequired() {
        return new BusinessException(
                "CLIENT_CONTRACTED_SYSTEM_DEACTIVATE_AT_REQUIRED",
                "Informe a data de desativação ao agendar o ciclo de vida",
                HttpStatus.BAD_REQUEST);
    }
}

