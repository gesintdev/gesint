import type { CareersPageDraft, CareersPageRequest, CareersPageTheme } from "@/modules/careers/admin/dto/careers-page.dto";
import type { CareersBlock, CareersVacancySummary } from "@/modules/careers/shared/dto/careers.dto";

/** Bloco no editor: `key` estável para o drag-and-drop (blocos novos ainda não têm id). */
export type CareersEditorBlock = CareersBlock & { key: string };

export type CareersEditorState = {
    theme: CareersPageTheme;
    blocks: CareersEditorBlock[];
};

export function toEditorState(draft: CareersPageDraft): CareersEditorState {
    return {
        theme: { ...draft.theme, socialLinks: { ...(draft.theme.socialLinks ?? {}) } },
        blocks: draft.blocks.map((block) => ({
            ...block,
            content: structuredClone(block.content ?? {}),
            key: block.id ?? crypto.randomUUID(),
        })),
    };
}

export function toRequest(state: CareersEditorState): CareersPageRequest {
    return {
        theme: state.theme,
        blocks: state.blocks.map((block) => ({
            id: block.id ?? null,
            type: block.type,
            title: block.title ?? "",
            subtitle: block.subtitle ?? "",
            content: block.content,
            visible: block.visible,
        })),
    };
}

/** Assinatura para saber se há alterações não salvas (ignora as keys locais). */
export function editorSignature(state: CareersEditorState | null): string {
    return state ? JSON.stringify(toRequest(state)) : "";
}

export const CAREERS_COLOR_PRESETS: { label: string; primary: string; accent: string }[] = [
    { label: "Gesint", primary: "", accent: "" },
    { label: "Oceano", primary: "#0F4C81", accent: "#F2A541" },
    { label: "Floresta", primary: "#1F6F50", accent: "#E9C46A" },
    { label: "Vinho", primary: "#7A1F3D", accent: "#F4A259" },
    { label: "Grafite", primary: "#1F2937", accent: "#22C55E" },
    { label: "Coral", primary: "#E4572E", accent: "#29335C" },
];

/** Usadas no preview quando ainda não há vagas publicadas. */
export const CAREERS_SAMPLE_VACANCIES: CareersVacancySummary[] = [
    {
        slug: "exemplo-analista",
        jobTitle: "Analista de Atendimento",
        department: "Operações",
        location: "São Paulo",
        workModality: "HIBRIDO",
        contractType: "CLT",
        seniorityLevel: "PLENO",
        publishedAt: new Date().toISOString(),
    },
    {
        slug: "exemplo-dev",
        jobTitle: "Pessoa Desenvolvedora Front-end",
        department: "Tecnologia",
        location: "Remoto",
        workModality: "REMOTO",
        contractType: "PJ",
        seniorityLevel: "SENIOR",
        publishedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    },
];
