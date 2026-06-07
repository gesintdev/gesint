package br.com.gommo.modules.payroll.exception;
public final class PayrollRunExceptions {
    private PayrollRunExceptions() {}
    public static final String NOT_FOUND_CODE = "PAYROLL_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Folha de pagamento não encontrada";
    public static final String INVALID_STATUS_CODE = "PAYROLL_INVALID_STATUS";
    public static final String INVALID_STATUS_MSG = "Competência não pode ser processada neste status";
    public static final String NO_EVENTS_CODE = "PAYROLL_NO_EVENTS";
    public static final String NO_EVENTS_MSG = "Nenhum evento de folha cadastrado para processamento";
    public static final String LOCKED_CODE = "PAYROLL_LOCKED";
    public static final String LOCKED_MSG = "Compet\u00eancia fechada ou cancelada n\u00e3o permite altera\u00e7\u00f5es";
    public static final String PROCESSING_CODE = "PAYROLL_PROCESSING";
    public static final String PROCESSING_MSG = "Compet\u00eancia em processamento n\u00e3o permite altera\u00e7\u00f5es";
    public static final String INVALID_TRANSITION_CODE = "PAYROLL_INVALID_TRANSITION";
    public static final String INVALID_TRANSITION_MSG = "Transi\u00e7\u00e3o de status da compet\u00eancia n\u00e3o permitida";
}
