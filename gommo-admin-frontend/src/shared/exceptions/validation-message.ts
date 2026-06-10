const FIELD_LABELS: Record<string, string> = {
    clientId: "Cliente",
    username: "Usu\u00e1rio",
    email: "E-mail",
    password: "Senha",
    displayName: "Nome de exibi\u00e7\u00e3o",
    fullName: "Nome completo",
    name: "Nome",
    slug: "Slug",
    document: "CNPJ",
};
const RULE_LABELS: Record<string, string> = {
    "must not be null": "\u00e9 obrigat\u00f3rio",
    "must not be blank": "\u00e9 obrigat\u00f3rio",
    "deve ter entre 8 e 100 caracteres": "deve ter entre 8 e 100 caracteres",
    "must be a well-formed email address": "deve ser um e-mail v\u00e1lido",
};

export function formatValidationMessage(apiMessage: string): string {
    const colonIdx = apiMessage.indexOf(": ");
    if (colonIdx < 0) return apiMessage;
    const detail = apiMessage.slice(colonIdx + 2).trim();
    const match = detail.match(/^([\w.]+):\s*(.+)$/);
    if (!match) return detail;
    const [, field, rule] = match;
    const label = FIELD_LABELS[field] ?? field;
    const ruleText = RULE_LABELS[rule] ?? rule;
    return `${label}: ${ruleText}`;
}
