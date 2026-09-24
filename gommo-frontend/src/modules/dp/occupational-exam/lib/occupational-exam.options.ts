import type { SelectItem } from "@/shared/components/ui/input/select-item.types";

export const OCCUPATIONAL_EXAM_TYPE_LABELS: Record<string, string> = {
    ADMISSIONAL: "Admissional",
    PERIODICO: "Periodico",
    RETORNO_AO_TRABALHO: "Retorno ao trabalho",
    MUDANCA_DE_RISCO_OCUPACIONAL: "Mudanca de risco",
    DEMISSIONAL: "Demissional",
};

export const OCCUPATIONAL_EXAM_LIFECYCLE_LABELS: Record<string, string> = {
    PREVISTO: "Previsto",
    CONVOCADO: "Convocado",
    REALIZADO: "Realizado",
    REGISTRADO: "Registrado",
    TRANSMITIDO: "Transmitido",
    ARQUIVADO: "Arquivado",
    VENCIDO_INADIMPLENTE: "Vencido / inadimplente",
};

export const OCCUPATIONAL_EXAM_RESULT_LABELS: Record<string, string> = {
    FIT: "Apto",
    UNFIT: "Inapto",
};

export const OCCUPATIONAL_EXAM_TYPE_ITEMS: SelectItem[] = Object.entries(OCCUPATIONAL_EXAM_TYPE_LABELS).map(
    ([value, label]) => ({ value, label }),
);

export const OCCUPATIONAL_EXAM_LIFECYCLE_ITEMS: SelectItem[] = Object.entries(
    OCCUPATIONAL_EXAM_LIFECYCLE_LABELS,
).map(([value, label]) => ({ value, label }));

export const OCCUPATIONAL_EXAM_RESULT_ITEMS: SelectItem[] = Object.entries(OCCUPATIONAL_EXAM_RESULT_LABELS).map(
    ([value, label]) => ({ value, label }),
);

export const OCCUPATIONAL_EXAM_ENTITY_TYPE = "OCCUPATIONAL_EXAM";
/** Papel do vínculo no storage (tipo ASO/laudo fica em documentType). */
export const OCCUPATIONAL_EXAM_LINK_ROLE = "DOCUMENT";
