"use client";

import { signOut } from "next-auth/react";

import { isPublicAppPath } from "@/shared/auth/public-app-path";
import { flushLoggingOutOverlay, showLoggingOutOverlay } from "@/shared/lib/logging-out-overlay";
import { resolveLoginCallbackUrl } from "@/shared/lib/tenant";

const DEFAULT_LOGOUT_OVERLAY_MS = 1200;

function resolveLogoutOverlayMinMs(): number {
    const raw = process.env.NEXT_PUBLIC_LOGOUT_OVERLAY_MS;
    if (!raw) {
        return DEFAULT_LOGOUT_OVERLAY_MS;
    }
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_LOGOUT_OVERLAY_MS;
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function signOutToTenantLogin(): Promise<void> {
    if (typeof window === "undefined") {
        return;
    }
    // /careers e /ponto: limpa cookie se necessário, mas nunca redireciona para /login.
    if (isPublicAppPath(window.location.pathname)) {
        await signOut({ redirect: false });
        return;
    }
    const loginUrl = resolveLoginCallbackUrl();
    const minOverlayMs = resolveLogoutOverlayMinMs();
    const startedAt = Date.now();
    showLoggingOutOverlay();
    await flushLoggingOutOverlay();
    try {
        // Limpa cache do bootstrap antes do redirect (queryClient global nao esta acessivel aqui).
        // O AppBootstrapProvider remove queries ao ficar unauthenticated.
        await signOut({ redirect: false });
    } finally {
        const remainingMs = Math.max(0, minOverlayMs - (Date.now() - startedAt));
        if (remainingMs > 0) {
            await delay(remainingMs);
        }
        window.location.replace(loginUrl);
    }
}
