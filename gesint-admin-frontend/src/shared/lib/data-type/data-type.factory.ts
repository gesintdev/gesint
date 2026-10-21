import { maskCep } from "@/shared/lib/input/cep";
import { maskCnpj } from "@/shared/lib/input/cnpj";
import { maskCpf } from "@/shared/lib/input/cpf";
import { maskPhone } from "@/shared/lib/input/phone";
import { DataType } from "@/shared/types/data-type";

const EMPTY = "—";

export type DataTypeHandler = {
    /** Formata o valor para exibição (máscara / locale). */
    mask: (value: unknown) => string;
};

function isEmpty(value: unknown): boolean {
    return value == null || value === "";
}

function asString(value: unknown): string {
    if (isEmpty(value)) return EMPTY;
    return String(value);
}

function parseDateInput(value: unknown, localDateOnly = false): Date | null {
    if (isEmpty(value)) return null;
    if (localDateOnly && typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day);
    }
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? null : date;
}

const BADGE_LABELS: Record<string, string> = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    DELETED: "Excluído",
    DRAFT: "Rascunho",
    IN_PROGRESS: "Em andamento",
    COMPLETED: "Concluída",
    CANCELLED: "Cancelada",
    PENDING: "Pendente",
    READY: "Pronto",
    ERROR: "Erro",
    PROVISIONING: "Provisionando",
};

function formatBadgeLabel(value: unknown): string {
    const key = String(value).toUpperCase();
    return BADGE_LABELS[key] ?? String(value);
}

const handlers: Record<DataType, DataTypeHandler> = {
    [DataType.STRING]: {
        mask: asString,
    },
    [DataType.SELECT]: {
        mask: (value) => (isEmpty(value) ? EMPTY : formatBadgeLabel(value)),
    },
    [DataType.BADGE]: {
        mask: (value) => (isEmpty(value) ? EMPTY : formatBadgeLabel(value)),
    },
    [DataType.BOOLEAN]: {
        mask: (value) => {
            if (isEmpty(value)) return EMPTY;
            return value === true || value === "true" || value === 1 ? "Sim" : "Não";
        },
    },
    [DataType.CNPJ]: {
        mask: (value) => (isEmpty(value) ? EMPTY : maskCnpj(String(value))),
    },
    [DataType.CPF]: {
        mask: (value) => (isEmpty(value) ? EMPTY : maskCpf(String(value))),
    },
    [DataType.CEP]: {
        mask: (value) => (isEmpty(value) ? EMPTY : maskCep(String(value))),
    },
    [DataType.PHONE]: {
        mask: (value) => (isEmpty(value) ? EMPTY : maskPhone(String(value))),
    },
    [DataType.EMAIL]: {
        mask: asString,
    },
    [DataType.UUID]: {
        mask: (value) => {
            if (isEmpty(value)) return EMPTY;
            return `${String(value).slice(0, 8)}…`;
        },
    },
    [DataType.DATE]: {
        mask: (value) => {
            if (isEmpty(value)) return EMPTY;
            const date = parseDateInput(value, true);
            if (!date) return String(value);
            return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
        },
    },
    [DataType.DATETIME]: {
        mask: (value) => {
            if (isEmpty(value)) return EMPTY;
            const date = parseDateInput(value);
            if (!date) return String(value);
            return new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
            }).format(date);
        },
    },
    [DataType.INTEGER]: {
        mask: (value) => {
            if (isEmpty(value)) return EMPTY;
            const num = Number(value);
            if (Number.isNaN(num)) return String(value);
            return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(num);
        },
    },
    [DataType.DECIMAL]: {
        mask: (value) => {
            if (isEmpty(value)) return EMPTY;
            const num = Number(value);
            if (Number.isNaN(num)) return String(value);
            return new Intl.NumberFormat("pt-BR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 4,
            }).format(num);
        },
    },
    [DataType.CURRENCY]: {
        mask: (value) => {
            if (isEmpty(value)) return EMPTY;
            const num = Number(value);
            if (Number.isNaN(num)) return String(value);
            return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
        },
    },
    [DataType.PERCENT]: {
        mask: (value) => {
            if (isEmpty(value)) return EMPTY;
            const num = Number(value);
            if (Number.isNaN(num)) return String(value);
            return new Intl.NumberFormat("pt-BR", {
                style: "percent",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }).format(num / 100);
        },
    },
};

/**
 * Factory de tratativas por {@link DataType}.
 * Primeira capacidade: máscaras / formatação de exibição.
 */
export const DataTypeFactory = {
    get(dataType: DataType): DataTypeHandler {
        return handlers[dataType] ?? handlers[DataType.STRING];
    },

    /** Aplica a máscara/formatação do tipo. Sem tipo, retorna string crua. */
    mask(value: unknown, dataType?: DataType): string {
        if (!dataType) {
            if (isEmpty(value)) return "";
            return String(value);
        }
        return this.get(dataType).mask(value);
    },

    hasMask(dataType?: DataType): boolean {
        if (!dataType) return false;
        return (
            dataType === DataType.CNPJ ||
            dataType === DataType.CPF ||
            dataType === DataType.CEP ||
            dataType === DataType.PHONE ||
            dataType === DataType.CURRENCY ||
            dataType === DataType.PERCENT ||
            dataType === DataType.INTEGER ||
            dataType === DataType.DECIMAL ||
            dataType === DataType.DATE ||
            dataType === DataType.DATETIME ||
            dataType === DataType.BOOLEAN ||
            dataType === DataType.UUID ||
            dataType === DataType.BADGE ||
            dataType === DataType.SELECT
        );
    },
};
