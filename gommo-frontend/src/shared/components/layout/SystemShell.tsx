"use client";
import { Bell, Command, Menu, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { GommoLogo } from "@/shared/components/layout/GommoLogo";
import { HeaderUserMenu } from "@/shared/components/layout/HeaderUserMenu";
import { Sidebar } from "@/shared/components/layout/Sidebar";
import { ThemeToggle } from "@/shared/components/layout/ThemeToggle";
import type { SystemEnum } from "@/modules/root/enum/SystemEnum";
import { ActiveSystemProvider } from "@/shared/context/ActiveSystemContext";
import { WorkspaceNavigationProvider } from "@/shared/workspace/WorkspaceNavigationProvider";
import { setAuthToken } from "@/shared/lib/api.client";

export function SystemShell({
    children,
    initialStoredSystem = null,
}: {
    children: ReactNode;
    initialStoredSystem?: SystemEnum | null;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileNav, setMobileNav] = useState(false);
    const { data: session } = useSession();
    const closeMobileNav = useCallback(() => setMobileNav(false), []);
    const toggleMobileNav = useCallback(() => setMobileNav((open) => !open), []);

    useEffect(() => {
        setAuthToken(session?.accessToken ?? null);
    }, [session?.accessToken]);

    useEffect(() => {
        const routesWidth = collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)";
        document.documentElement.style.setProperty("--sidebar-routes-current", routesWidth);
        document.documentElement.style.setProperty(
            "--layout-offset",
            `calc(var(--system-rail-width) + ${routesWidth})`,
        );
    }, [collapsed]);

    useEffect(() => {
        document.documentElement.classList.add("gommo-workspace-active");
        return () => document.documentElement.classList.remove("gommo-workspace-active");
    }, []);

    return (
        <ActiveSystemProvider initialStoredSystem={initialStoredSystem}>
            <div className="flex h-dvh flex-col overflow-hidden">
                {/* Linha superior: Gommo (largura do sidebar) + header principal */}
                <div
                    className="flex h-(--header-height) shrink-0 border-b"
                    style={{ borderColor: "var(--sidebar-border)" }}
                >
                    <div
                        className="hidden shrink-0 items-center border-r px-4 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex"
                        style={{
                            width: "var(--layout-offset)",
                            background: "var(--sidebar-bg)",
                            borderColor: "var(--sidebar-border)",
                        }}
                    >
                        <GommoLogo variant={collapsed ? "icon" : "full"} />
                    </div>
                    <header className="surface-header flex min-w-0 flex-1 items-center justify-between gap-3 px-4 sm:gap-5 sm:px-6 lg:px-8">
                        <button
                            type="button"
                            aria-label={mobileNav ? "Fechar menu" : "Abrir menu"}
                            aria-expanded={mobileNav}
                            onClick={toggleMobileNav}
                            className="gommo-btn gommo-btn--ghost gommo-btn--icon-only shrink-0 text-base-content/50 lg:hidden!"
                        >
                            <Menu className="size-4.5" strokeWidth={2} />
                        </button>
                        <div className="flex shrink-0 items-center lg:hidden">
                            <GommoLogo variant="icon" />
                        </div>
                        <label className="gommo-field sidebar-shell-control relative min-w-0 flex-1 cursor-text sm:max-w-xs lg:max-w-md">
                            <Search className="size-4 shrink-0 text-primary/55" strokeWidth={2} />
                            <input
                                type="search"
                                placeholder="Buscar no sistema…"
                                className="pe-2 placeholder:text-base-content/32"
                            />
                            <kbd className="ms-auto hidden shrink-0 sm:flex">
                                <Command className="size-2.5" strokeWidth={2.5} />K
                            </kbd>
                        </label>
                        <div className="flex items-center gap-1 sm:gap-1.5">
                            <div className="mx-1 hidden h-5 w-px bg-base-content/10 sm:block" />
                            <ThemeToggle />
                            <button
                                type="button"
                                aria-label="Notificações"
                                className="gommo-btn gommo-btn--ghost gommo-btn--icon-only relative text-base-content/50"
                            >
                                <Bell className="size-4.25" strokeWidth={2} />
                                <span className="absolute right-2 top-2 size-1.75 rounded-full bg-error ring-2 ring-base-100" />
                            </button>
                            <HeaderUserMenu />
                        </div>
                    </header>
                </div>
                {/* Corpo: sidebar (sistemas | rotas) + conteúdo */}
                <Suspense
                    fallback={
                        <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-base-content/50">
                            Carregando…
                        </div>
                    }
                >
                    <WorkspaceNavigationProvider>
                        <div className="relative flex min-h-0 flex-1 overflow-hidden">
                            <Sidebar
                                collapsed={collapsed}
                                onCollapsedToggle={() => setCollapsed((v) => !v)}
                                mobileOpen={mobileNav}
                                onMobileCloseAction={closeMobileNav}
                            />
                            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-[margin] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:ms-(--layout-offset,var(--sidebar-width))">
                                <main
                                    id="main-content"
                                    className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
                                >
                                    {children}
                                </main>
                            </div>
                        </div>
                    </WorkspaceNavigationProvider>
                </Suspense>
            </div>
        </ActiveSystemProvider>
    );
}
