package br.com.gommo.modules.rh.person.occupationalexam.exam.exception;

public final class OccupationalExamExceptions {

    private OccupationalExamExceptions() {}

    public static final String NOT_FOUND_CODE = "OCCUPATIONAL_EXAM_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Exame ocupacional nao encontrado.";

    public static final String DUE_DATE_OVERRIDE_CODE = "OCCUPATIONAL_EXAM_DUE_DATE_OVERRIDE";
    public static final String DUE_DATE_OVERRIDE_MSG =
            "Vencimento e calculado pela matriz de exames e nao pode ser digitado manualmente quando ha versao vigente.";

    public static final String IMMUTABLE_CODE = "OCCUPATIONAL_EXAM_IMMUTABLE";
    public static final String IMMUTABLE_MSG = "Registro clinico em REGISTRADO/ARQUIVADO e imutavel (prova juridica).";

    public static final String REGISTER_INCOMPLETE_CODE = "OCCUPATIONAL_EXAM_REGISTER_INCOMPLETE";
    public static final String REGISTER_PHYSICIAN_REQUIRED_MSG =
            "Nao e possivel registrar o ASO sem medico examinador com CRM e UF.";
    public static final String REGISTER_CID_REQUIRED_MSG = "CID e obrigatorio quando o resultado do ASO e UNFIT.";
    public static final String REGISTER_COMPLEMENTARY_REQUIRED_MSG =
            "Todos os exames complementares previstos na matriz devem ter resultado preenchido.";
    public static final String REGISTER_INVALID_STATUS_MSG =
            "So e possivel registrar resultado a partir do status REALIZADO.";

    public static final String SCHEDULE_INVALID_STATUS_CODE = "OCCUPATIONAL_EXAM_SCHEDULE_INVALID";
    public static final String SCHEDULE_INVALID_STATUS_MSG = "So e possivel convocar exame no status PREVISTO.";
}
