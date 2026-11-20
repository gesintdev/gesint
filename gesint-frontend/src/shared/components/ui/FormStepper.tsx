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
    /** Quando omitido, o stepper marca a seção que já tem algum dado preenchido. */
    filledStepIds?: readonly string[];
    entityCode?: number | null;
    /** Codigo de ponto do colaborador, ao lado do codigo do cadastro. */
    accessCode?: string | null;
    /** Acao exibida no lugar do codigo de ponto, quando ele ainda nao existe. */
    accessCodeAction?: ReactNode;
    children: ReactNode;
};

function sameIds(left: readonly string[], right: readonly string[]): boolean {
    return left.length === right.length && left.every((id, index) => id === right[index]);
}

function sectionIsFilled(section: HTMLElement): boolean {
    if (section.querySelector("[data-step-filled='true'], [data-has-value='true']")) return true;
    if (section.querySelector("input[type='checkbox']:checked, input[type='radio']:checked")) return true;
    const editable = section.querySelector<HTMLElement>("[contenteditable='true']");
    if (editable?.textContent?.trim()) return true;

    const fields = section.querySelectorAll<HTMLElement>(".gesint-field");
    for (const field of fields) {
        if (field.classList.contains("gesint-field--restricted")) continue;
        if (field.classList.contains("gesint-select-trigger--placeholder")) continue;
        const input = field.querySelector("input, textarea");
        if (input instanceof HTMLInputElement) {
            const type = input.type;
            if (type === "hidden" || type === "file" || type === "button" || type === "submit" || type === "checkbox" || type === "radio") {
                continue;
            }
            if (input.value.trim()) return true;
            continue;
        }
        if (input instanceof HTMLTextAreaElement && input.value.trim()) return true;
        const text = field.textContent?.replace(/\s+/g, " ").trim() ?? "";
        if (text) return true;
    }
    return false;
}

export function FormStepper({
    steps,
    filledStepIds,
    entityCode,
    accessCode,
    accessCodeAction,
    children,
}: FormStepperProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const pinnedIdRef = useRef<string | null>(null);
    const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [activeId, setActiveId] = useState(steps[0]?.id ?? "");
    const [autoFilledIds, setAutoFilledIds] = useState<string[]>([]);
    const filledSet = new Set(filledStepIds ?? autoFilledIds);

    useEffect(() => {
        setActiveId(steps[0]?.id ?? "");
        pinnedIdRef.current = null;
    }, [steps]);

    useEffect(() => {
        if (filledStepIds) return;
        const root = scrollRef.current;
        if (!root) return;
        let frame = 0;
        const compute = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const next = steps
                    .filter((step) => {
                        const section = root.querySelector<HTMLElement>(`#${CSS.escape(step.id)}`);
                        return section ? sectionIsFilled(section) : false;
                    })
                    .map((step) => step.id);
                setAutoFilledIds((current) => (sameIds(current, next) ? current : next));
            });
        };
        compute();
        root.addEventListener("input", compute);
        root.addEventListener("change", compute);
        const observer = new MutationObserver(compute);
        observer.observe(root, {
            subtree: true,
            childList: true,
            characterData: true,
            attributes: true,
            attributeFilter: ["class", "value", "data-has-value", "data-step-filled"],
        });
        return () => {
            cancelAnimationFrame(frame);
            root.removeEventListener("input", compute);
            root.removeEventListener("change", compute);
            observer.disconnect();
        };
    }, [children, filledStepIds, steps]);

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
                        "gesint-form-section form-stepper__toolbar",
                        entityCode == null && !accessCode && !accessCodeAction && "form-stepper__toolbar--no-code",
                    )}
                >
                    {entityCode != null || accessCode || accessCodeAction ? (
                        <div className="form-stepper__code">
                            {entityCode != null ? <EntityCodeField code={entityCode} codeOnly /> : null}
                            {accessCode ? (
                                <span className="form-stepper__access-code" title="Código do colaborador">
                                    <span className="form-stepper__access-code-label">Cod. Colab.</span>
                                    <span className="form-stepper__access-code-value tabular-nums">{accessCode}</span>
                                </span>
                            ) : (
                                accessCodeAction
                            )}
                        </div>
                    ) : null}
                    <nav className="gesint-form-stepper" aria-label="Seções do formulário">
                        <ol className={"gesint-form-stepper__list gesint-form-stepper__list--spread"}>
                            {steps.map((step, index) => {
                                const isActive = step.id === activeId;
                                const isDone = activeIndex >= 0 && index < activeIndex;
                                const isFilled = filledSet.has(step.id);
                                return (
                                    <li
                                        key={step.id}
                                        className={clsx(
                                            "gesint-form-stepper__item",
                                            index < steps.length - 1 && "gesint-form-stepper__item--has-line",
                                        )}
                                    >
                                        {index < steps.length - 1 ? (
                                            <span
                                                className={clsx(
                                                    "gesint-form-stepper__line",
                                                    (isDone || isActive || isFilled) &&
                                                        "gesint-form-stepper__line--active",
                                                    isFilled &&
                                                        !isActive &&
                                                        !isDone &&
                                                        "gesint-form-stepper__line--filled",
                                                )}
                                                aria-hidden
                                            />
                                        ) : null}
                                        <button
                                            type="button"
                                            className={clsx(
                                                "gesint-form-stepper__step",
                                                isActive && "gesint-form-stepper__step--active",
                                                isDone && "gesint-form-stepper__step--done",
                                                isFilled && !isActive && "gesint-form-stepper__step--filled",
                                            )}
                                            aria-current={isActive ? "step" : undefined}
                                            onClick={() => scrollToSection(step.id)}
                                        >
                                            <span className="gesint-form-stepper__badge">{index + 1}</span>
                                            <span className="gesint-form-stepper__label">{step.label}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ol>
                    </nav>
                </div>
            </div>
            <div ref={scrollRef} className="form-stepper__scroll min-h-0 flex-1 overflow-y-auto">
                <div className="form-stepper__sections flex flex-col gap-2 p-2">{children}</div>
            </div>
        </div>
    );
}
