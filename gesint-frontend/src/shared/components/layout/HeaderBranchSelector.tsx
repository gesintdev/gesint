"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { Building2, Check, ChevronDown } from "lucide-react";

import { useActiveBranch } from "@/shared/context/ActiveBranchContext";
import type { Branch } from "@/shared/lib/branch";
import { formatCnpj } from "@/shared/lib/table/format-cell-value";

function formatBranchCnpj(cnpj?: string | null): string | null {
    if (!cnpj?.trim()) {
        return null;
    }
    const digits = cnpj.replace(/\D/g, "");
    if (digits.length === 14) {
        return formatCnpj(digits);
    }
    return cnpj.trim();
}

function BranchIcon({ className }: { className?: string }) {
    return (
        <Building2
            className={clsx("size-4 shrink-0 text-primary", className)}
            strokeWidth={2}
        />
    );
}

function BranchOptionText({ branch }: { branch: Branch }) {
    const cnpj = formatBranchCnpj(branch.cnpj);

    return (
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="block truncate text-[13px] font-medium leading-none text-base-content">
                {branch.name}
            </span>
            {cnpj ? (
                <span className="block truncate text-[11px] leading-none text-base-content/50">
                    CNPJ {cnpj}
                </span>
            ) : null}
        </span>
    );
}

/**
 * Seletor de filial do header.
 *
 * Fica oculto quando o cliente tem uma unica filial: nesse caso nao ha escolha a fazer e o
 * controle so ocuparia espaco.
 */
export function HeaderBranchSelector() {
    const { branches, activeBranch, selectBranch } = useActiveBranch();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) {
            return;
        }
        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    if (branches.length <= 1 || !activeBranch) {
        return null;
    }

    return (
        <>
            <div ref={containerRef} className="relative w-max max-w-36 shrink-0 sm:max-w-48 lg:max-w-72">
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label="Filial ativa"
                onClick={() => setOpen((value) => !value)}
                className={clsx(
                    "flex h-(--gesint-control-h) min-h-(--gesint-control-h) w-full max-w-36 items-center gap-1.5 rounded-[var(--gesint-control-radius)] border-0 bg-transparent px-2 text-start transition-colors sm:max-w-48 sm:gap-2 sm:px-3 lg:max-w-72",
                    "hover:bg-base-content/7",
                    open && "bg-base-content/7",
                )}
            >
                <BranchIcon />
                <span className="min-w-0 truncate text-[13px] font-medium leading-none text-base-content">
                    {activeBranch.name}
                </span>
                <ChevronDown
                    className={clsx(
                        "size-3.5 shrink-0 text-base-content/45 transition-transform",
                        open && "rotate-180",
                    )}
                    strokeWidth={2}
                />
            </button>

            <AnimatePresence>
                {open ? (
                    <motion.div
                        role="listbox"
                        aria-label="Filiais"
                        initial={{ opacity: 0, y: -5, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="surface-popover absolute start-0 z-50 mt-2 flex max-h-80 w-max min-w-full max-w-[min(18rem,calc(100vw-1.25rem))] origin-top-left flex-col overflow-hidden p-1.5"
                    >
                        <div className="min-h-0 overflow-auto py-1">
                            {branches.map((branch) => {
                                const selected = branch.id === activeBranch.id;
                                return (
                                    <button
                                        key={branch.id}
                                        type="button"
                                        role="option"
                                        aria-selected={selected}
                                        onClick={() => {
                                            void selectBranch(branch.id).then((confirmed) => {
                                                if (confirmed) setOpen(false);
                                            });
                                        }}
                                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-start transition-colors hover:bg-base-200/60"
                                    >
                                        <BranchIcon />
                                        <BranchOptionText branch={branch} />
                                        <Check
                                            className={clsx(
                                                "size-3.5 shrink-0 text-primary",
                                                selected ? "opacity-100" : "opacity-0",
                                            )}
                                            strokeWidth={2}
                                        />
                                        {branch.headquarters ? (
                                            <span className="shrink-0 rounded-badge bg-base-content/10 px-1.5 py-0.5 text-[10px] uppercase text-base-content/60">
                                                Matriz
                                            </span>
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
            </div>
            <div className="mx-0.5 hidden h-4 w-px shrink-0 bg-base-content/10 sm:block" aria-hidden />
        </>
    );
}
