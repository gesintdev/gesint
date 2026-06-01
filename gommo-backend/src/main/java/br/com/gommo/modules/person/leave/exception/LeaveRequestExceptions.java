package br.com.gommo.modules.person.leave.exception;
public final class LeaveRequestExceptions {
    private LeaveRequestExceptions() {}

    public static final String NOT_FOUND_CODE = "LEAVE_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Solicitação de afastamento não encontrada";

    public static final String VACATION_INVALID_CODE = "VACATION_INVALID";
    public static final String VACATION_INVALID_DATES_MSG = "A data fim deve ser igual ou posterior à data de início";
    public static final String VACATION_NO_ENTITLEMENT_MSG =
            "Colaborador sem direito a férias neste período aquisitivo (faltas injustificadas acima do limite)";
    public static final String VACATION_PECUNIARY_EXCEEDED_MSG = "Abono pecuniário não pode exceder 10 dias nem 1/3 do período";
    public static final String VACATION_START_RESTRICTED_MSG =
            "Não é permitido iniciar férias nos 2 dias anteriores a feriado ou ao descanso semanal remunerado";
    public static final String VACATION_DAYS_EXCEEDED_MSG = "Dias de gozo excedem o saldo disponível no período";
}
