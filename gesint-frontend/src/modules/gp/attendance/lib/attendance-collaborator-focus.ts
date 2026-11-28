export type AttendanceCollaboratorFocus = {
    collaboratorId: string;
    collaboratorName?: string;
};

export const ATTENDANCE_COLLABORATOR_FOCUS_KEY = "gesint-attendance-collaborator-focus";
export const ATTENDANCE_COLLABORATOR_FOCUS_EVENT = "gesint:attendance-collaborator-focus";

export function writeAttendanceCollaboratorFocus(focus: AttendanceCollaboratorFocus) {
    window.sessionStorage.setItem(ATTENDANCE_COLLABORATOR_FOCUS_KEY, JSON.stringify(focus));
    window.dispatchEvent(new CustomEvent(ATTENDANCE_COLLABORATOR_FOCUS_EVENT, {detail: focus}));
}

export function peekAttendanceCollaboratorFocus(): AttendanceCollaboratorFocus | null {
    try {
        const raw = window.sessionStorage.getItem(ATTENDANCE_COLLABORATOR_FOCUS_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as AttendanceCollaboratorFocus;
        if (!parsed?.collaboratorId) return null;
        return parsed;
    } catch {
        return null;
    }
}

const ATTENDANCE_OPEN_HISTORY_KEY = "gesint-attendance-open-history";
export const ATTENDANCE_OPEN_HISTORY_EVENT = "gesint:attendance-open-history";

/**
 * Pede à aba Controle de ponto que abra o Histórico de ponto (aba de cadastro).
 * Navegar com `?new` só troca a URL e não muda a aba interna do CrudScreen; a listagem
 * consome este pedido (na montagem ou pelo evento) e chama `startCreate`.
 */
export type AttendanceHistoryOpenRequest = {
    /** Período em que o histórico abre; sem ele, vale o da listagem. */
    period?: {from: string; to: string};
};

export function requestAttendanceHistoryOpen(request: AttendanceHistoryOpenRequest = {}) {
    window.sessionStorage.setItem(ATTENDANCE_OPEN_HISTORY_KEY, JSON.stringify(request));
    window.dispatchEvent(new Event(ATTENDANCE_OPEN_HISTORY_EVENT));
}

/** Lê e apaga o pedido: só uma abertura por pedido. */
export function consumeAttendanceHistoryOpen(): AttendanceHistoryOpenRequest | null {
    const raw = window.sessionStorage.getItem(ATTENDANCE_OPEN_HISTORY_KEY);
    if (raw == null) return null;
    window.sessionStorage.removeItem(ATTENDANCE_OPEN_HISTORY_KEY);
    try {
        return (JSON.parse(raw) as AttendanceHistoryOpenRequest) ?? {};
    } catch {
        return {};
    }
}

export function clearAttendanceCollaboratorFocus() {
    window.sessionStorage.removeItem(ATTENDANCE_COLLABORATOR_FOCUS_KEY);
    window.dispatchEvent(new CustomEvent(ATTENDANCE_COLLABORATOR_FOCUS_EVENT, {detail: null}));
}
