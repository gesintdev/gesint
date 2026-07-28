"use client";

type CandidateMatchScoreTagProps = {
    score?: number | null;
    pending?: boolean;
    onClick?: () => void;
};

function matchScoreTone(score: number): {
    background: string;
    border: string;
    color: string;
} {
    const clamped = Math.max(0, Math.min(100, score));
    const hue = (clamped / 100) * 120;
    const solid = `hsl(${hue} 68% 38%)`;
    return {
        background: solid,
        border: `color-mix(in srgb, ${solid} 80%, black)`,
        color: "#fff",
    };
}

export function CandidateMatchScoreTag({ score, pending = false, onClick }: CandidateMatchScoreTagProps) {
    const baseClassName =
        "inline-flex shrink-0 items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[0.6875rem] font-bold tabular-nums leading-none shadow-sm";

    if (pending || score == null) {
        const pendingTone = {
            background: "color-mix(in srgb, var(--color-base-content) 12%, transparent)",
            border: "color-mix(in srgb, var(--color-base-content) 18%, transparent)",
            color: "color-mix(in srgb, var(--color-base-content) 55%, transparent)",
        };
        const label = pending ? "…" : "—";
        const title = pending ? "Análise em andamento" : "Sem score ainda";
        if (!onClick) {
            return (
                <span className={baseClassName} style={pendingTone} title={title}>
                    {label}
                </span>
            );
        }
        return (
            <button
                type="button"
                className={`${baseClassName} cursor-pointer transition hover:brightness-110`}
                style={pendingTone}
                title={title}
                onClick={(event) => {
                    event.stopPropagation();
                    onClick();
                }}
            >
                {label}
            </button>
        );
    }

    const tone = matchScoreTone(score);
    const content = (
        <>
            {score}
            <span className="text-[0.5625rem] font-semibold text-white/90">%</span>
        </>
    );

    if (!onClick) {
        return (
            <span
                className={baseClassName}
                style={tone}
                title={`Compatibilidade: ${score}% do total possível`}
            >
                {content}
            </span>
        );
    }

    return (
        <button
            type="button"
            className={`${baseClassName} cursor-pointer transition hover:brightness-110`}
            style={tone}
            title={`Compatibilidade: ${score}% — clique para detalhes`}
            onClick={(event) => {
                event.stopPropagation();
                onClick();
            }}
        >
            {content}
        </button>
    );
}
