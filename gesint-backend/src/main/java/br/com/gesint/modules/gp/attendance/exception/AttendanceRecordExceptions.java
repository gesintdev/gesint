package br.com.gesint.modules.gp.attendance.exception;

public final class AttendanceRecordExceptions {
    private AttendanceRecordExceptions() {}

    public static final String NOT_FOUND_CODE = "ATTENDANCE_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Registro de ponto n\u00e3o encontrado";
    public static final String COLLABORATOR_NOT_LINKED_CODE = "ATTENDANCE_COLLABORATOR_NOT_LINKED";
    public static final String COLLABORATOR_NOT_LINKED_MSG = "Usu\u00e1rio autenticado sem colaborador vinculado";
    public static final String INVALID_SUBMISSION_CODE = "ATTENDANCE_INVALID_SUBMISSION";
    public static final String INVALID_SUBMISSION_MSG =
            "Informe clockIn, clockOut ou workedHours para solicitar ajuste de ponto";
    public static final String COMPENSATION_REQUIRED_CODE = "ATTENDANCE_COMPENSATION_REQUIRED";
    public static final String COMPENSATION_REQUIRED_MSG =
            "Selecione se o ponto fora da escala ser\u00e1 banco de horas ou hora extra";
    public static final String DUPLICATE_WORK_DATE_CODE = "ATTENDANCE_DUPLICATE_WORK_DATE";
    public static final String DUPLICATE_WORK_DATE_MSG =
            "J\u00e1 existe ponto para este colaborador nesta data";
    public static final String PERIOD_CLOSED_CODE = "ATTENDANCE_PERIOD_CLOSED";
    public static final String PERIOD_CLOSED_MSG =
            "O espelho de ponto deste período está fechado. Reabra o espelho para alterar as marcações.";
    public static final String TIMESHEET_HAS_PENDING_CODE = "TIMESHEET_HAS_PENDING";
    public static final String TIMESHEET_HAS_PENDING_MSG =
            "Resolva as pendências do período antes de fechar o espelho de ponto.";
    public static final String TIMESHEET_REOPEN_REASON_CODE = "TIMESHEET_REOPEN_REASON_REQUIRED";
    public static final String TIMESHEET_REOPEN_REASON_MSG = "Informe o motivo para reabrir o espelho de ponto.";
    public static final String TIMESHEET_NOT_CLOSED_CODE = "TIMESHEET_NOT_CLOSED";
    public static final String TIMESHEET_NOT_CLOSED_MSG = "Este espelho de ponto já está aberto.";
    public static final String TIMESHEET_PERIOD_NOT_ENDED_CODE = "TIMESHEET_PERIOD_NOT_ENDED";
    public static final String TIMESHEET_PERIOD_NOT_ENDED_MSG =
            "O espelho só pode ser fechado depois do último dia do período.";
}
