package br.com.gommo.modules.cfg.access.actingprofile.exception;

public final class ActingProfileExceptions {

    private ActingProfileExceptions() {}

    public static final String NOT_FOUND_CODE = "ACTING_PROFILE_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Perfil de atua\u00e7\u00e3o n\u00e3o encontrado.";

    public static final String DUPLICATE_NAME_CODE = "ACTING_PROFILE_DUPLICATE_NAME";
    public static final String DUPLICATE_NAME_MSG =
            "J\u00e1 existe um perfil de atua\u00e7\u00e3o com este nome neste sistema.";

    public static final String SYSTEM_NOT_CONTRACTED_CODE = "ACTING_PROFILE_SYSTEM_NOT_CONTRACTED";
    public static final String SYSTEM_NOT_CONTRACTED_MSG =
            "Este sistema n\u00e3o est\u00e1 contratado pelo cliente.";

    public static final String SCOPE_REF_REQUIRED_CODE = "ACTING_PROFILE_SCOPE_REF_REQUIRED";
    public static final String SCOPE_REF_REQUIRED_MSG =
            "Informe o departamento quando a abrang\u00eancia for Departamento.";
}
