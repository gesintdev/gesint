package br.com.gommo.modules.rh.person.exitinterview.exception;

public final class ExitInterviewExceptions {
    private ExitInterviewExceptions() {}

    public static final String NOT_FOUND_CODE = "EXITINTERVIEW_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Entrevista de desligamento nao encontrada";

    public static final String INVALID_STATUS_CODE = "EXITINTERVIEW_INVALID_STATUS";
    public static final String INVALID_STATUS_MSG = "Status da entrevista de desligamento invalido para esta operacao";

    public static final String NOT_EDITABLE_CODE = "EXITINTERVIEW_NOT_EDITABLE";
    public static final String NOT_EDITABLE_MSG = "Entrevista concluida ou cancelada nao pode ser editada";

    public static final String COMPLETION_REQUIRED_CODE = "EXITINTERVIEW_COMPLETION_REQUIRED";
    public static final String COMPLETION_REQUIRED_MSG = "Preencha os dados minimos antes de concluir a entrevista";

    public static final String RELATIONSHIP_MISMATCH_CODE = "EXITINTERVIEW_RELATIONSHIP_MISMATCH";
    public static final String RELATIONSHIP_MISMATCH_MSG = "Tipo de desligamento nao compativel com o vinculo informado";
}