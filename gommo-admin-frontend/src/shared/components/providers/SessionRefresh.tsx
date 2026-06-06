"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { setAuthToken } from "@/shared/lib/api.client";

/** Mantém o token em memória sincronizado e reage a falha de refresh */
export function SessionRefresh() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.accessToken) {
      setAuthToken(session.accessToken);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError" || session?.error === "RefreshTokenMissing") {
      setAuthToken(null);
      toast.error("Sessão expirada. Faça login novamente.");
      void signOut({ callbackUrl: "/login" });
    }
  }, [session?.error]);

  return null;
}
