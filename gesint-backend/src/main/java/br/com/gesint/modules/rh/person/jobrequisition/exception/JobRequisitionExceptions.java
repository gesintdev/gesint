package br.com.gesint.modules.rh.person.jobrequisition.exception;

public final class JobRequisitionExceptions {
    private JobRequisitionExceptions() {}

    public static final String NOT_FOUND_CODE = "JOB_REQUISITION_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Requisi\u00e7\u00e3o de vaga n\u00e3o encontrada";

    public static final String JOB_POSITION_NOT_FOUND_CODE = "JOB_REQUISITION_JOB_POSITION_NOT_FOUND";
    public static final String JOB_POSITION_NOT_FOUND_MSG = "Cargo informado n\u00e3o encontrado";

    public static final String OFFBOARDING_NOT_FOUND_CODE = "JOB_REQUISITION_OFFBOARDING_NOT_FOUND";
    public static final String OFFBOARDING_NOT_FOUND_MSG = "Desligamento de origem n\u00e3o encontrado";

    public static final String OFFBOARDING_REQUIRED_CODE = "JOB_REQUISITION_OFFBOARDING_REQUIRED";
    public static final String OFFBOARDING_REQUIRED_MSG = "Na substitui\u00e7\u00e3o, informe quem est\u00e1 sendo substitu\u00eddo";

    public static final String NOT_EDITABLE_CODE = "JOB_REQUISITION_NOT_EDITABLE";
    public static final String NOT_EDITABLE_MSG = "Somente requisi\u00e7\u00f5es em rascunho podem ser editadas";

    public static final String INVALID_STATUS_CODE = "JOB_REQUISITION_INVALID_STATUS";
    public static final String INVALID_STATUS_MSG = "Status da requisi\u00e7\u00e3o inv\u00e1lido para esta opera\u00e7\u00e3o";

    public static final String SUBMIT_INCOMPLETE_CODE = "JOB_REQUISITION_SUBMIT_INCOMPLETE";
    public static final String SUBMIT_INCOMPLETE_MSG =
            "Para enviar para aprova\u00e7\u00e3o, informe cargo, n\u00edvel, tipo de v\u00ednculo e sal\u00e1rio proposto";

    public static final String JUSTIFICATION_REQUIRED_CODE = "JOB_REQUISITION_JUSTIFICATION_REQUIRED";
    public static final String JUSTIFICATION_REQUIRED_MSG =
            "Sal\u00e1rio fora da faixa do cargo exige justificativa";

    public static final String STAGE_NOT_ALLOWED_CODE = "JOB_REQUISITION_STAGE_NOT_ALLOWED";
    public static final String STAGE_NOT_ALLOWED_MSG =
            "Seu perfil n\u00e3o tem al\u00e7ada para decidir esta etapa da requisi\u00e7\u00e3o";

    public static final String REJECTION_REASON_REQUIRED_CODE = "JOB_REQUISITION_REJECTION_REASON_REQUIRED";
    public static final String REJECTION_REASON_REQUIRED_MSG = "Informe o motivo da reprova\u00e7\u00e3o";

    public static final String DELETE_BLOCKED_CODE = "JOB_REQUISITION_DELETE_BLOCKED";
    public static final String DELETE_BLOCKED_MSG = "Requisi\u00e7\u00e3o aprovada n\u00e3o pode ser exclu\u00edda";
}
