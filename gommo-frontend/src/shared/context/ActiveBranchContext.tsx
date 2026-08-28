"use client";

import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useSyncExternalStore,
} from "react";

import { useSession } from "next-auth/react";

import { type Branch, persistActiveBranch, readActiveBranch, subscribeActiveBranch } from "@/shared/lib/branch";
import { writeLastWorkspaceInitLocation } from "@/shared/workspace/workspace-location";
import { useWorkspaceStore } from "@/shared/workspace/workspace.store";

type ActiveBranchContextValue = {
    branches: Branch[];
    activeBranch: Branch | null;
    activeBranchId: string | null;
    selectBranch: (branchId: string) => void;
    /** Cliente sem filial cadastrada ainda: o app opera sem escopo ate a matriz existir. */
    hasBranches: boolean;
};

const ActiveBranchContext = createContext<ActiveBranchContextValue | null>(null);

type ActiveBranchProviderProps = {
    children: ReactNode;
    /** Valor do cookie gommo-active-branch lido no servidor (SSR). */
    initialBranchId?: string | null;
};

export function ActiveBranchProvider({ children, initialBranchId = null }: ActiveBranchProviderProps) {
    const { data: session } = useSession();
    const switchBranchGroup = useWorkspaceStore((state) => state.switchBranchGroup);

    const branches = useMemo(() => session?.branches ?? [], [session?.branches]);

    const storedBranchId = useSyncExternalStore(
        subscribeActiveBranch,
        readActiveBranch,
        () => initialBranchId,
    );

    /**
     * A filial guardada pode nao existir mais, ou o usuario pode ter perdido acesso a ela desde o
     * ultimo login. Nesses casos cai na matriz, e so entao na primeira da lista.
     */
    const activeBranch = useMemo(() => {
        if (branches.length === 0) {
            return null;
        }
        const stored = branches.find((branch) => branch.id === storedBranchId);
        return stored ?? branches.find((branch) => branch.headquarters) ?? branches[0];
    }, [branches, storedBranchId]);

    const activeBranchId = activeBranch?.id ?? null;

    useEffect(() => {
        if (activeBranchId && activeBranchId !== storedBranchId) {
            persistActiveBranch(activeBranchId);
        }
    }, [activeBranchId, storedBranchId]);

    // Cada filial tem seu proprio grupo de abas, como grupos de guias do navegador.
    useEffect(() => {
        if (activeBranchId) {
            switchBranchGroup(activeBranchId);
        }
    }, [activeBranchId, switchBranchGroup]);

    const prevBranchForUrlRef = useRef<string | null | undefined>(undefined);

    // ?edit= / ?new= na URL reabrem o cadastro apos reload ou init do workspace — limpar ao trocar filial.
    useEffect(() => {
        if (!activeBranchId) return;
        const previous = prevBranchForUrlRef.current;
        prevBranchForUrlRef.current = activeBranchId;
        if (previous === undefined || previous === activeBranchId) return;
        if (typeof window === "undefined") return;

        const params = new URLSearchParams(window.location.search);
        if (!params.has("edit") && !params.has("new")) return;
        params.delete("edit");
        params.delete("new");
        const qs = params.toString();
        const target = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
        window.history.replaceState(window.history.state, "", target);
        writeLastWorkspaceInitLocation(target);
    }, [activeBranchId]);

    const selectBranch = useCallback(
        (branchId: string) => {
            if (!branches.some((branch) => branch.id === branchId)) {
                return;
            }
            persistActiveBranch(branchId);
        },
        [branches],
    );

    const value = useMemo(
        () => ({
            branches,
            activeBranch,
            activeBranchId,
            selectBranch,
            hasBranches: branches.length > 0,
        }),
        [branches, activeBranch, activeBranchId, selectBranch],
    );

    return <ActiveBranchContext.Provider value={value}>{children}</ActiveBranchContext.Provider>;
}

export function useActiveBranch(): ActiveBranchContextValue {
    const ctx = useContext(ActiveBranchContext);
    if (!ctx) {
        throw new Error("useActiveBranch deve ser usado dentro de ActiveBranchProvider");
    }
    return ctx;
}
