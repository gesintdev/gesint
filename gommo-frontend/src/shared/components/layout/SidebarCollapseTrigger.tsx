import clsx from "clsx";
import {ChevronLeft} from "lucide-react";

type SidebarCollapseTriggerProps = {
    collapsed: boolean;
    onToggle: () => void;
    className?: string;
};

/** Recolher/expandir — inline na toolbar, alinhado ao campo de busca. */
export function SidebarCollapseTrigger({collapsed, onToggle, className}: SidebarCollapseTriggerProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            aria-expanded={!collapsed}
            className={clsx(
                "sidebar-collapse-trigger sidebar-shell-control hidden shrink-0 lg:flex",
                className,
            )}
        >
            <ChevronLeft
                className={clsx(
                    "size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    collapsed && "rotate-180",
                )}
                strokeWidth={2.25}
            />
        </button>
    );
}
