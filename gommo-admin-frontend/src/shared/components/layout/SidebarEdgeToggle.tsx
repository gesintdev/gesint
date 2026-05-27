"use client";

import clsx from "clsx";
import {ChevronLeft} from "lucide-react";

type SidebarEdgeToggleProps = {
    collapsed: boolean;
    onToggle: () => void;
};

/** Botão fixo na borda direita do sidebar (nível da trilha de abas). */
export function SidebarEdgeToggle({collapsed, onToggle}: SidebarEdgeToggleProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            className="sidebar-edge-toggle hidden lg:flex"
        >
            <ChevronLeft
                className={clsx(
                    "size-3 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    collapsed && "rotate-180",
                )}
                strokeWidth={2.25}
            />
        </button>
    );
}
