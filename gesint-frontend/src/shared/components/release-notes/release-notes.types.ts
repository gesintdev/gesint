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
    feat: { label: "Novidade", badgeClass: "gesint-badge--success" },
    fix: { label: "Correção", badgeClass: "gesint-badge--info" },
    perf: { label: "Desempenho", badgeClass: "gesint-badge--neutral" },
    refactor: { label: "Melhoria", badgeClass: "gesint-badge--neutral" },
    docs: { label: "Documentação", badgeClass: "gesint-badge--neutral" },
    merge: { label: "Entrega", badgeClass: "gesint-badge--neutral" },
};

const DEFAULT_TYPE_META: ReleaseTypeMeta = { label: "Ajuste", badgeClass: "gesint-badge--neutral" };
const BREAKING_TYPE_META: ReleaseTypeMeta = { label: "Mudança importante", badgeClass: "gesint-badge--warning" };

export function releaseTypeMeta(note: Pick<ReleaseNote, "type" | "breaking">): ReleaseTypeMeta {
    if (note.breaking) return BREAKING_TYPE_META;
    return (note.type && RELEASE_TYPE_META[note.type]) || DEFAULT_TYPE_META;
}
