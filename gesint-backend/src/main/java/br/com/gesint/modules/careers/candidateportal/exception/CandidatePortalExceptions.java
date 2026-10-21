package br.com.gesint.modules.careers.candidateportal.exception;

public final class CandidatePortalExceptions {

    private CandidatePortalExceptions() {}

    public static final String EMAIL_REQUIRED_CODE = "CANDIDATE_PORTAL_EMAIL_REQUIRED";
    public static final String EMAIL_REQUIRED_MSG = "Informe um e-mail v\u00e1lido";

    public static final String PASSWORD_REQUIRED_CODE = "CANDIDATE_PORTAL_PASSWORD_REQUIRED";
    public static final String PASSWORD_REQUIRED_MSG = "Informe uma senha com pelo menos 8 caracteres";

    public static final String NAME_REQUIRED_CODE = "CANDIDATE_PORTAL_NAME_REQUIRED";
    public static final String NAME_REQUIRED_MSG = "Informe o nome completo";

    public static final String EMAIL_IN_USE_CODE = "CANDIDATE_PORTAL_EMAIL_IN_USE";
    public static final String EMAIL_IN_USE_MSG = "J\u00e1 existe uma conta com este e-mail";

    public static final String INVALID_CREDENTIALS_CODE = "CANDIDATE_PORTAL_INVALID_CREDENTIALS";
    public static final String INVALID_CREDENTIALS_MSG = "E-mail ou senha inv\u00e1lidos";

    public static final String GOOGLE_NOT_CONFIGURED_CODE = "CANDIDATE_PORTAL_GOOGLE_NOT_CONFIGURED";
    public static final String GOOGLE_NOT_CONFIGURED_MSG =
            "Login com Google ainda n\u00e3o est\u00e1 configurado neste ambiente";

    public static final String GOOGLE_TOKEN_INVALID_CODE = "CANDIDATE_PORTAL_GOOGLE_TOKEN_INVALID";
    public static final String GOOGLE_TOKEN_INVALID_MSG = "N\u00e3o foi poss\u00edvel validar o login com Google";

    public static final String ACCOUNT_NOT_FOUND_CODE = "CANDIDATE_PORTAL_ACCOUNT_NOT_FOUND";
    public static final String ACCOUNT_NOT_FOUND_MSG = "Conta do candidato n\u00e3o encontrada";

    public static final String APPLICATION_NOT_FOUND_CODE = "CANDIDATE_PORTAL_APPLICATION_NOT_FOUND";
    public static final String APPLICATION_NOT_FOUND_MSG = "Candidatura n\u00e3o encontrada";

    public static final String WITHDRAW_NOT_ALLOWED_CODE = "CANDIDATE_PORTAL_WITHDRAW_NOT_ALLOWED";
    public static final String WITHDRAW_NOT_ALLOWED_MSG =
            "Esta candidatura n\u00e3o pode ser retirada neste momento";

    public static final String UNAUTHORIZED_CODE = "CANDIDATE_PORTAL_UNAUTHORIZED";
    public static final String UNAUTHORIZED_MSG = "Sess\u00e3o do candidato inv\u00e1lida ou expirada";

    public static final String OFFER_NOT_FOUND_CODE = "CANDIDATE_PORTAL_OFFER_NOT_FOUND";
    public static final String OFFER_NOT_FOUND_MSG = "Proposta de contrata\u00e7\u00e3o n\u00e3o encontrada";

    public static final String OFFER_NOT_ACTIONABLE_CODE = "CANDIDATE_PORTAL_OFFER_NOT_ACTIONABLE";
    public static final String OFFER_NOT_ACTIONABLE_MSG =
            "Esta proposta j\u00e1 foi respondida ou n\u00e3o est\u00e1 dispon\u00edvel";

    public static final String PRE_ADMISSION_NOT_FOUND_CODE = "CANDIDATE_PORTAL_PRE_ADMISSION_NOT_FOUND";
    public static final String PRE_ADMISSION_NOT_FOUND_MSG =
            "Pr\u00e9-admiss\u00e3o n\u00e3o encontrada para esta conta";

    public static final String PRE_ADMISSION_TOKEN_INVALID_CODE =
            "CANDIDATE_PORTAL_PRE_ADMISSION_TOKEN_INVALID";
    public static final String PRE_ADMISSION_TOKEN_INVALID_MSG =
            "Link de pr\u00e9-admiss\u00e3o inv\u00e1lido ou expirado";

    public static final String PRE_ADMISSION_INCOMPLETE_CODE = "CANDIDATE_PORTAL_PRE_ADMISSION_INCOMPLETE";
    public static final String PRE_ADMISSION_INCOMPLETE_MSG =
            "Preencha os itens obrigat\u00f3rios da pr\u00e9-admiss\u00e3o antes de concluir";

    public static final String PRE_ADMISSION_DOCUMENT_TYPE_CODE =
            "CANDIDATE_PORTAL_PRE_ADMISSION_DOCUMENT_TYPE";
    public static final String PRE_ADMISSION_DOCUMENT_TYPE_MSG =
            "Informe o tipo do documento (ex.: RG, CPF, COMPROVANTE_ENDERECO)";
}
