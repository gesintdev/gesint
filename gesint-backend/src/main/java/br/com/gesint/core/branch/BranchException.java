package br.com.gesint.core.branch;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

public final class BranchException {

    private BranchException() {}

    public static BusinessException notSelected() {
        return new BusinessException(
                "BRANCH_NOT_SELECTED", "Nenhuma filial ativa foi informada na requisicao.", HttpStatus.BAD_REQUEST);
    }

    public static BusinessException notFound() {
        return new BusinessException(
                "BRANCH_NOT_FOUND", "Filial nao encontrada neste cliente.", HttpStatus.NOT_FOUND);
    }

    public static BusinessException accessDenied() {
        return new BusinessException(
                "BRANCH_ACCESS_DENIED", "Voce nao tem acesso a esta filial.", HttpStatus.FORBIDDEN);
    }

    public static BusinessException headquartersRequired() {
        return new BusinessException(
                "BRANCH_HEADQUARTERS_REQUIRED",
                "Cadastre a matriz antes de criar filiais.",
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException headquartersAlreadyExists() {
        return new BusinessException(
                "BRANCH_HEADQUARTERS_ALREADY_EXISTS",
                "Ja existe uma matriz cadastrada. Cadastre esta empresa como filial.",
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException headquartersCannotBeDeleted() {
        return new BusinessException(
                "BRANCH_HEADQUARTERS_CANNOT_BE_DELETED",
                "A matriz nao pode ser excluida enquanto houver filiais vinculadas.",
                HttpStatus.BAD_REQUEST);
    }
}
