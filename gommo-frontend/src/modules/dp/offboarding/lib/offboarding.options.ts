import type {SelectItem} from "@/shared/components/ui/input/select-item.types";

export const NOTICE_TYPE_ITEMS: SelectItem[] = [
    {value: "WORKED_BY_EMPLOYEE", label: "Trabalhado pelo empregado"},
    {value: "WORKED_BY_EMPLOYER", label: "Cumprido pelo empregador"},
    {value: "INDEMNIFIED", label: "Indenizado"},
    {value: "NOT_APPLICABLE", label: "Não se aplica"},
];

export const NOTICE_TYPE_LABELS: Record<string, string> = Object.fromEntries(
    NOTICE_TYPE_ITEMS.map((item) => [item.value, item.label]),
);

export const PROCESS_STATUS_LABELS: Record<string, string> = {
    DRAFT: "Rascunho",
    COMPLETED: "Concluído",
};

export const ACCOUNTANT_PACKAGE_STATUS_LABELS: Record<string, string> = {
    PENDING: "Pendente",
    READY: "Pronto",
    SENT: "Enviado",
    FAILED: "Falha no envio",
};

export const CHECKLIST_STATUS_ITEMS: SelectItem[] = [
    {value: "PENDING", label: "Pendente"},
    {value: "RETURNED", label: "Devolvido / concluído"},
    {value: "NOT_APPLICABLE", label: "Não aplicável"},
    {value: "DAMAGED", label: "Danificado"},
    {value: "LOST", label: "Extraviado"},
];

export const ACCESS_CHECKLIST_ITEMS = [
    {
        key: "access_pdv",
        description: "Acesso ao PDV desativado",
        category: "ACCESS" as const,
    },
    {
        key: "access_gesint",
        description: "Acesso ao Gesint desativado",
        category: "ACCESS" as const,
    },
];
