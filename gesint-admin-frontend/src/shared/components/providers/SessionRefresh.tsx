"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { setAuthToken } from "@/shared/lib/api.client";
import { signOutToLogin } from "@/shared/lib/sign-out.client";

/** Mantém o token em memória sincronizado e reage a falha de refresh */
export function SessionRefresh() {
    const { data: session } = useSession();
    const signingOutRef = useRef(false);

    useEffect(() => {
        setAuthToken(session?.accessToken ?? null);
    }, [session?.accessToken]);

    useEffect(() => {
        if (session?.error !== "RefreshAccessTokenError" && session?.error !== "RefreshTokenMissing") {
            return;
        }
        if (signingOutRef.current) return;
        signingOutRef.current = true;
        setAuthToken(null);
        toast.error("Sessão expirada. Faça login novamente.");
        void signOutToLogin();
    }, [session?.error]);

    return null;
}
