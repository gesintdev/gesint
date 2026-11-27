import type { TimeStatusMetric } from "@/modules/gp/shared/dto/time-management.dto";

/** Handoff painel → relatório de status: abre o relatório já na métrica e no período clicados. */
export type TimeStatusFocus = {
    metric: TimeStatusMetric;
    from?: string;
    to?: string;
};

const KEY = "gesint-time-status-focus";
export const TIME_STATUS_FOCUS_EVENT = "gesint:time-status-focus";

export function writeTimeStatusFocus(focus: TimeStatusFocus) {
    try {
        window.sessionStorage.setItem(KEY, JSON.stringify(focus));
    } catch {
        // sessionStorage indisponível: o evento abaixo ainda atualiza a aba aberta.
    }
    window.dispatchEvent(new CustomEvent(TIME_STATUS_FOCUS_EVENT, { detail: focus }));
}

/** Lê e consome o foco pendente. */
export function takeTimeStatusFocus(): TimeStatusFocus | null {
    try {
        const raw = window.sessionStorage.getItem(KEY);
        if (!raw) return null;
        window.sessionStorage.removeItem(KEY);
        const parsed = JSON.parse(raw) as TimeStatusFocus;
        return parsed?.metric ? parsed : null;
    } catch {
        return null;
    }
}
