"use client";

import clsx from "clsx";
import { useActiveSystem } from "@/shared/context/ActiveSystemContext";
import type { SystemEnum } from "@/modules/root/enum/SystemEnum";

/** Coluna esquerda do sidebar — domínios (DP / RH). Largura fixa; não retrai. */
export function SystemRail() {
    const { activeSystem, systems, selectSystem } = useActiveSystem();

    const handleSelect = (system: SystemEnum) => {
        if (system === activeSystem) return;
        selectSystem(system);
    };

    return (
        <nav
            className="system-rail flex h-full w-(--system-rail-width) shrink-0 flex-col border-r"
            style={{
                background: "var(--system-rail-bg)",
                borderColor: "var(--system-rail-border)",
            }}
            aria-label="Domínios do sistema"
        >
            <div className="flex min-h-0 flex-1 flex-col items-center gap-1.5 overflow-y-auto px-1 py-3">
                {systems.map((system) => {
                    const Icon = system.icon;
                    const selected = system.id === activeSystem;

                    return (
                        <button
                            key={system.id}
                            type="button"
                            title={system.name}
                            aria-label={system.name}
                            aria-current={selected ? "true" : undefined}
                            onClick={() => handleSelect(system.id)}
                            className={clsx(
                                "system-rail-item",
                                selected && "system-rail-item--active",
                            )}
                        >
                            <Icon className="size-4 shrink-0" strokeWidth={selected ? 2.25 : 2} />
                            <span className="system-rail-acronym">{system.acronym}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
