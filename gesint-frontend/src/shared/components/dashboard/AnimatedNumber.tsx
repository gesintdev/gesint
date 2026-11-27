"use client";

import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { DASHBOARD_EASE_OUT, formatDashboardNumber } from "@/shared/components/dashboard/dashboard-motion";

/** Contagem animada de KPI (respeita prefers-reduced-motion). */
export function AnimatedNumber({
    value,
    format = formatDashboardNumber,
}: {
    value: number;
    format?: (_value: number) => string;
}) {
    const reduceMotion = useReducedMotion();
    const [display, setDisplay] = useState(0);
    const current = useRef(0);

    useEffect(() => {
        if (reduceMotion) return;
        const controls = animate(current.current, value, {
            duration: 1,
            ease: DASHBOARD_EASE_OUT,
            onUpdate: (latest) => {
                current.current = latest;
                setDisplay(latest);
            },
        });
        return () => controls.stop();
    }, [value, reduceMotion]);

    const shown = reduceMotion ? value : display;
    return <>{format(Number.isInteger(value) ? Math.round(shown) : shown)}</>;
}
