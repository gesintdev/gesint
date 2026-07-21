package br.com.gommo.modules.cfg.settings.agenda.exception;

public final class AgendaExceptions {

    private AgendaExceptions() {}

    public static final String NOT_FOUND_CODE = "AGENDA_EVENT_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Evento da agenda n\u00e3o encontrado";
    public static final String TITLE_REQUIRED_CODE = "AGENDA_EVENT_TITLE_REQUIRED";
    public static final String TITLE_REQUIRED_MSG = "Informe o t\u00edtulo do evento";
    public static final String RANGE_INVALID_CODE = "AGENDA_EVENT_RANGE_INVALID";
    public static final String RANGE_INVALID_MSG = "O t\u00e9rmino deve ser igual ou posterior ao in\u00edcio";
    public static final String UNAUTHENTICATED_CODE = "AGENDA_EVENT_UNAUTHENTICATED";
    public static final String UNAUTHENTICATED_MSG = "Usu\u00e1rio n\u00e3o autenticado";
}
