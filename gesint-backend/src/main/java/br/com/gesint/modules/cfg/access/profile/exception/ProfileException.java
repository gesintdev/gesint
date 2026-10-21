package br.com.gesint.modules.cfg.access.profile.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

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
                "PROFILE_DUPLICATE_NAME",
                "Já existe um perfil com este nome neste sistema.",
                HttpStatus.CONFLICT);
    }

    public static BusinessException systemNotContracted() {
        return new BusinessException(
                "PROFILE_SYSTEM_NOT_CONTRACTED",
                "Este sistema não está contratado pelo cliente.",
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException permissionNotGranted() {
        return new BusinessException(
                "PROFILE_PERMISSION_NOT_GRANTED",
                "Você não pode conceder permissões que não possui.",
                HttpStatus.FORBIDDEN);
    }

    public static BusinessException invalidPermissions() {
        return new BusinessException(
                "PROFILE_INVALID_PERMISSIONS",
                "Uma ou mais permissões são inválidas ou não pertencem ao sistema do perfil.",
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException sensitiveJustificationRequired() {
        return new BusinessException(
                "PROFILE_SENSITIVE_JUSTIFICATION_REQUIRED",
                "Informe a justificativa ao conceder permissão sensível, financeira ou clínica.",
                HttpStatus.BAD_REQUEST);
    }
}
