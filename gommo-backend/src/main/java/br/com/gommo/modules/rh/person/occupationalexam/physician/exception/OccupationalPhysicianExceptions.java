package br.com.gommo.modules.rh.person.occupationalexam.physician.exception;

public final class OccupationalPhysicianExceptions {

    private OccupationalPhysicianExceptions() {}

    public static final String NOT_FOUND_CODE = "OCCUPATIONAL_PHYSICIAN_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Medico ocupacional nao encontrado.";
    public static final String CRM_REQUIRED_CODE = "OCCUPATIONAL_PHYSICIAN_CRM_REQUIRED";
    public static final String CRM_REQUIRED_MSG =
            "Medico examinador deve ter CRM e UF preenchidos (campo rejeitavel no eSocial S-2220).";
}
