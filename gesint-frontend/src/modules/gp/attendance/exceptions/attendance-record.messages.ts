export const ATTENDANCE_MESSAGES = {
    ATTENDANCE_NOT_FOUND: "Registro de ponto não encontrado(a)",
    ATTENDANCE_COLLABORATOR_NOT_LINKED: "Seu usuário não está vinculado a um colaborador",
    ATTENDANCE_INVALID_SUBMISSION: "Informe os horários para solicitar o ajuste de ponto",
    ATTENDANCE_COMPENSATION_REQUIRED:
        "Selecione se o ponto fora da escala será banco de horas ou hora extra",
    ATTENDANCE_DUPLICATE_WORK_DATE: "Já existe ponto para este colaborador nesta data",
    ATTENDANCE_PERIOD_CLOSED:
        "O espelho de ponto deste período está fechado. Reabra o espelho para alterar as marcações.",
    TIMESHEET_HAS_PENDING: "Resolva as pendências do período antes de fechar o espelho de ponto.",
    TIMESHEET_REOPEN_REASON_REQUIRED: "Informe o motivo para reabrir o espelho de ponto.",
    TIMESHEET_NOT_CLOSED: "Este espelho de ponto já está aberto.",
    TIMESHEET_PERIOD_NOT_ENDED: "O espelho só pode ser fechado depois do último dia do período.",
} as const;
export const ATTENDANCE_CLIENT_MESSAGES = {
    ATTENDANCE_LOAD_FAILED: "Não foi possível carregar registro de ponto",
    ATTENDANCE_SAVE_FAILED: "Não foi possível salvar registro de ponto",
    ATTENDANCE_DUPLICATE_WORK_DATE: "Já existe ponto para este colaborador nesta data",
} as const;
