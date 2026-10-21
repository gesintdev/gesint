import type {
    DocumentDataClass,
    DocumentTypeContext,
} from "@/modules/cfg/settings/documenttype/dto/document-type.dto";
import type {SelectItem} from "@/shared/components/ui/input/select-item.types";

export const DOCUMENT_DATA_CLASS_ITEMS: SelectItem[] = [
    {value: "COMUM", label: "Comum"},
    {value: "PESSOAL", label: "Pessoal"},
    {value: "SENSIVEL", label: "Sensível"},
    {value: "FINANCEIRO", label: "Financeiro"},
];

export const DOCUMENT_DATA_CLASS_LABELS: Record<DocumentDataClass, string> = {
    COMUM: "Comum",
    PESSOAL: "Pessoal",
    SENSIVEL: "Sensível",
    FINANCEIRO: "Financeiro",
};

export const DOCUMENT_TYPE_CONTEXT_ITEMS: SelectItem[] = [
    {value: "ADMISSION_DOCUMENT", label: "Admissão — documentos"},
    {value: "ADMISSION_CONTRACT", label: "Admissão — contrato CLT"},
    {value: "ADMISSION_CONTRACT_PJ", label: "Admissão — contrato PJ"},
    {value: "OCCUPATIONAL_EXAM", label: "Exame ocupacional"},
    {value: "EXIT_INTERVIEW", label: "Entrevista de desligamento"},
    {value: "LEAVE", label: "Afastamento / férias"},
    {value: "ATTENDANCE", label: "Ponto"},
    {value: "CANDIDATE", label: "Candidato"},
    {value: "GENERAL", label: "Geral"},
];

export const DOCUMENT_TYPE_CONTEXT_LABELS: Record<DocumentTypeContext, string> = Object.fromEntries(
    DOCUMENT_TYPE_CONTEXT_ITEMS.map((item) => [item.value, item.label]),
) as Record<DocumentTypeContext, string>;
