package br.com.gommo.modules.cfg.access.user.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class TenantAppUserException {

    private TenantAppUserException() {}

    public static BusinessException notFound() {
        return new BusinessException("APP_USER_NOT_FOUND", "Usuário não encontrado.", HttpStatus.NOT_FOUND);
    }

    public static BusinessException duplicateUsername() {
        return new BusinessException(
                "APP_USER_DUPLICATE_USERNAME", "Nome de usuário já cadastrado.", HttpStatus.CONFLICT);
    }

    public static BusinessException duplicateEmail() {
        return new BusinessException("APP_USER_DUPLICATE_EMAIL", "E-mail já cadastrado.", HttpStatus.CONFLICT);
    }

    public static BusinessException collaboratorAlreadyLinked() {
        return new BusinessException(
                "APP_USER_COLLABORATOR_LINKED", "Este colaborador já possui usuário no sistema.", HttpStatus.CONFLICT);
    }

    public static BusinessException passwordRequired() {
        return new BusinessException(
                "APP_USER_PASSWORD_REQUIRED", "Senha é obrigatória no cadastro.", HttpStatus.BAD_REQUEST);
    }

    public static BusinessException invalidRoleForSystem() {
        return new BusinessException(
                "APP_USER_INVALID_ROLE", "Perfil incompatível com o sistema selecionado.", HttpStatus.BAD_REQUEST);
    }
}
