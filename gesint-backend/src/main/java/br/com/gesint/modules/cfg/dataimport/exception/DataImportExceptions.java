package br.com.gesint.modules.cfg.dataimport.exception;

public final class DataImportExceptions {

    private DataImportExceptions() {}

    public static final String NOT_FOUND_CODE = "DATA_IMPORT_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Job de importacao nao encontrado.";

    public static final String ALREADY_RUNNING_CODE = "DATA_IMPORT_ALREADY_RUNNING";
    public static final String ALREADY_RUNNING_MSG =
            "Ja existe uma importacao em andamento para este cadastro.";

    public static final String INVALID_FILE_CODE = "DATA_IMPORT_INVALID_FILE";
    public static final String INVALID_FILE_MSG = "Arquivo Excel invalido ou vazio.";

    public static final String INVALID_HEADERS_CODE = "DATA_IMPORT_INVALID_HEADERS";
    public static final String INVALID_HEADERS_MSG = "Cabecalhos da planilha nao correspondem ao modelo.";

    public static final String EMPTY_ROWS_CODE = "DATA_IMPORT_EMPTY_ROWS";
    public static final String EMPTY_ROWS_MSG = "A planilha nao contem linhas de dados.";

    public static final String FORBIDDEN_CODE = "DATA_IMPORT_FORBIDDEN";
    public static final String FORBIDDEN_MSG = "Sem permissao para importar este cadastro.";
}
