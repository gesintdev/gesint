"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { setAuthToken } from "@/shared/lib/api.client";
import { signOutToTenantLogin } from "@/shared/lib/sign-out.client";

const INACTIVITY_LOGOUT_MS = 60 * 60 * 1000;
const INACTIVITY_EVENTS = ["pointerdown", "keydown", "mousemove", "scroll", "touchstart"] as const;

function millisecondsUntilNextMidnight(): number {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    return Math.max(0, nextMidnight.getTime() - now.getTime());
}

export function SessionExpiryGuards() {
    const { status } = useSession();
    const signingOutRef = useRef(false);

    useEffect(() => {
        if (status !== "authenticated") {
            return;
        }

        let inactivityTimer: number | undefined;

        const expireByInactivity = () => {
            if (signingOutRef.current) return;
            signingOutRef.current = true;
            setAuthToken(null);
            toast.error("Sessão expirada por inatividade. Faça login novamente.");
            void signOutToTenantLogin();
        };

        const resetInactivityTimer = () => {
            if (inactivityTimer) {
                window.clearTimeout(inactivityTimer);
            }
            inactivityTimer = window.setTimeout(expireByInactivity, INACTIVITY_LOGOUT_MS);
        };

        resetInactivityTimer();
        for (const event of INACTIVITY_EVENTS) {
            window.addEventListener(event, resetInactivityTimer, { passive: true });
        }

        return () => {
            if (inactivityTimer) {
                window.clearTimeout(inactivityTimer);
            }
            for (const event of INACTIVITY_EVENTS) {
                window.removeEventListener(event, resetInactivityTimer);
            }
        };
    }, [status]);

    useEffect(() => {
        if (status !== "authenticated") {
            return;
        }

        const timeout = window.setTimeout(() => {
            if (signingOutRef.current) return;
            signingOutRef.current = true;
            setAuthToken(null);
            toast.error("Sessão encerrada. Faça login novamente.");
            void signOutToTenantLogin();
        }, millisecondsUntilNextMidnight());

        return () => window.clearTimeout(timeout);
    }, [status]);

    useEffect(() => {
        if (status !== "authenticated") {
            signingOutRef.current = false;
        }
    }, [status]);

    return null;
}
