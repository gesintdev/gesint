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

    public static BusinessException notEnabled() {
        return new BusinessException(
                AssistantExceptions.NOT_ENABLED_CODE,
                AssistantExceptions.NOT_ENABLED_MSG,
                HttpStatus.FORBIDDEN);
    }

    public static BusinessException jailbreak() {
        return new BusinessException(
                AssistantExceptions.JAILBREAK_CODE,
                AssistantExceptions.JAILBREAK_MSG,
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException genericFailure() {
        return new BusinessException(
                AssistantExceptions.GENERIC_FAILURE_CODE,
                AssistantExceptions.GENERIC_FAILURE_MSG,
                HttpStatus.BAD_GATEWAY);
    }
}
