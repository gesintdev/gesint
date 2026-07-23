"use client";

import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

export type QueryRefreshState = {
    refetch: () => void;
    isFetching: boolean;
};

type QueryRefreshHostApi = {
    register: (state: QueryRefreshState) => number;
    update: (id: number, state: QueryRefreshState) => void;
    unregister: (id: number) => void;
};

const QueryRefreshHostApiContext = createContext<QueryRefreshHostApi | null>(null);
const QueryRefreshStateContext = createContext<QueryRefreshState | null>(null);

/**
 * Host no CrudScreen: a listagem (filha) registra o refetch para cima,
 * porque o botão de atualizar vive na toolbar do pai.
 */
export function QueryRefreshHostProvider({ children }: { children: ReactNode }) {
    const registrationsRef = useRef(new Map<number, QueryRefreshState>());
    const nextIdRef = useRef(0);
    const [refresh, setRefresh] = useState<QueryRefreshState | null>(null);

    const publishTop = useCallback(() => {
        const ids = [...registrationsRef.current.keys()];
        if (ids.length === 0) {
            setRefresh(null);
            return;
        }
        const topId = Math.max(...ids);
        setRefresh(registrationsRef.current.get(topId) ?? null);
    }, []);

    const api = useMemo<QueryRefreshHostApi>(
        () => ({
            register: (state) => {
                const id = ++nextIdRef.current;
                registrationsRef.current.set(id, state);
                publishTop();
                return id;
            },
            update: (id, state) => {
                if (!registrationsRef.current.has(id)) return;
                registrationsRef.current.set(id, state);
                publishTop();
            },
            unregister: (id) => {
                if (!registrationsRef.current.delete(id)) return;
                publishTop();
            },
        }),
        [publishTop],
    );

    return (
        <QueryRefreshHostApiContext.Provider value={api}>
            <QueryRefreshStateContext.Provider value={refresh}>{children}</QueryRefreshStateContext.Provider>
        </QueryRefreshHostApiContext.Provider>
    );
}

export function useQueryRefresh(): QueryRefreshState | null {
    return useContext(QueryRefreshStateContext);
}

/** Registra refetch no host ancestral (CrudScreen). Sem host, é no-op. */
export function useRegisterQueryRefresh(state: QueryRefreshState | null) {
    const host = useContext(QueryRefreshHostApiContext);
    const idRef = useRef<number | null>(null);

    useLayoutEffect(() => {
        if (!host) return;

        if (!state) {
            if (idRef.current != null) {
                host.unregister(idRef.current);
                idRef.current = null;
            }
            return;
        }

        if (idRef.current == null) {
            idRef.current = host.register(state);
            return;
        }
        host.update(idRef.current, state);
    }, [host, state]);

    useLayoutEffect(() => {
        return () => {
            if (idRef.current == null || !host) return;
            host.unregister(idRef.current);
            idRef.current = null;
        };
    }, [host]);
}

/** @deprecated Use {@link QueryRefreshHostProvider} + {@link useRegisterQueryRefresh}. */
export function QueryRefreshProvider({
    value,
    children,
}: {
    value: QueryRefreshState | null;
    children: ReactNode;
}) {
    useRegisterQueryRefresh(value);
    return <>{children}</>;
}
