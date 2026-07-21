export type AttendanceCollaboratorFocus = {
    collaboratorId: string;
    collaboratorName?: string;
};

export const ATTENDANCE_COLLABORATOR_FOCUS_KEY = "gommo-attendance-collaborator-focus";
export const ATTENDANCE_COLLABORATOR_FOCUS_EVENT = "gommo:attendance-collaborator-focus";

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

export function clearAttendanceCollaboratorFocus() {
    window.sessionStorage.removeItem(ATTENDANCE_COLLABORATOR_FOCUS_KEY);
}
