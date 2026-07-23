package br.com.gommo.modules.rh.person.jobvacancy.publicapi.exception;

public final class PublicCareersExceptions {
    private PublicCareersExceptions() {}

    public static final String ALREADY_APPLIED_CODE = "PUBLIC_CAREERS_ALREADY_APPLIED";
    public static final String ALREADY_APPLIED_MSG = "Voc\u00ea j\u00e1 se candidatou a esta vaga";

    public static final String NAME_REQUIRED_CODE = "PUBLIC_CAREERS_NAME_REQUIRED";
    public static final String NAME_REQUIRED_MSG = "Informe o nome completo";

    public static final String CPF_REQUIRED_CODE = "PUBLIC_CAREERS_CPF_REQUIRED";
    public static final String CPF_REQUIRED_MSG = "Informe o CPF";
}
