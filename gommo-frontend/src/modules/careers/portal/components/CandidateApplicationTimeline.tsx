"use client";

import clsx from "clsx";

import type { CandidatePortalTimelineStep } from "@/modules/careers/portal/dto/candidate-portal.dto";

export function CandidateApplicationTimeline({
    steps,
    className,
}: {
    steps: CandidatePortalTimelineStep[];
    className?: string;
}) {
    return (
        <div className={clsx("flex flex-wrap gap-1.5", className)}>
            {steps.map((step) => (
                <div
                    key={step.key}
                    className={clsx(
                        "rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide",
                        step.state === "done" && "bg-success/15 text-success",
                        step.state === "current" && "bg-primary text-primary-content",
                        step.state === "pending" && "bg-base-200 text-base-content/45",
                    )}
                >
                    {step.label}
                </div>
            ))}
        </div>
    );
}
