"use client";

import { useEffect, useRef, useState } from "react";

import { Building2, Check, ChevronDown } from "lucide-react";

import { useActiveBranch } from "@/shared/context/ActiveBranchContext";

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
        <div ref={containerRef} className="relative shrink-0">
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label="Filial ativa"
                onClick={() => setOpen((value) => !value)}
                className="gommo-btn gommo-btn--ghost flex w-72 max-w-full items-center gap-1.5 text-base-content/70"
            >
                <Building2 className="size-4 shrink-0" strokeWidth={2} />
                <span className="flex-1 truncate text-start text-[13px]">{activeBranch.name}</span>
                <ChevronDown className="size-3.5 shrink-0 opacity-60" strokeWidth={2} />
            </button>

            {open ? (
                <div
                    role="listbox"
                    className="absolute start-0 top-[calc(100%+0.375rem)] z-40 max-h-80 w-full min-w-72 overflow-y-auto rounded-box border border-base-content/10 bg-base-100 py-1 shadow-lg"
                >
                    {branches.map((branch) => {
                        const selected = branch.id === activeBranch.id;
                        return (
                            <button
                                key={branch.id}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                onClick={() => {
                                    selectBranch(branch.id);
                                    setOpen(false);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-start hover:bg-base-content/5"
                            >
                                <Check
                                    className={`size-4 shrink-0 ${selected ? "opacity-100" : "opacity-0"}`}
                                    strokeWidth={2}
                                />
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[13px]">{branch.name}</span>
                                    {branch.cnpj ? (
                                        <span className="block truncate text-[11px] text-base-content/50">
                                            {branch.cnpj}
                                        </span>
                                    ) : null}
                                </span>
                                {branch.headquarters ? (
                                    <span className="shrink-0 rounded-badge bg-base-content/10 px-1.5 py-0.5 text-[10px] uppercase text-base-content/60">
                                        Matriz
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
