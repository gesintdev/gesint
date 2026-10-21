export const agendaKeys = {
    all: ["agenda-events"] as const,
    range: (from: string, to: string) => [...agendaKeys.all, "range", from, to] as const,
};
