"use client";

import { mockMatchScore } from "@/modules/rh/person/jobvacancy/lib/mock-match-score-breakdown";

export { mockMatchScore };

function matchScoreTone(score: number): {
    background: string;
    border: string;
    color: string;
} {
    const clamped = Math.max(0, Math.min(100, score));
    // Verde (120°) → vermelho (0°) conforme a pontuação cai
    const hue = (clamped / 100) * 120;
    const solid = `hsl(${hue} 68% 38%)`;
    return {
        background: solid,
        border: `color-mix(in srgb, ${solid} 80%, black)`,
        color: "#fff",
    };
}

type CandidateMatchScoreTagProps = {
    score: number;
    onClick?: () => void;
};

export function CandidateMatchScoreTag({ score, onClick }: CandidateMatchScoreTagProps) {
    const tone = matchScoreTone(score);
    const baseClassName =
        "inline-flex shrink-0 items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[0.6875rem] font-bold tabular-nums leading-none shadow-sm";

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
            className={`${baseClassName} cursor-pointer transition-[filter,transform,box-shadow] duration-150 hover:scale-105 hover:brightness-125 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-100`}
            style={tone}
            title={`Ver detalhe da compatibilidade: ${score}%`}
            aria-label={`Ver detalhe da compatibilidade: ${score}%`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
                event.stopPropagation();
                onClick();
            }}
            onDoubleClick={(event) => event.stopPropagation()}
        >
            {content}
        </button>
    );
}
