import {
    AlignLeft,
    BarChart3,
    Briefcase,
    Camera,
    CircleHelp,
    Gift,
    Heart,
    Image as ImageIcon,
    LayoutTemplate,
    type LucideIcon,
    Megaphone,
    PlayCircle,
    Users,
} from "lucide-react";

import type {
    CareersBlock,
    CareersBlockContent,
    CareersBlockType,
    CareersCustomBlockType,
} from "@/modules/careers/shared/dto/careers.dto";

type CareersBlockMeta = {
    label: string;
    description: string;
    icon: LucideIcon;
};

export const CAREERS_BLOCK_META: Record<CareersBlockType, CareersBlockMeta> = {
    HERO: { label: "Capa e proposta de valor", description: "Título, frase de impacto e imagem de capa.", icon: LayoutTemplate },
    WHY_WORK_HERE: { label: "Por que trabalhar aqui", description: "Diferenciais e cultura em tópicos.", icon: Heart },
    BENEFITS: { label: "Benefícios", description: "Lista de benefícios oferecidos.", icon: Gift },
    DAY_IN_LIFE: {
        label: "Um dia aqui",
        description: "Fotos e depoimentos do time (exige autorização de uso de imagem).",
        icon: Camera,
    },
    OPEN_VACANCIES: { label: "Vagas abertas", description: "Lista automática das vagas publicadas.", icon: Briefcase },
    TALENT_POOL: { label: "Banco de talentos", description: "Convite para quem não achou a vaga ideal.", icon: Users },
    TEXT: { label: "Texto livre", description: "Parágrafos em markdown.", icon: AlignLeft },
    IMAGE_TEXT: { label: "Imagem + texto", description: "Imagem ao lado de um texto.", icon: ImageIcon },
    STATS: { label: "Números", description: "Indicadores em destaque (ex.: 500 colaboradores).", icon: BarChart3 },
    FAQ: { label: "Perguntas frequentes", description: "Dúvidas comuns sobre o processo seletivo.", icon: CircleHelp },
    VIDEO: { label: "Vídeo", description: "Vídeo do YouTube ou Vimeo.", icon: PlayCircle },
    CTA: { label: "Chamada para ação", description: "Faixa com botão para um link.", icon: Megaphone },
};

export const CAREERS_MAX_BLOCKS = 30;

const CUSTOM_DEFAULTS: Record<CareersCustomBlockType, { title: string; content: CareersBlockContent }> = {
    TEXT: { title: "Nossa história", content: { body: "" } },
    IMAGE_TEXT: { title: "Como trabalhamos", content: { body: "", imageObjectId: "", imagePosition: "left" } },
    STATS: {
        title: "Em números",
        content: {
            items: [
                { value: "", label: "Colaboradores" },
                { value: "", label: "Anos de mercado" },
                { value: "", label: "Cidades" },
            ],
        },
    },
    FAQ: { title: "Perguntas frequentes", content: { items: [{ question: "Como funciona o processo seletivo?", answer: "" }] } },
    VIDEO: { title: "Conheça nosso time", content: { url: "" } },
    CTA: { title: "Pronto para o próximo passo?", content: { buttonLabel: "Ver vagas", buttonUrl: "#vagas" } },
};

export function createCustomBlock(type: CareersCustomBlockType): CareersBlock {
    const defaults = CUSTOM_DEFAULTS[type];
    return {
        id: null,
        type,
        title: defaults.title,
        subtitle: "",
        content: structuredClone(defaults.content),
        visible: true,
        systemBlock: false,
    };
}

export function readString(content: CareersBlockContent, key: string): string {
    const value = content[key];
    return typeof value === "string" ? value : "";
}

export function readBoolean(content: CareersBlockContent, key: string): boolean {
    return content[key] === true;
}

export function readList<T>(content: CareersBlockContent, key: string): T[] {
    const value = content[key];
    return Array.isArray(value) ? (value as T[]) : [];
}
