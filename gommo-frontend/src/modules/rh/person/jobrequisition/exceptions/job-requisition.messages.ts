export const JOB_REQUISITION_MESSAGES = {
    JOB_REQUISITION_NOT_FOUND: "Requisição de vaga não encontrada.",
    JOB_REQUISITION_JOB_POSITION_NOT_FOUND: "Cargo informado não encontrado.",
    JOB_REQUISITION_OFFBOARDING_NOT_FOUND: "Desligamento de origem não encontrado.",
    JOB_REQUISITION_OFFBOARDING_REQUIRED: "Na substituição, informe quem está sendo substituído.",
    JOB_REQUISITION_NOT_EDITABLE: "Somente requisições em rascunho podem ser editadas.",
    JOB_REQUISITION_INVALID_STATUS: "Status da requisição inválido para esta operação.",
    JOB_REQUISITION_SUBMIT_INCOMPLETE:
        "Para enviar para aprovação, informe cargo, nível, tipo de vínculo e salário proposto.",
    JOB_REQUISITION_JUSTIFICATION_REQUIRED: "Salário fora da faixa do cargo exige justificativa.",
    JOB_REQUISITION_STAGE_NOT_ALLOWED: "Seu perfil não tem alçada para decidir esta etapa da requisição.",
    JOB_REQUISITION_REJECTION_REASON_REQUIRED: "Informe o motivo da reprovação.",
    JOB_REQUISITION_DELETE_BLOCKED: "Requisição aprovada não pode ser excluída.",
} as const;

export const JOB_REQUISITION_CLIENT_MESSAGES = {
    JOB_REQUISITION_LOAD_FAILED: "Não foi possível carregar a requisição.",
    JOB_REQUISITION_SAVE_FAILED: "Não foi possível salvar a requisição.",
    JOB_REQUISITION_SUBMIT_FAILED: "Não foi possível enviar a requisição para aprovação.",
    JOB_REQUISITION_DECISION_FAILED: "Não foi possível registrar a decisão.",
    JOB_REQUISITION_CANCEL_FAILED: "Não foi possível cancelar a requisição.",
    JOB_REQUISITION_DELETE_FAILED: "Não foi possível excluir a requisição.",
} as const;
