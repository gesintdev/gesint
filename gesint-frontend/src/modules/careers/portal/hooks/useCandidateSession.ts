"use client";

import { useCallback, useEffect, useState } from "react";

import {
    clearCandidateSession,
    readCandidateSession,
    type CandidateSession,
} from "@/modules/careers/portal/lib/candidate-session";

export function useCandidateSession() {
    const [session, setSession] = useState<CandidateSession | null>(null);
    const [ready, setReady] = useState(false);

    const refresh = useCallback(() => {
        setSession(readCandidateSession());
        setReady(true);
    }, []);

    useEffect(() => {
        refresh();
        const onChange = () => refresh();
        window.addEventListener("gesint-candidate-session", onChange);
        window.addEventListener("storage", onChange);
        return () => {
            window.removeEventListener("gesint-candidate-session", onChange);
            window.removeEventListener("storage", onChange);
        };
    }, [refresh]);

    const logout = useCallback(() => {
        clearCandidateSession();
        setSession(null);
    }, []);

    return { session, ready, isAuthenticated: Boolean(session), refresh, logout };
}
