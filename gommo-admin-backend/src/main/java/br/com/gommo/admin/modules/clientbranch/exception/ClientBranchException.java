package br.com.gommo.admin.modules.clientbranch.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.admin.core.exception.BusinessException;

public final class ClientBranchException {

    private ClientBranchException() {}

    public static BusinessException notFound() {
        return new BusinessException("CLIENT_BRANCH_NOT_FOUND", "Filial não encontrada", HttpStatus.NOT_FOUND);
    }

    public static BusinessException clientNotFound() {
        return new BusinessException("CLIENT_NOT_FOUND", "Cliente não encontrado", HttpStatus.NOT_FOUND);
    }

    public static BusinessException cnpjExists() {
        return new BusinessException(
                "CLIENT_BRANCH_CNPJ_EXISTS", "Já existe uma filial com este CNPJ", HttpStatus.CONFLICT);
    }

    public static BusinessException cnpjInvalid() {
        return new BusinessException(
                "CLIENT_BRANCH_CNPJ_INVALID", "CNPJ deve conter 14 dígitos", HttpStatus.BAD_REQUEST);
    }

    public static BusinessException cnpjBelongsToHeadquarters() {
        return new BusinessException(
                "CLIENT_BRANCH_CNPJ_IS_HEADQUARTERS",
                "Este CNPJ é o da matriz, cadastrada em Dados Básicos. Informe o CNPJ do estabelecimento filial.",
                HttpStatus.BAD_REQUEST);
    }

    public static BusinessException headquartersDocumentMissing() {
        return new BusinessException(
                "CLIENT_HEADQUARTERS_DOCUMENT_MISSING",
                "Informe o CNPJ do cliente em Dados Básicos antes de cadastrar filiais.",
                HttpStatus.BAD_REQUEST);
    }
}
