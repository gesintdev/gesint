const FIELD_LABELS: Record<string, string> = {
    fullName: "Nome completo",
    socialName: "Nome social",
    cpf: "CPF",
    rg: "RG",
    rgIssuer: "Órgão emissor",
    rgStateCode: "UF de emissão",
    birthDate: "Data de nascimento",
    email: "E-mail",
    phone: "Telefone",
    expectedStartDate: "Data de início",
    contractType: "Tipo de contrato",
    contractStartDate: "Data de início do contrato",
    motherName: "Nome da mãe",
    fatherName: "Nome do pai",
    nationality: "Nacionalidade",
    pisPasep: "PIS/PASEP",
    zipCode: "CEP",
    providerCnpj: "CNPJ da prestadora",
    providerLegalName: "Razão social da prestadora",
    username: "Usuário",
    password: "Senha",
    name: "Nome",
};

function translateRule(rule: string): string {
    const normalized = rule.trim().toLowerCase();
    if (
        normalized === "must not be null" ||
        normalized === "must not be blank" ||
        normalized === "must not be empty" ||
        normalized === "não deve ser nulo" ||
        normalized === "não deve estar em branco" ||
        normalized === "não deve estar vazio"
    ) {
        return "é obrigatório";
    }
    if (normalized.includes("well-formed email") || normalized.includes("bem formado")) {
        return "deve ser um e-mail válido";
    }
    const size =
        normalized.match(/size must be between (\d+) and (\d+)/) ??
        normalized.match(/tamanho deve estar entre (\d+) e (\d+)/);
    if (size) {
        return `deve ter entre ${size[1]} e ${size[2]} caracteres`;
    }
    return rule.trim();
}

function formatPart(part: string): string {
    const match = part.match(/^([^:]+):\s*(.+)$/);
    if (!match) {
        return part;
    }
    const field = match[1].trim();
    const leaf = field.split(/[.[\]]/).filter(Boolean).pop() ?? field;
    const label = FIELD_LABELS[leaf] ?? FIELD_LABELS[field] ?? field;
    return `${label}: ${translateRule(match[2])}`;
}

const INCOMPLETE_HEADING = "Informações incompletas";

function validationDetail(apiMessage: string): string {
    const trimmed = apiMessage.trim();
    const lower = trimmed.toLowerCase();
    const headings = ["informações incompletas", "erro de validação"];
    for (const heading of headings) {
        if (lower === heading) return "";
        const prefix = `${heading}:`;
        if (lower.startsWith(prefix)) {
            return trimmed.slice(prefix.length).trim();
        }
    }
    return trimmed;
}

/** "Informações incompletas: Nome completo: é obrigatório." */
export function formatValidationMessage(apiMessage: string): string {
    const detail = validationDetail(apiMessage);
    if (!detail) {
        return INCOMPLETE_HEADING;
    }
    const formatted = detail
        .split("; ")
        .map((part) => formatPart(part.trim()))
        .filter(Boolean);
    if (formatted.length === 0) {
        return INCOMPLETE_HEADING;
    }
    return `${INCOMPLETE_HEADING}: ${formatted.join(". ")}`;
}
