import type {
    ExitInterviewAnswerDto,
    ExitInterviewRatingDto,
    ExitInterviewReason,
    ExitInterviewReturnChecklistItemDto,
    ExitInterviewStatus,
    ExitInterviewTerminationType,
    ReturnItemStatus,
} from "@/modules/rh/person/exitinterview/dto/exit-interview.dto";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";

export const EXIT_INTERVIEW_STATUS_LABELS: Record<ExitInterviewStatus, string> = {
    DRAFT: "Rascunho",
    SCHEDULED: "Agendada",
    IN_PROGRESS: "Em andamento",
    COMPLETED: "Concluida",
    CANCELED: "Cancelada",
};

export const EXIT_INTERVIEW_STATUS_ITEMS: SelectItem[] = [
    { value: "DRAFT", label: "Rascunho" },
    { value: "SCHEDULED", label: "Agendada" },
    { value: "IN_PROGRESS", label: "Em andamento" },
];

export const RELATIONSHIP_TYPE_ITEMS: SelectItem[] = [
    { value: "CLT", label: "CLT" },
    { value: "PJ", label: "PJ" },
];

export const CLT_TERMINATION_ITEMS: SelectItem[] = [
    { value: "CLT_RESIGNATION", label: "Pedido de demissao" },
    { value: "CLT_DISMISSAL_WITHOUT_CAUSE", label: "Dispensa sem justa causa" },
    { value: "CLT_DISMISSAL_WITH_CAUSE", label: "Dispensa com justa causa" },
    { value: "CLT_PROBATION_CONTRACT_END", label: "Termino de contrato de experiencia" },
    { value: "CLT_FIXED_TERM_CONTRACT_END", label: "Termino de contrato por prazo determinado" },
    { value: "CLT_MUTUAL_AGREEMENT", label: "Acordo entre empregado e empregador" },
    { value: "CLT_RETIREMENT", label: "Aposentadoria" },
    { value: "CLT_DEATH", label: "Falecimento" },
    { value: "CLT_OTHER", label: "Outro" },
];

export const PJ_TERMINATION_ITEMS: SelectItem[] = [
    { value: "PJ_COMPANY_INITIATIVE", label: "Encerramento por iniciativa da empresa" },
    { value: "PJ_PROVIDER_INITIATIVE", label: "Encerramento por iniciativa do prestador" },
    { value: "PJ_CONTRACT_END", label: "Termino de contrato" },
    { value: "PJ_MUTUAL_AGREEMENT", label: "Encerramento por acordo" },
    { value: "PJ_CONTRACT_BREACH", label: "Descumprimento contratual" },
    { value: "PJ_PROVIDER_REPLACEMENT", label: "Substituicao de fornecedor/prestador" },
    { value: "PJ_OTHER", label: "Outro" },
];

export const TERMINATION_TYPE_LABELS: Record<ExitInterviewTerminationType, string> = Object.fromEntries(
    [...CLT_TERMINATION_ITEMS, ...PJ_TERMINATION_ITEMS].map((item) => [item.value, item.label]),
) as Record<ExitInterviewTerminationType, string>;

export const EXIT_REASON_ITEMS: SelectItem[] = [
    { value: "COMPENSATION", label: "Salario/remuneracao" },
    { value: "BENEFITS", label: "Beneficios" },
    { value: "EXTERNAL_OFFER", label: "Proposta externa" },
    { value: "LACK_OF_GROWTH", label: "Falta de crescimento" },
    { value: "LEADERSHIP", label: "Lideranca" },
    { value: "ORGANIZATIONAL_CLIMATE", label: "Clima organizacional" },
    { value: "CULTURE", label: "Cultura" },
    { value: "WORKLOAD", label: "Carga de trabalho" },
    { value: "RELOCATION", label: "Mudanca de cidade" },
    { value: "PERSONAL_REASONS", label: "Motivos pessoais" },
    { value: "HEALTH", label: "Saude" },
    { value: "PERFORMANCE", label: "Desempenho" },
    { value: "CONTRACT_END", label: "Encerramento de contrato" },
    { value: "PROCESS_DISSATISFACTION", label: "Insatisfacao com processos" },
    { value: "OTHER", label: "Outro" },
];

export const EXIT_REASON_LABELS: Record<ExitInterviewReason, string> = Object.fromEntries(
    EXIT_REASON_ITEMS.map((item) => [item.value, item.label]),
) as Record<ExitInterviewReason, string>;

export const REHIRE_ANSWER_ITEMS: SelectItem[] = [
    { value: "YES", label: "Sim" },
    { value: "NO", label: "Nao" },
    { value: "MAYBE", label: "Talvez" },
];

