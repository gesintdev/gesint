/** Minutos inteiros -> "08h23" (sem sinal). */
export function formatDuration(minutes: number | null | undefined): string {
    const value = Math.abs(Math.round(Number(minutes) || 0));
    const hours = Math.floor(value / 60);
    const rest = value % 60;
    return `${String(hours).padStart(2, "0")}h${String(rest).padStart(2, "0")}`;
}

/** Saldo em minutos -> "+08h23" / "-08h23" / "00h00". */
export function formatBalance(minutes: number | null | undefined): string {
    const value = Math.round(Number(minutes) || 0);
    if (value === 0) return "00h00";
    return `${value > 0 ? "+" : "-"}${formatDuration(value)}`;
}

/** Tom do saldo para a classe `.gesint-balance--*`. */
export function balanceTone(minutes: number | null | undefined): "positive" | "negative" | "zero" {
    const value = Math.round(Number(minutes) || 0);
    if (value > 0) return "positive";
    if (value < 0) return "negative";
    return "zero";
}
