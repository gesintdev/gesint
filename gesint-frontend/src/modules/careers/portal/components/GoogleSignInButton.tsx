"use client";

import { useEffect, useRef, useState } from "react";

import { loadGoogleGisScript } from "@/modules/careers/portal/lib/google-gis";
import { Button } from "@/shared/components/ui/Button";

export function GoogleSignInButton({
    clientId,
    enabled,
    onCredential,
    onError,
    label = "Continuar com Google",
}: {
    clientId: string;
    enabled: boolean;
    onCredential: (idToken: string) => void;
    onError?: (message: string) => void;
    label?: string;
}) {
    const hostRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!enabled || !clientId || !hostRef.current) {
            return;
        }
        let cancelled = false;
        setLoading(true);
        void loadGoogleGisScript()
            .then(() => {
                if (cancelled || !hostRef.current || !window.google?.accounts?.id) {
                    return;
                }
                hostRef.current.innerHTML = "";
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: (response) => {
                        if (response?.credential) {
                            onCredential(response.credential);
                        } else {
                            onError?.("Google nao retornou credencial.");
                        }
                    },
                    ux_mode: "popup",
                });
                window.google.accounts.id.renderButton(hostRef.current, {
                    theme: "outline",
                    size: "large",
                    text: "continue_with",
                    shape: "rectangular",
                    width: Math.min(320, hostRef.current.clientWidth || 280),
                    locale: "pt-BR",
                });
            })
            .catch(() => onError?.("Nao foi possivel carregar o login Google."))
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [clientId, enabled, onCredential, onError]);

    if (!enabled || !clientId) {
        return (
            <Button type="button" variant="outline" className="w-full" disabled>
                {label} (em configuracao)
            </Button>
        );
    }

    return (
        <div className="grid gap-2">
            {loading ? <p className="text-center text-xs text-base-content/50">Carregando Google…</p> : null}
            <div ref={hostRef} className="flex min-h-10 justify-center overflow-hidden" />
        </div>
    );
}
