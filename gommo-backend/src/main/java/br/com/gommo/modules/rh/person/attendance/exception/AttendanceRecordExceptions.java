package br.com.gommo.modules.rh.person.attendance.exception;

public final class AttendanceRecordExceptions {
    private AttendanceRecordExceptions() {}

    public static final String NOT_FOUND_CODE = "ATTENDANCE_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Registro de ponto n\u00e3o encontrado";
    public static final String COLLABORATOR_NOT_LINKED_CODE = "ATTENDANCE_COLLABORATOR_NOT_LINKED";
    public static final String COLLABORATOR_NOT_LINKED_MSG = "Usu\u00e1rio autenticado sem colaborador vinculado";
    public static final String INVALID_SUBMISSION_CODE = "ATTENDANCE_INVALID_SUBMISSION";
    public static final String INVALID_SUBMISSION_MSG =
            "Informe clockIn, clockOut ou workedHours para solicitar ajuste de ponto";
}
