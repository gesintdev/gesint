package br.com.gesint.admin.modules.devenvironment.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.admin.core.exception.BusinessException;

public final class DevEnvironmentException {

    private DevEnvironmentException() {}

    public static BusinessException disabled() {
        return new BusinessException(
                "DEV_ENVIRONMENT_DISABLED",
                "Ambiente de desenvolvimento nao esta habilitado neste perfil.",
                HttpStatus.NOT_FOUND);
    }

    public static BusinessException userNotFound() {
        return new BusinessException(
                "DEV_PLATFORM_USER_NOT_FOUND",
                "Usuario de desenvolvimento da plataforma nao encontrado.",
                HttpStatus.NOT_FOUND);
    }
}
