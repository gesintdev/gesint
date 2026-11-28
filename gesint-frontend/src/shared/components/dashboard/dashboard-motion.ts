/** Curva padrão de entrada do design system (ease-out). */
export const DASHBOARD_EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const numberFormatter = new Intl.NumberFormat("pt-BR");

export function formatDashboardNumber(value: number): string {
    return numberFormatter.format(value);
}
