"use client";

import { type ReactNode, useEffect, useState } from "react";

import { LoginShell } from "@/shared/components/auth/LoginShell";
import { AppException } from "@/shared/exceptions";
import { apiFetch } from "@/shared/lib/api.client";
import { resolveTenantSlugFromHostname } from "@/shared/lib/tenant";

type GateState =
    | { status: "checking" }
    | { status: "ok" }
    | { status: "error"; title: string; message: string; tenantSlug: string | null };

/**
 * Em hosts com subdomínio (ex.: posto-sjb.localhost), confirma que o tenant existe
 * antes de exibir login/definir-senha. Subdomínios desconhecidos não devem parecer um ambiente válido.
 *
 * O estado inicial é sempre "checking" (igual no SSR e no primeiro paint do cliente)
 * para evitar mismatch de hidratação — o host só é lido no useEffect.
 */
export function TenantEnvironmentGate({ children }: { children: ReactNode }) {
    const [state, setState] = useState<GateState>({ status: "checking" });

    useEffect(() => {
        const tenantSlug = resolveTenantSlugFromHostname();
        if (!tenantSlug) {
            setState({ status: "ok" });
            return;
        }

        let cancelled = false;

        void (async () => {
            try {
                await apiFetch("/api/v1/auth/tenant", {
                    skipAuth: true,
                    skipAuthRetry: true,
                });
                if (!cancelled) {
                    setState({ status: "ok" });
                }
            } catch (error) {
                if (cancelled) {
                    return;
                }
                const code = error instanceof AppException ? error.code : undefined;
                if (code === "TENANT_NOT_FOUND") {
                    setState({
                        status: "error",
                        title: "Ambiente não encontrado",
                        message:
                            "Não existe cliente configurado para este endereço. Verifique o subdomínio e tente novamente.",
                        tenantSlug,
                    });
                    return;
                }
                if (code === "TENANT_NOT_READY") {
                    setState({
                        status: "error",
                        title: "Ambiente ainda não está pronto",
                        message: "O ambiente deste cliente ainda está sendo provisionado. Tente novamente em instantes.",
                        tenantSlug,
                    });
                    return;
                }
                if (code === "TENANT_SUSPENDED") {
                    setState({
                        status: "error",
                        title: "Ambiente suspenso",
                        message: "A licença deste cliente está suspensa ou cancelada.",
                        tenantSlug,
                    });
                    return;
                }
                setState({
                    status: "error",
                    title: "Não foi possível validar o ambiente",
                    message: "Tente novamente em instantes. Se o problema continuar, contate o suporte.",
                    tenantSlug,
                });
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    if (state.status === "ok") {
        return children;
    }

    if (state.status === "checking") {
        return (
            <LoginShell>
                <p className="mt-4 text-sm text-base-content/60">Validando ambiente...</p>
            </LoginShell>
        );
    }

    return (
        <LoginShell>
            <div className="login-form mt-2 text-left">
                <h1 className="text-lg font-semibold text-base-content">{state.title}</h1>
                <p className="mt-2 text-sm text-base-content/60">{state.message}</p>
                {state.tenantSlug ? (
                    <p className="mt-3 text-xs text-base-content/40">Endereço: {state.tenantSlug}</p>
                ) : null}
            </div>
        </LoginShell>
    );
}
