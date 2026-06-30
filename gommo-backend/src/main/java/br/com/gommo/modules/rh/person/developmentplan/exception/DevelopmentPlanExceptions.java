package br.com.gommo.modules.rh.person.developmentplan.exception;

public final class DevelopmentPlanExceptions {
    private DevelopmentPlanExceptions() {}

    public static final String NOT_FOUND_CODE = "DEVELOPMENT_PLAN_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "PDI nao encontrado";
    public static final String INVALID_STATUS_CODE = "DEVELOPMENT_PLAN_INVALID_STATUS";
    public static final String INVALID_STATUS_MSG = "Status do PDI nao permite esta operacao";
    public static final String COMPLETION_BLOCKED_CODE = "DEVELOPMENT_PLAN_COMPLETION_BLOCKED";
    public static final String COMPLETION_BLOCKED_MSG = "PDI nao pode ser concluido enquanto houver pendencias";
    public static final String COLLABORATOR_ADMISSION_REQUIRED_CODE = "DEVELOPMENT_PLAN_COLLABORATOR_ADMISSION_REQUIRED";
    public static final String COLLABORATOR_ADMISSION_REQUIRED_MSG = "PDI exige colaborador com admissao concluida";
}