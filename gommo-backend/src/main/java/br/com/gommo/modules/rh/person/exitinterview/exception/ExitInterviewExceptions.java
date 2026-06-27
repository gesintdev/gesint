package br.com.gommo.modules.rh.person.exitinterview.exception;

public final class ExitInterviewExceptions {
    private ExitInterviewExceptions() {}

    public static final String NOT_FOUND_CODE = "EXITINTERVIEW_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Entrevista de desligamento não encontrada.";

    public static final String INVALID_STATUS_CODE = "EXITINTERVIEW_INVALID_STATUS";
    public static final String INVALID_STATUS_MSG = "Status da entrevista de desligamento inválido para esta operação.";

    public static final String NOT_EDITABLE_CODE = "EXITINTERVIEW_NOT_EDITABLE";
    public static final String NOT_EDITABLE_MSG = "Entrevistas concluídas ou canceladas não podem ser editadas.";

    public static final String COMPLETION_REQUIRED_CODE = "EXITINTERVIEW_COMPLETION_REQUIRED";
    public static final String COMPLETION_REQUIRED_MSG =
            "Para concluir, informe colaborador, vínculo, data da entrevista, data de desligamento, tipo de desligamento, responsável e motivo.";

    public static final String RELATIONSHIP_MISMATCH_CODE = "EXITINTERVIEW_RELATIONSHIP_MISMATCH";
    public static final String RELATIONSHIP_MISMATCH_MSG =
            "O tipo de desligamento selecionado não é compatível com o vínculo. Revise Tipo de vínculo e Tipo de desligamento.";
}
