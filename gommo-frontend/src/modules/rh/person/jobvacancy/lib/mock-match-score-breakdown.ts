import type { Candidate } from "@/modules/rh/person/candidate/dto/candidate.dto";
import type { JobVacancy } from "@/modules/rh/person/jobvacancy/dto/job-vacancy.dto";
import { splitLines } from "@/modules/rh/person/jobvacancy/lib/careers-form.util";
import {
    JOB_VACANCY_CONTRACT_TYPE_LABELS,
    JOB_VACANCY_SENIORITY_LABELS,
    JOB_VACANCY_WORK_MODALITY_LABELS,
} from "@/modules/rh/person/jobvacancy/lib/job-vacancy.options";

export type MatchScoreCriterion = {
    id: string;
    label: string;
    required: string;
    found: string;
    score: number;
    weight: number;
};

export type MatchScoreBreakdown = {
    totalScore: number;
    summary: string;
    criteria: MatchScoreCriterion[];
};

function hashPart(seed: string, salt: number): number {
    let hash = salt >>> 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return hash;
}

/** Nota individual mock estável (0–100) por critério. */
export function mockCriterionScore(applicationId: string, index: number): number {
    return 18 + (hashPart(applicationId, index + 7) % 83);
}

/** Percentual do somatório dos pontos individuais em relação ao máximo possível. */
export function totalScoreFromCriterionScores(scores: number[]): number {
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, score) => acc + score, 0);
    const max = scores.length * 100;
    return Math.round((sum / max) * 100);
}

function criterionCountForVacancy(vacancy?: Pick<JobVacancy, "requirements"> | null): number {
    return 4 + splitLines(vacancy?.requirements).slice(0, 5).length;
}

/**
 * Score total mock = percentual do somatório das notas individuais.
 * Usa a mesma rubrica do breakdown (4 critérios base + até 5 requisitos da vaga).
 */
export function mockMatchScore(
    applicationId: string,
    vacancy?: Pick<JobVacancy, "requirements"> | null,
): number {
    const count = criterionCountForVacancy(vacancy);
    const scores = Array.from({ length: count }, (_, index) => mockCriterionScore(applicationId, index));
    return totalScoreFromCriterionScores(scores);
}

function foundCopy(score: number, positive: string, partial: string, negative: string): string {
    if (score >= 80) return positive;
    if (score >= 55) return partial;
    return negative;
}

/**
 * Rubrica mock estável por candidatura.
 * Requisitos vêm da vaga; achados e notas individuais são fictícios (UI pré-IA).
 * O total da tag é o percentual do somatório das notas individuais.
 */
export function buildMockMatchBreakdown(
    applicationId: string,
    vacancy: JobVacancy,
    candidate?: Candidate | null,
): MatchScoreBreakdown {
    const requirementLines = splitLines(vacancy.requirements).slice(0, 5);
    const topExperience = candidate?.experiences?.[0];
    const experienceLabel = topExperience
        ? `${topExperience.jobTitle} em ${topExperience.companyName}`
        : "experiência recente informada na candidatura";
    const locationLabel = [candidate?.city, candidate?.stateCode].filter(Boolean).join(" / ") || null;

    const seniorityRequired = vacancy.seniorityLevel
        ? JOB_VACANCY_SENIORITY_LABELS[vacancy.seniorityLevel]
        : "Não informado";
    const modalityRequired = vacancy.workModality
        ? JOB_VACANCY_WORK_MODALITY_LABELS[vacancy.workModality]
        : "Não informado";
    const contractRequired = vacancy.contractType
        ? JOB_VACANCY_CONTRACT_TYPE_LABELS[vacancy.contractType]
        : "Não informado";

    const base: Omit<MatchScoreCriterion, "score">[] = [
        {
            id: "experience",
            label: "Experiência profissional",
            required: "Experiência alinhada às atribuições e atividades da vaga",
            found: "",
            weight: 3,
        },
        {
            id: "seniority",
            label: "Senioridade",
            required: seniorityRequired,
            found: "",
            weight: 2,
        },
        {
            id: "modality",
            label: "Modalidade / localização",
            required: [modalityRequired, vacancy.location].filter(Boolean).join(" · ") || "Não informado",
            found: "",
            weight: 1,
        },
        {
            id: "contract",
            label: "Tipo de contrato",
            required: contractRequired,
            found: "",
            weight: 1,
        },
    ];

    const requirementCriteria: Omit<MatchScoreCriterion, "score">[] = requirementLines.map((line, index) => ({
        id: `req-${index}`,
        label: `Requisito ${index + 1}`,
        required: line,
        found: "",
        weight: 2,
    }));

    const drafts = [...base, ...requirementCriteria];
    const criteria: MatchScoreCriterion[] = drafts.map((draft, index) => {
        const score = mockCriterionScore(applicationId, index);
        let found = draft.found;

        if (draft.id === "experience") {
            found = foundCopy(
                score,
                `Currículo indica trajetória compatível (${experienceLabel}).`,
                `Há indícios parciais de alinhamento (${experienceLabel}), com lacunas em algumas atribuições.`,
                `Pouca evidência de experiência alinhada às atribuições da vaga.`,
            );
        } else if (draft.id === "seniority") {
            found = foundCopy(
                score,
                `Perfil aparenta senioridade compatível com ${seniorityRequired}.`,
                `Senioridade intermediária — pode atender com acompanhamento.`,
                `Senioridade abaixo do esperado para ${seniorityRequired}.`,
            );
        } else if (draft.id === "modality") {
            found = foundCopy(
                score,
                locationLabel
                    ? `Candidato em ${locationLabel}; compatível com ${modalityRequired}.`
                    : `Disponibilidade aparente para ${modalityRequired}.`,
                locationLabel
                    ? `Localização (${locationLabel}) com possível ajuste para ${modalityRequired}.`
                    : `Modalidade ${modalityRequired} não está clara no perfil.`,
                `Possível incompatibilidade com ${modalityRequired}${vacancy.location ? ` / ${vacancy.location}` : ""}.`,
            );
        } else if (draft.id === "contract") {
            found = foundCopy(
                score,
                `Perfil compatível com contratação ${contractRequired}.`,
                `Contrato ${contractRequired} parece viável, sujeito a confirmação.`,
                `Não há indicação clara de aderência a ${contractRequired}.`,
            );
        } else {
            found = foundCopy(
                score,
                `Evidência encontrada no currículo/candidatura para: “${draft.required}”.`,
                `Atendimento parcial ao requisito: “${draft.required}”.`,
                `Não identificado no currículo: “${draft.required}”.`,
            );
        }

        return { ...draft, score, found };
    });

    const totalScore = totalScoreFromCriterionScores(criteria.map((item) => item.score));
    const sumPoints = criteria.reduce((acc, item) => acc + item.score, 0);
    const maxPoints = criteria.length * 100;

    const summary =
        totalScore >= 80
            ? `Candidatura com forte aderência à vaga (${totalScore}%). Somatório: ${sumPoints} de ${maxPoints} pontos.`
            : totalScore >= 55
              ? `Candidatura com aderência moderada (${totalScore}%). Somatório: ${sumPoints} de ${maxPoints} pontos.`
              : `Candidatura com baixa aderência aparente (${totalScore}%). Somatório: ${sumPoints} de ${maxPoints} pontos.`;

    return { totalScore, summary, criteria };
}
