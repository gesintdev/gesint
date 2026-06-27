export const PAYMENT_MESSAGES = {
    PAYMENT_NOT_FOUND: "Registro de pagamento não encontrado.",
    PAYMENT_PERIOD_DUPLICATE: "Já existe período cadastrado para esta competência.",
    PAYMENT_BATCH_PROCESSING_FAILED: "Falha ao processar arquivo PDF.",
    PAYMENT_BATCH_DUPLICATE_FILE: "Este arquivo PDF já foi processado neste período.",
    PAYMENT_SLIP_NOT_SENDABLE: "Holerite divergente ou já enviado.",
    PAYMENT_CONTACT_MISSING: "Colaborador sem contato cadastrado.",
} as const;
export const PAYMENT_CLIENT_MESSAGES = {
    PAYMENT_LOAD_FAILED: "Não foi possível carregar pagamentos.",
    PAYMENT_SAVE_FAILED: "Não foi possível salvar o período.",
    PAYMENT_UPLOAD_FAILED: "Falha no upload do PDF.",
    PAYMENT_SEND_FAILED: "Falha ao enviar holerite.",
} as const;
