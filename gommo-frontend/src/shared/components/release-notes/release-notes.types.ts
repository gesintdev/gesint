export type ReleaseNote = {
    version: string;
    hash: string;
    date: string;
    type: string | null;
    scope: string | null;
    breaking: boolean;
    title: string;
    body: string;
    pullRequest: number | null;
};

type ReleaseTypeMeta = {
    label: string;
    badgeClass: string;
};

const RELEASE_TYPE_META: Record<string, ReleaseTypeMeta> = {
    feat: { label: "Novidade", badgeClass: "gommo-badge--success" },
    fix: { label: "Correção", badgeClass: "gommo-badge--info" },
    perf: { label: "Desempenho", badgeClass: "gommo-badge--neutral" },
    refactor: { label: "Melhoria", badgeClass: "gommo-badge--neutral" },
    docs: { label: "Documentação", badgeClass: "gommo-badge--neutral" },
    merge: { label: "Entrega", badgeClass: "gommo-badge--neutral" },
};

const DEFAULT_TYPE_META: ReleaseTypeMeta = { label: "Ajuste", badgeClass: "gommo-badge--neutral" };
const BREAKING_TYPE_META: ReleaseTypeMeta = { label: "Mudança importante", badgeClass: "gommo-badge--warning" };

export function releaseTypeMeta(note: Pick<ReleaseNote, "type" | "breaking">): ReleaseTypeMeta {
    if (note.breaking) return BREAKING_TYPE_META;
    return (note.type && RELEASE_TYPE_META[note.type]) || DEFAULT_TYPE_META;
}
