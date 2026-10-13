package br.com.gommo.admin.modules.assistanterrorlog.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.admin.core.exception.BusinessException;

public final class AssistantErrorLogException {

    private AssistantErrorLogException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                "ASSISTANT_ERROR_LOG_NOT_FOUND", "Log do assistente não encontrado", HttpStatus.NOT_FOUND);
    }
}
