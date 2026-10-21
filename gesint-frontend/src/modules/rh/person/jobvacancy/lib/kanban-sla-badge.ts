/** Conta dias úteis exclusivos entre duas datas (exclui início; inclui fim), estilo calendário BR simples (sáb/dom). */
export function businessDaysBetweenExclusive(fromIso: string | Date, to: Date = new Date()): number {
    const start = new Date(fromIso);
    if (Number.isNaN(start.getTime())) return 0;
    start.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(0, 0, 0, 0);
    if (end <= start) return 0;
    let count = 0;
    const cursor = new Date(start);
    while (cursor < end) {
        cursor.setDate(cursor.getDate() + 1);
        const day = cursor.getDay();
        if (day !== 0 && day !== 6) count += 1;
    }
    return count;
}

export type KanbanSlaBadgeInfo = {
    remainingBusinessDays: number;
    label: string;
    tone: "warn" | "err" | "info";
};

/**
 * Badge de prazo de retorno (RN-34/35) quando a coluna tem SLA ativo.
 * Retorna null se não houver urgência (mais de 1 dia útil restante) ou dados incompletos.
 */
export function resolveKanbanSlaBadge(input: {
    enteredAt?: string | null;
    slaEnabled?: boolean | null;
    slaBusinessDays?: number | null;
    systemColumn?: boolean | null;
}): KanbanSlaBadgeInfo | null {
    if (input.systemColumn) return null;
    if (!input.slaEnabled) return null;
    if (!input.enteredAt) return null;
    const slaDays = input.slaBusinessDays != null && input.slaBusinessDays > 0 ? input.slaBusinessDays : 5;
    const daysInStage = businessDaysBetweenExclusive(input.enteredAt);
    const remaining = slaDays - daysInStage;
    if (remaining > 1) return null;
    if (remaining === 1) {
        return { remainingBusinessDays: 1, label: "Retorno vence amanhã", tone: "warn" };
    }
    if (remaining === 0) {
        return { remainingBusinessDays: 0, label: "Retorno vence hoje", tone: "err" };
    }
    return {
        remainingBusinessDays: remaining,
        label: `Retorno atrasado (${Math.abs(remaining)} dia${Math.abs(remaining) === 1 ? "" : "s"} úteis)`,
        tone: "err",
    };
}
