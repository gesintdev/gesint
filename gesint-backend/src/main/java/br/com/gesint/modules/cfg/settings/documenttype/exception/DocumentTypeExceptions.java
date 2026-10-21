package br.com.gesint.modules.cfg.settings.documenttype.exception;

public final class DocumentTypeExceptions {

    private DocumentTypeExceptions() {}

    public static final String NOT_FOUND_CODE = "DOCUMENT_TYPE_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Tipo de documento não encontrado.";

    public static final String DUPLICATE_CODE = "DOCUMENT_TYPE_DUPLICATE";
    public static final String DUPLICATE_MSG = "Já existe um tipo de documento com este código.";

    public static final String SYSTEM_DELETE_CODE = "DOCUMENT_TYPE_SYSTEM_PROTECTED";
    public static final String SYSTEM_DELETE_MSG =
            "Tipos de documento do sistema não podem ser excluídos. Desative-os se necessário.";
}
