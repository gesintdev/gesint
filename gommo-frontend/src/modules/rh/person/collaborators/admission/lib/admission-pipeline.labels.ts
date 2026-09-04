import type {
    AdmissionPipelineBlock,
    AdmissionPipelineBlockReason,
    AdmissionPipelineDeadlineKind,
    AdmissionPipelineRow,
    AdmissionPipelineSignal,
    AdmissionPipelineStep,
    AdmissionStepKey,
} from "@/modules/rh/person/collaborators/admission/dto/admission-pipeline.dto";
import { isoToDateBr } from "@/shared/lib/input/date";

/** Dia e mes: o painel e denso e o ano raramente agrega. */
export function shortDateBr(iso?: string | null): string {
    const full = iso ? isoToDateBr(iso) : "";
    return full ? full.slice(0, 5) : "—";
}

export type PipelineTone = "neutral" | "info" | "success" | "warning" | "error";

const SIGNAL_LABELS: Record<AdmissionPipelineSignal, string> = {
    PRAZO_VENCIDO: "Prazo vencido",
    BLOQUEIO: "Bloqueio",
    AGUARDANDO_PESSOA: "Aguardando pessoa",
    EM_DIA: "Em dia",
    PRONTO: "Pronto",
    APROVADA: "Aprovada",
};

const SIGNAL_TONES: Record<AdmissionPipelineSignal, PipelineTone> = {
    PRAZO_VENCIDO: "error",
    BLOQUEIO: "error",
    AGUARDANDO_PESSOA: "warning",
    EM_DIA: "info",
    PRONTO: "success",
    APROVADA: "success",
};

export function signalLabel(signal: AdmissionPipelineSignal): string {
    return SIGNAL_LABELS[signal];
}

export function signalTone(signal: AdmissionPipelineSignal): PipelineTone {
    return SIGNAL_TONES[signal];
}

const STEP_LABELS: Record<AdmissionStepKey, string> = {
    DOCUMENTACAO: "Documentos",
    EXAME: "ASO",
    CONTRATO: "Contrato",
    REGISTRO: "Registro",
    ESOCIAL: "S-2200",
    INTEGRACAO: "Integração",
};

/** Etapas ainda abertas na esteira (para mensagem de aprovação manual). Omite S-2200 sem prazo. */
export function pendingStepLabels(row: AdmissionPipelineRow): string[] {
    return row.steps
        .filter((step) => step.stepStatus !== "DONE" && step.stepStatus !== "SKIPPED")
        .filter((step) => !(step.stepKey === "ESOCIAL" && !step.dueDate && step.stepStatus === "PENDING"))
        .map((step) => STEP_LABELS[step.stepKey]);
}

/** Junta nomes em português: "A, B e C". */
export function joinPtList(items: string[]): string {
    if (items.length === 0) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} e ${items[1]}`;
    return `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;
}

export function approveConfirmMessage(row: AdmissionPipelineRow): string {
    const pending = pendingStepLabels(row);
    if (pending.length === 0) {
        return "ATENÇÃO: aprovar esta admissão?";
    }
    return `ATENÇÃO: Admissão com ${joinPtList(pending)} pendentes, aprovar mesmo assim?`;
}

/**
 * O rotulo do exame carrega o estado porque e a etapa que trava a esteira. Só IN_PROGRESS
 * significa exame agendado: e o unico status que o backend deriva de um ASO com data marcada.
 * BLOCKED e o oposto — falta ASO apto e o inicio ja chegou.
 */
export function stepLabel(step: AdmissionPipelineStep): string {
    if (step.stepKey !== "EXAME") return STEP_LABELS[step.stepKey];
    if (step.stepStatus === "DONE") return "ASO apto";
    if (step.stepStatus === "IN_PROGRESS") return "ASO agend.";
    if (step.stepStatus === "BLOCKED") return "Sem ASO";
    return "ASO";
}

export function stepTone(step: AdmissionPipelineStep): PipelineTone {
    if (step.stepStatus === "DONE" || step.stepStatus === "SKIPPED") return "success";
    if (step.stepStatus === "BLOCKED" || step.overdue) return "error";
    if (step.stepStatus === "IN_PROGRESS") return "info";
    return "neutral";
}

const DEADLINE_TITLES: Record<AdmissionPipelineDeadlineKind, string> = {
    ASO_ADMISSIONAL: "ASO admissional",
    REGISTRO_CARTEIRA: "Registro em carteira",
    ESOCIAL_S2200: "eSocial S-2200",
};

