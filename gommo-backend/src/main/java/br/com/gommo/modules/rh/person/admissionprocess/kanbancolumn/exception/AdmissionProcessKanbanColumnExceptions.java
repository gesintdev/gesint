package br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.exception;

public final class AdmissionProcessKanbanColumnExceptions {

    private AdmissionProcessKanbanColumnExceptions() {}

    public static final String NOT_FOUND_CODE = "ADMISSION_PROCESS_KANBAN_COLUMN_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Coluna do kanban de admissao nao encontrada";

    public static final String SYSTEM_COLUMN_LOCKED_CODE = "ADMISSION_PROCESS_KANBAN_COLUMN_SYSTEM_LOCKED";
    public static final String SYSTEM_COLUMN_LOCKED_MSG =
            "Coluna do sistema nao pode ser excluida, desativada nem ter a chave alterada";

    public static final String RESERVED_KEY_CODE = "ADMISSION_PROCESS_KANBAN_COLUMN_RESERVED_KEY";
    public static final String RESERVED_KEY_MSG = "Esta chave e reservada para uma coluna do sistema";
}
