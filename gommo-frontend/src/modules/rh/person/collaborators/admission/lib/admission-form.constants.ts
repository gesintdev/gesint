import {FormStepNavItem} from "@/shared/components/ui/FormStepper";
import type {SelectItem} from "@/shared/components/ui/input/select-item.types";

export const CONTRACT_TYPE_ITEMS: SelectItem[] = [
    { value: "CLT", label: "CLT" },
    { value: "PJ", label: "Prestador de Serviço" },
    { value: "INTERMITTENT", label: "Intermitente" },
    { value: "APPRENTICE", label: "Aprendiz" },
    { value: "INTERN", label: "Estágio" },
];
export const WORKLOAD_SCHEDULE_ITEMS: SelectItem[] = [
    { value: "44h", label: "44h" },
    { value: "40h", label: "40h" },
    { value: "36h", label: "36h" },
    { value: "30h", label: "30h" },
    { value: "20h a 30h", label: "20h a 30h" },
    { value: "12x36", label: "12x36" },
];
export const ADMISSION_DOCUMENT_TYPE_ITEMS: SelectItem[] = [
    { value: "RG", label: "RG" },
    { value: "CPF", label: "CPF" },
    { value: "COMPROVANTE_ENDERECO", label: "Comprovante de Endereço" },
    { value: "CTPS", label: "CTPS" },
    { value: "TITULO_ELEITOR", label: "Título de Eleitor" },
    { value: "CERTIDAO_NASCIMENTO", label: "Certidão de Nascimento/Casamento" },
    { value: "COMPROVANTE_ESCOLARIDADE", label: "Comprovante de Escolaridade" },
    { value: "OUTRO", label: "Outro" },
];
export const EMERGENCY_CONTACT_RELATIONSHIP_ITEMS: SelectItem[] = [
    { value: "MAE", label: "Mãe" },
    { value: "PAI", label: "Pai" },
    { value: "CONJUGE", label: "Cônjuge" },
    { value: "FILHO", label: "Filho(a)" },
    { value: "IRMAO", label: "Irmão(ã)" },
    { value: "AMIGO", label: "Amigo(a)" },
    { value: "OUTRO", label: "Outro" },
];
export const CONTRACT_DOCUMENT_TYPE_ITEMS: SelectItem[] = [
    { value: "CONTRATO_ASSINADO", label: "Contrato assinado" },
    { value: "ADITIVO", label: "Aditivo contratual" },
    { value: "TERMO_CONFIDENCIALIDADE", label: "Termo de confidencialidade" },
    { value: "OUTRO", label: "Outro" },
];
export const CONTRACT_DOCUMENT_TYPE_ITEMS_PJ: SelectItem[] = [
    { value: "CONTRATO_PRESTACAO", label: "Contrato de prestação de serviços" },
    { value: "CARTAO_CNPJ", label: "Cartão CNPJ" },
    { value: "CONTRATO_ASSINADO", label: "Contrato assinado" },
    { value: "TERMO_CONFIDENCIALIDADE", label: "Termo de confidencialidade" },
    { value: "OUTRO", label: "Outro" },
];

export function contractDocumentTypeItems(contractType?: string | null): SelectItem[] {
    return contractType === "PJ" ? CONTRACT_DOCUMENT_TYPE_ITEMS_PJ : CONTRACT_DOCUMENT_TYPE_ITEMS;
}

export const ADMISSION_STATUS_LABELS: Record<string, string> = {
    DRAFT: "Em andamento",
    IN_PROGRESS: "Em andamento",
    COMPLETED: "Concluída",
    CANCELLED: "Cancelada",
};

export function admissionStatusLabel(value?: string | null): string {
    if (!value) return "—";
    return ADMISSION_STATUS_LABELS[value.toUpperCase()] ?? value;
}

export function contractTypeLabel(value?: string | null): string {
    return CONTRACT_TYPE_ITEMS.find((item) => item.value === value)?.label ?? value ?? "—";
}

export function documentTypeLabel(value?: string | null, items = ADMISSION_DOCUMENT_TYPE_ITEMS): string {
    return items.find((item) => item.value === value)?.label ?? value ?? "—";
}

export const GENDER_ITEMS: SelectItem[] = [
    { value: "MALE", label: "Masculino" },
    { value: "FEMALE", label: "Feminino" },
    { value: "OTHER", label: "Outro" },
    { value: "NOT_INFORMED", label: "Prefere não informar" },
];

export const MARITAL_ITEMS: SelectItem[] = [
    { value: "SINGLE", label: "Solteiro(a)" },
    { value: "MARRIED", label: "Casado(a)" },
    { value: "DIVORCED", label: "Divorciado(a)" },
    { value: "WIDOWED", label: "Viúvo(a)" },
    { value: "OTHER", label: "Outro" },
];

export const YES_NO_ITEMS: SelectItem[] = [
    { value: "false", label: "Não" },
    { value: "true", label: "Sim" },
];

export const RECESS_FINANCIAL_ITEMS: SelectItem[] = [
    { value: "FULLY_PAID", label: "Valor contratual integral" },
    { value: "UNPAID", label: "Sem faturamento no período" },
    { value: "PROPORTIONAL", label: "Valor contratual proporcional" },
    { value: "CUSTOM", label: "Tratamento contratual específico" },
];

export const ADMISSION_FORM_STEPS: FormStepNavItem[] = [
    { id: "dados-basicos", label: "Dados básicos" },
    { id: "contatos-emergencia", label: "Contatos de emergência" },
    { id: "endereco", label: "Endereço" },
    { id: "documentos", label: "Documentos" },
    { id: "vinculo", label: "Vínculo" },
    { id: "contrato", label: "Contrato" },
    { id: "observacoes", label: "Observações" },
];
