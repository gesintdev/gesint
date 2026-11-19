"use client";

import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";

import {useAccountPreferences} from "@/modules/cfg/account/hooks/useAccountPreferences";
import {
    type AssistantOpenMode,
    DEFAULT_ASSISTANT_OPEN_MODE,
} from "@/modules/cfg/account/services/account.service";
import {AiAssistantPanel} from "@/shared/components/assistant/AiAssistantPanel";
import {assistantWorkspaceRoute} from "@/shared/components/assistant/assistant.routes";
import {HeaderAiAssistant} from "@/shared/components/layout/HeaderAiAssistant";
import {HeaderMoreMenu} from "@/shared/components/layout/HeaderMoreMenu";
import {useAppBootstrap} from "@/shared/components/providers/AppBootstrapProvider";
import {useWorkspaceNavigation} from "@/shared/workspace/useWorkspaceNavigation";
import {useWorkspaceStore} from "@/shared/workspace/workspace.store";

type AssistantLaunchContextValue = {
    sideOpen: boolean;
    modalOpen: boolean;
    highlighted: boolean;
    request: () => void;
    closeSide: () => void;
    closeModal: () => void;
    presentModal: () => void;
    presentTab: () => void;
};

const AssistantLaunchContext = createContext<AssistantLaunchContextValue | null>(null);

function findAssistantTab() {
    return useWorkspaceStore.getState().tabs.find((tab) => tab.routeId === assistantWorkspaceRoute.id);
}

export function AssistantLaunchProvider({children}: {children: ReactNode}) {
    const [sideOpen, setSideOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const {assistantEnabled} = useAppBootstrap();
    const preferences = useAccountPreferences(assistantEnabled);
    const {openFromHref, focusTabById} = useWorkspaceNavigation();
    const mode: AssistantOpenMode = preferences.data?.assistantOpenMode ?? DEFAULT_ASSISTANT_OPEN_MODE;

    useEffect(() => {
        if (!assistantEnabled) {
            setSideOpen(false);
            setModalOpen(false);
        }
    }, [assistantEnabled]);

    const focusOpenAssistantTab = useCallback(() => {
        const tab = findAssistantTab();
        if (!tab) return false;
        setSideOpen(false);
        setModalOpen(false);
        focusTabById(tab.id);
        return true;
    }, [focusTabById]);

    const request = useCallback(() => {
        if (!assistantEnabled) return;
        if (focusOpenAssistantTab()) return;
        if (mode === "TAB") {
            setSideOpen(false);
            setModalOpen(false);
            openFromHref(assistantWorkspaceRoute.href ?? "/assistant");
            return;
        }
        if (mode === "MODAL") {
            setSideOpen(false);
            setModalOpen((open) => !open);
            return;
        }
        setModalOpen(false);
        setSideOpen((open) => !open);
    }, [assistantEnabled, focusOpenAssistantTab, mode, openFromHref]);

    const closeSide = useCallback(() => setSideOpen(false), []);
    const closeModal = useCallback(() => setModalOpen(false), []);
    const presentModal = useCallback(() => {
        setSideOpen(false);
        setModalOpen(true);
    }, []);
    const presentTab = useCallback(() => {
        setSideOpen(false);
        setModalOpen(false);
        openFromHref(assistantWorkspaceRoute.href ?? "/assistant");
    }, [openFromHref]);

    const value = useMemo(
        (): AssistantLaunchContextValue => ({
            sideOpen,
            modalOpen,
            highlighted: sideOpen || modalOpen,
            request,
            closeSide,
            closeModal,
            presentModal,
            presentTab,
        }),
        [closeModal, closeSide, modalOpen, presentModal, presentTab, request, sideOpen],
    );

    return <AssistantLaunchContext.Provider value={value}>{children}</AssistantLaunchContext.Provider>;
}

export function useAssistantLaunch(): AssistantLaunchContextValue {
    const value = useContext(AssistantLaunchContext);
    if (!value) {
        throw new Error("useAssistantLaunch fora do AssistantLaunchProvider");
    }
    return value;
}

export function AssistantHeaderButton() {
    const {assistantEnabled} = useAppBootstrap();
    const {highlighted, request} = useAssistantLaunch();
    if (!assistantEnabled) return null;
    return (
        <div className="hidden lg:block">
            <HeaderAiAssistant open={highlighted} onClick={request}/>
        </div>
    );
}

export function AssistantOverflowMenu({
    onAgenda,
    onClock,
}: {
    onAgenda: () => void;
    onClock: () => void;
}) {
    const {assistantEnabled} = useAppBootstrap();
    const {highlighted, request} = useAssistantLaunch();
    return (
        <HeaderMoreMenu
            onAgenda={onAgenda}
            onClock={onClock}
            onAiAssistant={assistantEnabled ? request : undefined}
            aiAssistantOpen={highlighted}
            showAiAssistant={assistantEnabled}
        />
    );
}

export function AssistantSurfaceHost() {
    const {assistantEnabled} = useAppBootstrap();
    const {sideOpen, modalOpen, closeSide, closeModal, presentModal, presentTab} = useAssistantLaunch();
    if (!assistantEnabled) return null;
    return (
        <AiAssistantPanel
            sideOpen={sideOpen}
            modalOpen={modalOpen}
            onSideClose={closeSide}
            onModalClose={closeModal}
            onOpenModal={presentModal}
            onOpenTab={presentTab}
        />
    );
}
