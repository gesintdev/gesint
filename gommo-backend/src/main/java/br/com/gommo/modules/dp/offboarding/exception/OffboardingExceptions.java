package br.com.gommo.modules.dp.offboarding.exception;

public final class OffboardingExceptions {
    private OffboardingExceptions() {}

    public static final String NOT_FOUND_CODE = "OFFBOARDING_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Desligamento n\u00e3o encontrado";

    public static final String ALREADY_COMPLETED_CODE = "OFFBOARDING_ALREADY_COMPLETED";
    public static final String ALREADY_COMPLETED_MSG = "Este desligamento j\u00e1 foi conclu\u00eddo";

    public static final String REASON_REQUIRED_CODE = "OFFBOARDING_REASON_REQUIRED";
    public static final String REASON_REQUIRED_MSG = "Informe o motivo do eSocial";

    public static final String LAST_WORK_DAY_REQUIRED_CODE = "OFFBOARDING_LAST_WORK_DAY_REQUIRED";
    public static final String LAST_WORK_DAY_REQUIRED_MSG = "Informe o \u00faltimo dia trabalhado";

    public static final String REASON_INVALID_CODE = "OFFBOARDING_REASON_INVALID";
    public static final String REASON_INVALID_MSG = "Motivo do eSocial inv\u00e1lido";

    public static final String COMPLETED_READONLY_CODE = "OFFBOARDING_COMPLETED_READONLY";
    public static final String COMPLETED_READONLY_MSG =
            "Desligamento conclu\u00eddo n\u00e3o pode ser alterado (exceto anexos)";
}
