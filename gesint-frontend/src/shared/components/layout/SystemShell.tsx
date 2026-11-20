"use client";

import {CalendarDays, Clock, Menu} from "lucide-react";
import {useSession} from "next-auth/react";
import {type ReactNode, Suspense, useCallback, useEffect, useState} from "react";

import {AgendaModal} from "@/modules/cfg/settings/agenda/components/AgendaModal";
import {AttendanceClockModal} from "@/modules/dp/attendance/components/AttendanceClockModal";
import type {SystemEnum} from "@/modules/root/enum/SystemEnum";
import {AssistantChatProvider} from "@/shared/components/assistant/assistant-chat";
import {
    AssistantHeaderButton,
    AssistantLaunchProvider,
    AssistantOverflowMenu,
    AssistantSurfaceHost,
} from "@/shared/components/assistant/assistant-launch";
import {AppLoadingScreen} from "@/shared/components/layout/AppLoadingScreen";
import {GesintLogo} from "@/shared/components/layout/GesintLogo";
import {HeaderBranchSelector} from "@/shared/components/layout/HeaderBranchSelector";
import {HeaderUserMenu} from "@/shared/components/layout/HeaderUserMenu";
import {Sidebar} from "@/shared/components/layout/Sidebar";
import {HeaderNotifications} from "@/shared/components/notifications/HeaderNotifications";
import {useSessionReady} from "@/shared/components/providers/SessionGate";
import {HeaderReleaseVersion} from "@/shared/components/release-notes/HeaderReleaseVersion";
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
    const {data: session} = useSession();
    const sessionReady = useSessionReady();
    const closeMobileNav = useCallback(() => setMobileNav(false), []);
    const toggleMobileNav = useCallback(() => setMobileNav((open) => !open), []);
    const closeClockModal = useCallback(() => setClockModalOpen(false), []);
    const closeAgendaModal = useCallback(() => setAgendaModalOpen(false), []);

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
        document.documentElement.classList.add("gesint-workspace-active");
        return () => document.documentElement.classList.remove("gesint-workspace-active");
    }, []);

    if (!sessionReady) {
        return <AppLoadingScreen />;
    }

    return (
        <div className="flex h-dvh flex-col overflow-hidden">
            {/*
              ActiveSystemProvider e WorkspaceNavigationProvider hidratam no mesmo Suspense
              que a Sidebar/header (useSearchParams + preferencias de sistema).
            */}
            <Suspense fallback={<AppLoadingScreen variant="inline" />}>
                <WorkspaceNavigationProvider>
                    <AssistantLaunchProvider>
                    <AssistantChatProvider>
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
                                <GesintLogo collapsed={collapsed}/>
                            </div>
                            <header className="surface-header flex min-w-0 flex-1 items-center gap-1.5 pe-2 ps-(--workspace-toolbar-pad-x) sm:gap-2.5 sm:pe-4">
                                <button
                                    type="button"
                                    aria-label={mobileNav ? "Fechar menu" : "Abrir menu"}
                                    aria-expanded={mobileNav}
                                    onClick={toggleMobileNav}
                                    className="gesint-btn gesint-btn--ghost gesint-btn--icon-only shrink-0 text-base-content/50 lg:hidden!"
                                >
                                    <Menu className="size-4.5" strokeWidth={1.5}/>
                                </button>
                                <div className="flex shrink-0 items-center lg:hidden">
                                    <GesintLogo collapsed/>
                                </div>
                                <div className="hidden min-w-0 lg:block">
                                    <HeaderReleaseVersion/>
                                </div>
                                <div className="min-w-1 flex-1 sm:min-w-2" aria-hidden/>
                                <div className="header-toolbar-end">
                                    <HeaderBranchSelector/>
                                    <div className="header-actions-trail" role="group" aria-label="Ações rápidas">
                                        <button
                                            type="button"
                                            aria-label="Agenda"
                                            title="Agenda"
                                            onClick={() => setAgendaModalOpen(true)}
                                            className="gesint-btn gesint-btn--ghost gesint-btn--icon-only max-lg:hidden"
                                        >
                                            <CalendarDays className="size-4" strokeWidth={2}/>
                                        </button>
                                        <button
                                            type="button"
                                            aria-label="Registro de ponto"
                                            title="Registro de ponto"
                                            onClick={() => setClockModalOpen(true)}
                                            className="gesint-btn gesint-btn--ghost gesint-btn--icon-only max-lg:hidden"
                                        >
                                            <Clock className="size-4" strokeWidth={2}/>
                                        </button>
                                        <HeaderNotifications/>
                                        <GlobalSearchPalette/>
                                        <AssistantHeaderButton/>
                                        <AssistantOverflowMenu
                                            onAgenda={() => setAgendaModalOpen(true)}
                                            onClock={() => setClockModalOpen(true)}
                                        />
                                    </div>
                                    <HeaderUserMenu/>
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
                        <AssistantSurfaceHost/>
                    </ActiveSystemProvider>
                    </ActiveBranchProvider>
                    </AssistantChatProvider>
                    </AssistantLaunchProvider>
                </WorkspaceNavigationProvider>
            </Suspense>
            <AttendanceClockModal open={clockModalOpen} onClose={closeClockModal}/>
            <AgendaModal open={agendaModalOpen} onClose={closeAgendaModal}/>
        </div>
    );
}
