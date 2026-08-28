"use client";

import {CalendarDays, Clock, Menu} from "lucide-react";
import {useSession} from "next-auth/react";
import {type ReactNode, Suspense, useCallback, useEffect, useState} from "react";

import {AgendaModal} from "@/modules/cfg/settings/agenda/components/AgendaModal";
import {AttendanceClockModal} from "@/modules/dp/attendance/components/AttendanceClockModal";
import type {SystemEnum} from "@/modules/root/enum/SystemEnum";
import {GommoLogo} from "@/shared/components/layout/GommoLogo";
import {HeaderAiAssistant} from "@/shared/components/layout/HeaderAiAssistant";
import {HeaderBranchSelector} from "@/shared/components/layout/HeaderBranchSelector";
import {HeaderUserMenu} from "@/shared/components/layout/HeaderUserMenu";
import {Sidebar} from "@/shared/components/layout/Sidebar";
import {AiAssistantPanel} from "@/shared/components/assistant/AiAssistantPanel";
import {HeaderNotifications} from "@/shared/components/notifications/HeaderNotifications";
import {GlobalSearchPalette} from "@/shared/components/search/GlobalSearchPalette";
import {ActiveBranchProvider} from "@/shared/context/ActiveBranchContext";
import {ActiveSystemProvider} from "@/shared/context/ActiveSystemContext";
import {setAuthToken} from "@/shared/lib/api.client";
import {WorkspaceNavigationProvider} from "@/shared/workspace/WorkspaceNavigationProvider";

export function SystemShell({
                                children,
                                initialStoredSystem = null,
                                initialSettingsMode = false,
                                initialBranchId = null,
                            }: {
    children: ReactNode;
    initialStoredSystem?: SystemEnum | null;
    initialSettingsMode?: boolean;
    initialBranchId?: string | null;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileNav, setMobileNav] = useState(false);
    const [clockModalOpen, setClockModalOpen] = useState(false);
    const [agendaModalOpen, setAgendaModalOpen] = useState(false);
    const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
    const {data: session} = useSession();
    const closeMobileNav = useCallback(() => setMobileNav(false), []);
    const toggleMobileNav = useCallback(() => setMobileNav((open) => !open), []);
    const closeClockModal = useCallback(() => setClockModalOpen(false), []);
    const closeAgendaModal = useCallback(() => setAgendaModalOpen(false), []);
    const closeAiAssistant = useCallback(() => setAiAssistantOpen(false), []);
    const toggleAiAssistant = useCallback(() => setAiAssistantOpen((open) => !open), []);

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
        <div className="flex h-dvh flex-col overflow-hidden">
            {/*
              ActiveSystemProvider e WorkspaceNavigationProvider hidratam no mesmo Suspense
              que a Sidebar/header (useSearchParams + preferencias de sistema).
            */}
            <Suspense
                fallback={
                    <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-base-content/50">
                        Carregando...
                    </div>
                }
            >
                <WorkspaceNavigationProvider>
                    <ActiveBranchProvider initialBranchId={initialBranchId}>
                    <ActiveSystemProvider
                        initialStoredSystem={initialStoredSystem}
                        initialSettingsMode={initialSettingsMode}
                    >
                        <div
                            className="relative z-30 flex h-(--header-height) shrink-0 border-b"
                            style={{borderColor: "var(--sidebar-border)"}}
                        >
                            <div
                                className="hidden shrink-0 items-center border-r transition-[width] duration-(--sidebar-transition-duration) ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex"
                                style={{
                                    width: "var(--layout-offset)",
                                    background: "var(--sidebar-bg)",
                                    borderColor: "var(--sidebar-border)",
                                }}
                            >
                                <GommoLogo collapsed={collapsed}/>
                            </div>
                            <header className="surface-header flex min-w-0 flex-1 items-center gap-2 pe-3 ps-(--workspace-toolbar-pad-x) sm:gap-2.5 sm:pe-4">
                                <button
                                    type="button"
                                    aria-label={mobileNav ? "Fechar menu" : "Abrir menu"}
                                    aria-expanded={mobileNav}
                                    onClick={toggleMobileNav}
                                    className="gommo-btn gommo-btn--ghost gommo-btn--icon-only shrink-0 text-base-content/50 lg:hidden!"
                                >
                                    <Menu className="size-4.5" strokeWidth={2}/>
                                </button>
                                <div className="flex shrink-0 items-center lg:hidden">
                                    <GommoLogo collapsed/>
                                </div>
                                <div className="min-w-2 flex-1" aria-hidden/>
                                <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                                    <HeaderBranchSelector/>
                                    <div className="flex items-center gap-0.5 sm:gap-1">
                                        <button
                                            type="button"
                                            aria-label="Agenda"
                                            onClick={() => setAgendaModalOpen(true)}
                                            className="gommo-btn gommo-btn--ghost gommo-btn--icon-only text-base-content/55"
                                        >
                                            <CalendarDays className="size-4" strokeWidth={2}/>
                                        </button>
                                    </div>
                                    <div className="mx-0.5 hidden h-4 w-px bg-base-content/10 sm:block"/>
                                    <div className="flex items-center gap-0.5 sm:gap-1">
                                        <button
                                            type="button"
                                            aria-label="Registro de ponto"
                                            onClick={() => setClockModalOpen(true)}
                                            className="gommo-btn gommo-btn--ghost gommo-btn--icon-only text-base-content/55"
                                        >
                                            <Clock className="size-4" strokeWidth={2}/>
                                        </button>
                                        <HeaderNotifications/>
                                        <GlobalSearchPalette/>
                                        <HeaderAiAssistant
                                            open={aiAssistantOpen}
                                            onClick={toggleAiAssistant}
                                        />
                                        <HeaderUserMenu/>
                                    </div>
                                </div>
                            </header>
                        </div>
                        <div className="relative flex min-h-0 flex-1 overflow-hidden">
                            <Sidebar
                                collapsed={collapsed}
                                onCollapsedToggle={() => setCollapsed((v) => !v)}
                                mobileOpen={mobileNav}
                                onMobileCloseAction={closeMobileNav}
                            />
                            <div
                                className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-[margin] duration-(--sidebar-transition-duration) ease-[cubic-bezier(0.22,1,0.36,1)] lg:ms-(--layout-offset,var(--sidebar-width))">
                                <main
                                    id="main-content"
                                    className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
                                >
                                    {children}
                                </main>
                            </div>
                        </div>
                    </ActiveSystemProvider>
                    </ActiveBranchProvider>
                </WorkspaceNavigationProvider>
            </Suspense>
            <AttendanceClockModal open={clockModalOpen} onClose={closeClockModal}/>
            <AgendaModal open={agendaModalOpen} onClose={closeAgendaModal}/>
            <AiAssistantPanel open={aiAssistantOpen} onClose={closeAiAssistant}/>
        </div>
    );
}
