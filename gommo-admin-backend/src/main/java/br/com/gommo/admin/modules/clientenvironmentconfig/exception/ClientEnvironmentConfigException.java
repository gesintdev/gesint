package br.com.gommo.admin.modules.clientenvironmentconfig.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.admin.core.exception.BusinessException;

public final class ClientEnvironmentConfigException {

    private ClientEnvironmentConfigException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                "CLIENT_ENVIRONMENT_CONFIG_NOT_FOUND", "Configuração de ambiente não encontrada", HttpStatus.NOT_FOUND);
    }

    public static BusinessException clientNotFound() {
        return new BusinessException("CLIENT_NOT_FOUND", "Cliente não encontrado", HttpStatus.NOT_FOUND);
    }
}
