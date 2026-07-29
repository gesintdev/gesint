/**
 * Mensagens do módulo Usuários (app-users) — API e cliente.
 */
export const APP_USER_MESSAGES = {
    APP_USER_NOT_FOUND: "Usuário não encontrado.",
    APP_USER_DUPLICATE_USERNAME: "Nome de usuário já cadastrado.",
    APP_USER_DUPLICATE_EMAIL: "E-mail já cadastrado.",
    APP_USER_DELETED_EXISTS: "Já existe um usuário excluído com estes dados. Você pode reativá-lo.",
    APP_USER_COLLABORATOR_LINKED: "Este colaborador já possui usuário no sistema.",
} as const;

export const APP_USER_CLIENT_MESSAGES = {
    APP_USER_SAVE_FAILED: "Não foi possível salvar o usuário.",
    APP_USER_REACTIVATE_FAILED: "Não foi possível reativar o usuário.",
} as const;
