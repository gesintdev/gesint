package br.com.gommo.modules.cfg.access.profile.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class ProfileException {

    private ProfileException() {}

    public static BusinessException notFound() {
        return new BusinessException("PROFILE_NOT_FOUND", "Perfil não encontrado.", HttpStatus.NOT_FOUND);
    }

    public static BusinessException systemRoleImmutable() {
        return new BusinessException(
                "PROFILE_SYSTEM_IMMUTABLE",
                "Perfis padrão do sistema não podem ser alterados.",
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException duplicateName() {
        return new BusinessException(
                "PROFILE_DUPLICATE_NAME", "Já existe um perfil com este nome.", HttpStatus.CONFLICT);
    }
}