export const YES_NO_RECOMMEND_ITEMS: SelectItem[] = [
    { value: "true", label: "Sim" },
    { value: "false", label: "Nao" },
];

export const RETURN_STATUS_ITEMS: SelectItem[] = [
    { value: "PENDING", label: "Pendente" },
    { value: "RETURNED", label: "Devolvido" },
    { value: "NOT_APPLICABLE", label: "Nao aplicavel" },
    { value: "DAMAGED", label: "Danificado" },
    { value: "LOST", label: "Extraviado" },
];

export const RETURN_STATUS_LABELS: Record<ReturnItemStatus, string> = Object.fromEntries(
    RETURN_STATUS_ITEMS.map((item) => [item.value, item.label]),
) as Record<ReturnItemStatus, string>;

export const EXIT_INTERVIEW_DOCUMENT_TYPE_ITEMS: SelectItem[] = [
    { value: "TERMINATION_TERM", label: "Termo de desligamento" },
    { value: "SIGNED_INTERVIEW", label: "Entrevista assinada" },
    { value: "PJ_CONTRACT_TERMINATION", label: "Distrato/encerramento PJ" },
    { value: "RETURN_PROOF", label: "Comprovante de devolucao" },
    { value: "OTHER", label: "Outro documento" },
];

export const DEFAULT_RATINGS: ExitInterviewRatingDto[] = [
    { key: "work_environment", label: "Ambiente de trabalho", score: 1 },
    { key: "communication", label: "Comunicacao", score: 1 },
    { key: "compensation", label: "Remuneracao", score: 1 },
    { key: "benefits", label: "Beneficios", score: 1 },
    { key: "tools", label: "Equipamentos/ferramentas", score: 1 },
    { key: "development", label: "Desenvolvimento profissional", score: 1 },
    { key: "recognition", label: "Reconhecimento", score: 1 },
    { key: "culture", label: "Cultura", score: 1 },
    { key: "internal_processes", label: "Processos internos", score: 1 },
    { key: "workload", label: "Carga de trabalho", score: 1 },
    { key: "team_relationship", label: "Relacionamento com equipe", score: 1 },
];

export const DEFAULT_OPEN_ANSWERS: ExitInterviewAnswerDto[] = [
    { key: "motivation", question: "O que motivou sua saida?", type: "LONG_TEXT", answer: "" },
    { key: "liked_most", question: "O que mais gostava na empresa?", type: "LONG_TEXT", answer: "" },
    { key: "liked_least", question: "O que menos gostava?", type: "LONG_TEXT", answer: "" },
    { key: "improvements", question: "O que poderia ser melhorado?", type: "LONG_TEXT", answer: "" },
    { key: "feedback", question: "Recebeu feedback suficiente?", type: "LONG_TEXT", answer: "" },
    { key: "onboarding", question: "O treinamento/onboarding foi adequado?", type: "LONG_TEXT", answer: "" },
    { key: "stay_factor", question: "O que faria voce permanecer?", type: "LONG_TEXT", answer: "" },
    { key: "recommend", question: "Voce indicaria a empresa para outra pessoa?", type: "LONG_TEXT", answer: "" },
    { key: "final_suggestion", question: "Tem alguma sugestao final?", type: "LONG_TEXT", answer: "" },
];

export const DEFAULT_RETURN_CHECKLIST: ExitInterviewReturnChecklistItemDto[] = [
    { key: "notebook", description: "Notebook", status: "PENDING", returnedAt: "", notes: "" },
    { key: "phone", description: "Celular", status: "PENDING", returnedAt: "", notes: "" },
    { key: "badge", description: "Cracha", status: "PENDING", returnedAt: "", notes: "" },
    { key: "keys", description: "Chaves", status: "PENDING", returnedAt: "", notes: "" },
    { key: "corporate_card", description: "Cartao corporativo", status: "PENDING", returnedAt: "", notes: "" },
    { key: "uniform", description: "Uniforme", status: "PENDING", returnedAt: "", notes: "" },
    { key: "tools", description: "Ferramentas", status: "PENDING", returnedAt: "", notes: "" },
    { key: "vehicle", description: "Veiculo", status: "PENDING", returnedAt: "", notes: "" },
    { key: "token", description: "Token", status: "PENDING", returnedAt: "", notes: "" },
    { key: "digital_certificate", description: "Certificado digital", status: "PENDING", returnedAt: "", notes: "" },
    { key: "other", description: "Outros", status: "PENDING", returnedAt: "", notes: "" },
];
