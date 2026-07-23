import { candidateService } from "@/modules/rh/person/candidate/services/candidate.service";
import type { AdmissionProcess } from "@/modules/rh/person/collaborators/admission/dto/admission-process.dto";
import {
    admissionFormToPayload,
    emptyAdmissionProcessForm,
} from "@/modules/rh/person/collaborators/admission/lib/admission-process.mapper";
import { admissionprocessService } from "@/modules/rh/person/collaborators/admission/services/admission-process.service";
import { jobVacancyService } from "@/modules/rh/person/jobvacancy/services/jobvacancy.service";

/** Chave padrao da coluna de contratacao (V66). Hardcoded ate haver gatilho configuravel. */
export const HIRING_KANBAN_COLUMN_KEY = "hiring";

export type CreateAdmissionFromKanbanCardInput = {
    candidateId: string;
    jobVacancyId?: string | null;
};

/**
 * Cria uma admissao com os dados basicos do candidato.
 * Campos obrigatorios ausentes no candidato (ex.: birthDate) bloqueiam a criacao.
 */
export async function createAdmissionFromKanbanCard(
    input: CreateAdmissionFromKanbanCardInput,
): Promise<AdmissionProcess> {
    const candidate = await candidateService.getById(input.candidateId);
    const fullName = candidate.fullName?.trim();
    const cpf = candidate.cpf?.replace(/\D/g, "");
    const birthDate = candidate.birthDate?.slice(0, 10);

    if (!fullName || !cpf || !birthDate) {
        throw new Error(
            "Candidato sem dados obrigatórios para admissão (nome, CPF e data de nascimento).",
        );
    }

    let jobPositionId = "";
    if (input.jobVacancyId?.trim()) {
        try {
            const vacancy = await jobVacancyService.getById(input.jobVacancyId.trim());
            jobPositionId = vacancy.jobPositionId?.trim() || "";
        } catch {
            // Cargo da vaga e enriquecimento opcional.
        }
    }

    const today = new Date().toISOString().slice(0, 10);
    const payload = admissionFormToPayload({
        ...emptyAdmissionProcessForm(),
        fullName,
        cpf,
        email: candidate.email?.trim() || undefined,
        phone: candidate.phone?.trim() || undefined,
        birthDate,
        expectedStartDate: today,
        startedAt: today,
        contractType: "CLT",
        jobPositionId,
        notes: "Criado a partir do kanban de contratação da vaga.",
    });

    return admissionprocessService.create(payload);
}
