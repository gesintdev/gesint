package br.com.gommo.admin.modules.clientuser.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.admin.core.exception.BusinessException;

public final class ClientUserException {

    private ClientUserException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                "CLIENT_USER_NOT_FOUND", "Usuário do cliente não encontrado", HttpStatus.NOT_FOUND);
    }

    public static BusinessException clientNotFound() {
        return new BusinessException("CLIENT_NOT_FOUND", "Cliente não encontrado", HttpStatus.NOT_FOUND);
    }

    public static BusinessException usernameExists() {
        return new BusinessException("CLIENT_USER_USERNAME_EXISTS", "Username já cadastrado", HttpStatus.CONFLICT);
    }

    public static BusinessException emailExists() {
        return new BusinessException("CLIENT_USER_EMAIL_EXISTS", "E-mail já cadastrado", HttpStatus.CONFLICT);
    }

    public static BusinessException passwordRequired() {
        return new BusinessException(
                "CLIENT_USER_PASSWORD_REQUIRED", "Senha obrigatória na criação", HttpStatus.BAD_REQUEST);
    }

    public static BusinessException passwordTooShort() {
        return new BusinessException(
                "CLIENT_USER_PASSWORD_TOO_SHORT", "Senha deve ter no mínimo 8 caracteres", HttpStatus.BAD_REQUEST);
    }
}
