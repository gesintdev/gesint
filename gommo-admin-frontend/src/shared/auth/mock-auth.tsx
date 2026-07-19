"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "gommo-admin-mock-auth";

type MockAuthContextValue = {
    ready: boolean;
    isLoggedIn: boolean;
    login: () => void;
    logout: () => void;
};

const MockAuthContext = createContext<MockAuthContextValue | null>(null);

export function MockAuthProvider({ children }: { children: ReactNode }) {
    const [ready, setReady] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        try {
            setIsLoggedIn(localStorage.getItem(STORAGE_KEY) === "1");
        } catch {
            setIsLoggedIn(false);
        }
        setReady(true);
    }, []);

    const login = useCallback(() => {
        try {
            localStorage.setItem(STORAGE_KEY, "1");
        } catch {
            /* ignore */
        }
        setIsLoggedIn(true);
    }, []);

    const logout = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            /* ignore */
        }
        setIsLoggedIn(false);
    }, []);

    const value = useMemo(
        () => ({ ready, isLoggedIn, login, logout }),
        [ready, isLoggedIn, login, logout],
    );

    return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
}

export function useMockAuth() {
    const ctx = useContext(MockAuthContext);
    if (!ctx) {
        throw new Error("useMockAuth deve ser usado dentro de MockAuthProvider");
    }
    return ctx;
}
