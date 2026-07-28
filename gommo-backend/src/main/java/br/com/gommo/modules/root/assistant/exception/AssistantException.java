package br.com.gommo.modules.root.assistant.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class AssistantException {

    private AssistantException() {}

    public static BusinessException invalidMessage() {
        return new BusinessException(
                AssistantExceptions.INVALID_MESSAGE_CODE,
                AssistantExceptions.INVALID_MESSAGE_MSG,
                HttpStatus.BAD_REQUEST);
    }
}
