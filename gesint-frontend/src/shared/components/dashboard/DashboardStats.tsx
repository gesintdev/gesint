import type { CSSProperties, ReactNode } from "react";

import { AnimatedNumber } from "@/shared/components/dashboard/AnimatedNumber";
import { formatDashboardNumber } from "@/shared/components/dashboard/dashboard-motion";

export type DashboardStat = {
    label: string;
    value: number;
    format?: (_value: number) => string;
    suffix?: ReactNode;
    /** Frase curta que explica o número (tooltip). */
    help?: string;
    onClick?: () => void;
};

/** Faixa de resumo (números lado a lado) usada dentro de painéis do dashboard. */
export function DashboardStats({ stats }: { stats: DashboardStat[] }) {
    return (
        <div className="gesint-dash-stats" style={{ "--stats-cols": stats.length } as CSSProperties}>
            {stats.map((stat) => {
                const body = (
                    <>
                        <p className="gesint-dash-stats__label">{stat.label}</p>
                        <p className="gesint-dash-stats__value">
                            <AnimatedNumber value={stat.value} format={stat.format ?? formatDashboardNumber} />
                            {stat.suffix ? <span className="gesint-dash-stats__suffix">{stat.suffix}</span> : null}
                        </p>
                    </>
                );
                return stat.onClick ? (
                    <button
                        key={stat.label}
                        type="button"
                        className="gesint-dash-stats__item gesint-dash-stats__item--button"
                        title={stat.help}
                        onClick={stat.onClick}
                    >
                        {body}
                    </button>
                ) : (
                    <div key={stat.label} className="gesint-dash-stats__item" title={stat.help}>
                        {body}
                    </div>
                );
            })}
        </div>
    );
}
