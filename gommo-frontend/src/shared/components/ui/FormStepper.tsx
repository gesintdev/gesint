"use client";
import clsx from "clsx";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { EntityCodeField } from "@/shared/components/crud/EntityCodeField";

export type FormStepNavItem = {
    id: string;
    label: string;
};

type FormStepperProps = {
    steps: FormStepNavItem[];
    filledStepIds?: readonly string[];
    entityCode?: number | null;
    children: ReactNode;
};

export function FormStepper({ steps, filledStepIds = [], entityCode, children }: FormStepperProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const pinnedIdRef = useRef<string | null>(null);
    const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [activeId, setActiveId] = useState(steps[0]?.id ?? "");
    const filledSet = new Set(filledStepIds);

    useEffect(() => {
        setActiveId(steps[0]?.id ?? "");
        pinnedIdRef.current = null;
    }, [steps]);

    useEffect(() => {
        const root = scrollRef.current;
        if (!root || steps.length === 0) return;
        const sectionElements = steps
            .map((step) => root.querySelector<HTMLElement>(`#${CSS.escape(step.id)}`))
            .filter((el): el is HTMLElement => el != null);
        if (sectionElements.length === 0) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (pinnedIdRef.current) return;
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                const topId = visible[0]?.target.id;
                if (topId) setActiveId(topId);
            },
            { root, rootMargin: "-6% 0px -70% 0px", threshold: [0, 0.15, 0.4] },
        );
        sectionElements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [steps, children]);

    useEffect(() => {
        const root = scrollRef.current;
        if (!root) return;
        const onScroll = () => {
            if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
            scrollEndTimerRef.current = setTimeout(() => {
                pinnedIdRef.current = null;
            }, 450);
        };
        root.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            root.removeEventListener("scroll", onScroll);
            if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
        };
    }, []);

    const scrollToSection = useCallback((id: string) => {
        const root = scrollRef.current;
        if (!root) return;
        const section = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
        if (!section) return;
        pinnedIdRef.current = id;
        setActiveId(id);
        const top = section.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
        root.scrollTo({ top: Math.max(0, top - 8), behavior: "smooth" });
    }, []);
    const activeIndex = steps.findIndex((step) => step.id === activeId);

    return (
        <div className="form-stepper flex min-h-0 flex-1 flex-col">
            <div className="form-stepper__toolbar-shell shrink-0">
                <div
                    className={clsx(
                        "gommo-form-section form-stepper__toolbar",
                        entityCode == null && "form-stepper__toolbar--no-code",
                    )}
                >
                    {entityCode != null ? (
                        <div className="form-stepper__code">
                            <EntityCodeField code={entityCode} codeOnly />
                        </div>
                    ) : null}
                    <nav className="gommo-form-stepper" aria-label="Seções do formulário">
                        <ol className={"gommo-form-stepper__list gommo-form-stepper__list--spread"}>
                            {steps.map((step, index) => {
                                const isActive = step.id === activeId;
                                const isDone = activeIndex >= 0 && index < activeIndex;
                                const isFilled = filledSet.has(step.id);
                                return (
                                    <li
                                        key={step.id}
                                        className={clsx(
                                            "gommo-form-stepper__item",
                                            index < steps.length - 1 && "gommo-form-stepper__item--has-line",
                                        )}
                                    >
                                        {index < steps.length - 1 ? (
                                            <span
                                                className={clsx(
                                                    "gommo-form-stepper__line",
                                                    (isDone || isActive || isFilled) &&
                                                        "gommo-form-stepper__line--active",
                                                    isFilled &&
                                                        !isActive &&
                                                        !isDone &&
                                                        "gommo-form-stepper__line--filled",
                                                )}
                                                aria-hidden
                                            />
                                        ) : null}
                                        <button
                                            type="button"
                                            className={clsx(
                                                "gommo-form-stepper__step",
                                                isActive && "gommo-form-stepper__step--active",
                                                isDone && "gommo-form-stepper__step--done",
                                                isFilled && !isActive && "gommo-form-stepper__step--filled",
                                            )}
                                            aria-current={isActive ? "step" : undefined}
                                            onClick={() => scrollToSection(step.id)}
                                        >
                                            <span className="gommo-form-stepper__badge">{index + 1}</span>
                                            <span className="gommo-form-stepper__label">{step.label}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ol>
                    </nav>
                </div>
            </div>
            <div ref={scrollRef} className="form-stepper__scroll min-h-0 flex-1 overflow-y-auto">
                <div className="form-stepper__sections flex flex-col gap-4 p-4">{children}</div>
            </div>
        </div>
    );
}
