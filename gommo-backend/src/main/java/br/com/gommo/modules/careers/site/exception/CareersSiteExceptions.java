package br.com.gommo.modules.careers.site.exception;

public final class CareersSiteExceptions {
    private CareersSiteExceptions() {}

    public static final String VACANCY_NOT_FOUND_CODE = "PUBLIC_CAREERS_VACANCY_NOT_FOUND";
    public static final String VACANCY_NOT_FOUND_MSG = "Vaga n\u00e3o encontrada ou n\u00e3o est\u00e1 mais aberta";

    public static final String NAME_REQUIRED_CODE = "PUBLIC_CAREERS_NAME_REQUIRED";
    public static final String NAME_REQUIRED_MSG = "Informe o nome completo";

    public static final String EMAIL_REQUIRED_CODE = "PUBLIC_CAREERS_EMAIL_REQUIRED";
    public static final String EMAIL_REQUIRED_MSG = "Informe um e-mail v\u00e1lido";

    public static final String PHONE_REQUIRED_CODE = "PUBLIC_CAREERS_PHONE_REQUIRED";
    public static final String PHONE_REQUIRED_MSG = "Informe um telefone ou WhatsApp com DDD";

    public static final String PRIVACY_CONSENT_REQUIRED_CODE = "PUBLIC_CAREERS_PRIVACY_CONSENT_REQUIRED";
    public static final String PRIVACY_CONSENT_REQUIRED_MSG =
            "Para se candidatar, confirme que leu o aviso de privacidade deste processo";

    public static final String RESUME_OR_EXPERIENCE_REQUIRED_CODE = "PUBLIC_CAREERS_RESUME_OR_EXPERIENCE_REQUIRED";
    public static final String RESUME_OR_EXPERIENCE_REQUIRED_MSG =
            "Envie um curr\u00edculo ou informe ao menos uma experi\u00eancia profissional";

    public static final String RESUME_INVALID_CODE = "PUBLIC_CAREERS_RESUME_INVALID";
    public static final String RESUME_INVALID_MSG = "Envie o curr\u00edculo em PDF, DOC ou DOCX com at\u00e9 10 MB";
}
