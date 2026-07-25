import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

import type { AppRoute } from "@/config/routes";
import { useWorkspaceNavigation } from "@/shared/workspace/useWorkspaceNavigation";

type SidebarFlyoutProps = {
    route: AppRoute;
    anchorTop: number;
    highlightRouteId: string | null;
    onSelectRoute: (route: AppRoute) => void;
    onClose: () => void;
    onMouseEnterFlyout?: () => void;
};

export function SidebarFlyout({
    route,
    anchorTop,
    highlightRouteId,
    onSelectRoute,
    onClose,
    onMouseEnterFlyout,
}: SidebarFlyoutProps) {
    const { openRouteModule } = useWorkspaceNavigation();

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="sidebar-flyout fixed z-50 ml-[calc(var(--system-rail-width)+var(--sidebar-collapsed)+0.125rem)] min-w-44 p-2"
                style={{ top: anchorTop }}
                onMouseEnter={onMouseEnterFlyout}
                onMouseLeave={onClose}
            >
                <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-base-content/40">
                    {route.label}
                </p>
                <ul className="flex flex-col gap-0.5">
                    {route.children?.map((child) => {
                        const ChildIcon = child.icon;
                        const active = child.id === highlightRouteId;
                        return (
                            <li key={child.id}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (child.href) {
                                            onSelectRoute(child);
                                            openRouteModule(child);
                                        }
                                        onClose();
                                    }}
                                    className={clsx("nav-item w-full", active && "nav-item-active")}
                                >
                                    <ChildIcon
                                        className={clsx(
                                            "size-4.25 shrink-0",
                                            active ? "text-primary" : "text-base-content/38",
                                        )}
                                        strokeWidth={active ? 2.25 : 2}
                                    />
                                    <span className="truncate">{child.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </motion.div>
        </AnimatePresence>
    );
}
