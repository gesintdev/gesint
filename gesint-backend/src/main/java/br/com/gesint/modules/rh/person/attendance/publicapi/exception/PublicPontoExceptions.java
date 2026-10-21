package br.com.gesint.modules.rh.person.attendance.publicapi.exception;

public final class PublicPontoExceptions {

    private PublicPontoExceptions() {}

    public static final String COLLABORATOR_NOT_FOUND_CODE = "PUBLIC_PONTO_COLLABORATOR_NOT_FOUND";
    public static final String COLLABORATOR_NOT_FOUND_MSG = "C\u00f3digo do colaborador inv\u00e1lido";

    public static final String COLLABORATOR_REQUIRED_CODE = "PUBLIC_PONTO_COLLABORATOR_REQUIRED";
    public static final String COLLABORATOR_REQUIRED_MSG = "Informe o c\u00f3digo do colaborador";

    public static final String PHOTO_REQUIRED_CODE = "PUBLIC_PONTO_PHOTO_REQUIRED";
    public static final String PHOTO_REQUIRED_MSG = "A foto \u00e9 obrigat\u00f3ria para registrar o ponto";
}