/**
 * Base normativa exibida junto de cada prazo. Leitura da especificação funcional, não parecer
 * jurídico: conferir contra a redação vigente antes de tratar como regra dura.
 */
const DEADLINE_LEGAL_BASIS: Record<AdmissionPipelineDeadlineKind, string> = {
    ASO_ADMISSIONAL: "NR-7 · antes do início das atividades",
    REGISTRO_CARTEIRA: "CLT art. 29 · 5 dias úteis da admissão",
    ESOCIAL_S2200: "aguarda integração eSocial",
};

export function deadlineTitle(kind: AdmissionPipelineDeadlineKind): string {
    return DEADLINE_TITLES[kind];
}

export function deadlineLegalBasis(kind: AdmissionPipelineDeadlineKind): string {
    return DEADLINE_LEGAL_BASIS[kind];
}

/** "−24d" quando vencido, a data quando ainda ha prazo. */
export function deadlineWhenLabel(daysFromToday: number, dueDate: string): string {
    if (daysFromToday < 0) return `−${Math.abs(daysFromToday)}d`;
    return shortDateBr(dueDate);
}

export function rowSubtitle(row: AdmissionPipelineRow): string {
    const parts: string[] = [];
    if (row.departmentName) parts.push(row.departmentName);
    if (row.expectedStartDate) parts.push(`início ${shortDateBr(row.expectedStartDate)}`);
    return parts.join(" · ");
}

/** Frase de acao da coluna direita. Deriva do sinal e dos fatos que o backend devolveu. */
export function rowMessage(row: AdmissionPipelineRow): string {
    const days = row.daysSinceExpectedStart;

    if (row.signal === "PRAZO_VENCIDO") {
        // Aqui vale o nome puro da etapa: quem carrega o estado e o "em atraso" da frase.
        const overdue = row.steps.filter((step) => step.overdue).map((step) => STEP_LABELS[step.stepKey]);
        const pending = overdue.length > 0 ? `${overdue.join(" e ")} em atraso.` : "Prazo legal vencido.";
        if (days != null && days > 0) return `Iniciou há ${days} dias. ${pending}`;
        return pending;
    }

    if (row.signal === "BLOQUEIO") {
        if (row.examScheduledDate) {
            return `Exame em ${shortDateBr(row.examScheduledDate)}. Sem ASO apto não pode iniciar.`;
        }
        return "Sem ASO admissional apto. Não pode iniciar as atividades.";
    }

    if (row.signal === "AGUARDANDO_PESSOA") {
        return `${row.documentsReceived} de ${row.documentsRequired} documentos recebidos.`;
    }

    if (row.signal === "PRONTO") {
        return "Esteira concluída. Pronto para o primeiro dia.";
    }

    if (row.signal === "APROVADA") {
        const pending = pendingStepLabels(row);
        if (pending.length === 0) {
            return "Aprovada. Sem pendências na esteira.";
        }
        return `Aprovada com ${joinPtList(pending)} pendentes.`;
    }

    if (row.nextDueDate && row.nextDueKind) {
        return `${deadlineTitle(row.nextDueKind)} até ${shortDateBr(row.nextDueDate)}.`;
    }
    return "Sem pendências de prazo.";
}

const BLOCK_REASON_LABELS: Record<AdmissionPipelineBlockReason, string> = {
    SEM_ASO_APTO: "Sem ASO admissional apto",
    INICIO_ULTRAPASSADO: "Data de início já ultrapassada",
    ESOCIAL_REJEITADO: "Evento S-2200 rejeitado",
};

export function blockTitle(reason: AdmissionPipelineBlockReason): string {
    return BLOCK_REASON_LABELS[reason];
}

export function blockDescription(block: AdmissionPipelineBlock): string {
    if (block.reason === "SEM_ASO_APTO") {
        const start = block.expectedStartDate ? `Início previsto para ${shortDateBr(block.expectedStartDate)}` : "";
        const exam = block.examScheduledDate
            ? `o exame só ocorre em ${shortDateBr(block.examScheduledDate)} e o resultado precisa constar antes.`
            : "agende o exame ou adie a data de início.";
        return start ? `${start} — ${exam}` : exam.charAt(0).toUpperCase() + exam.slice(1);
    }
    if (block.reason === "INICIO_ULTRAPASSADO") {
        return "A esteira segue aberta. Regularizar o registro e transmitir o S-2200 com justificativa de atraso.";
    }
    return "O evento foi rejeitado pelo governo. Corrija os erros apontados e retransmita.";
}
