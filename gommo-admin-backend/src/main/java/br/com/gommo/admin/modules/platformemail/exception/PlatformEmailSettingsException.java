package br.com.gommo.admin.modules.platformemail.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.admin.core.exception.BusinessException;

public final class PlatformEmailSettingsException {

    private PlatformEmailSettingsException() {}

    public static BusinessException hostRequired() {
        return new BusinessException(
                "PLATFORM_EMAIL_HOST_REQUIRED", "Informe o servidor SMTP para ativar o envio", HttpStatus.BAD_REQUEST);
    }

    public static BusinessException portRequired() {
        return new BusinessException(
                "PLATFORM_EMAIL_PORT_REQUIRED", "Informe a porta SMTP para ativar o envio", HttpStatus.BAD_REQUEST);
    }

    public static BusinessException fromAddressInvalid() {
        return new BusinessException(
                "PLATFORM_EMAIL_FROM_INVALID", "Informe um e-mail de remetente válido", HttpStatus.BAD_REQUEST);
    }

    public static BusinessException replyToInvalid() {
        return new BusinessException(
                "PLATFORM_EMAIL_REPLY_TO_INVALID", "Informe um e-mail de resposta válido", HttpStatus.BAD_REQUEST);
    }

    public static BusinessException credentialsRequired() {
        return new BusinessException(
                "PLATFORM_EMAIL_CREDENTIALS_REQUIRED",
                "Informe usuário e senha SMTP para ativar o envio",
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException notConfigured() {
        return new BusinessException(
                "PLATFORM_EMAIL_NOT_CONFIGURED",
                "Salve a configuração de e-mail antes de enviar o teste",
                HttpStatus.BAD_REQUEST);
    }
}
