"use client";

import { useQuery } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { useOptionalAppBootstrap } from "@/shared/components/providers/AppBootstrapProvider";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { apiFetch } from "@/shared/lib/api.client";

type TenantInfoResponse = {
    slug?: string;
    name?: string;
    mobileLoginCode?: string | null;
};

function AccessCodeRow({
    label,
    code,
    emptyMessage,
    loading,
}: {
    label: string;
    code: string | null;
    emptyMessage: string;
    loading?: boolean;
}) {
    const handleCopy = async () => {
        if (!code) return;
        try {
            await navigator.clipboard.writeText(code);
            toast.success("Código copiado");
        } catch {
            toast.error("Não foi possível copiar o código.");
        }
    };

    if (loading) {
        return <div className="skeleton-shimmer h-14 w-full rounded-xl" />;
    }

    if (!code) {
        return <p className="text-sm text-base-content/55">{emptyMessage}</p>;
    }

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-base-content/45">{label}</p>
                <p className="mt-1 font-mono text-base font-semibold tracking-wider text-base-content">{code}</p>
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Copy className="size-3.5" strokeWidth={2.25} />}
                onClick={() => void handleCopy()}
            >
                Copiar
            </Button>
        </div>
    );
}

export function AccountMobileAccessCard() {
    const bootstrap = useOptionalAppBootstrap()?.bootstrap;
    const tenantQuery = useQuery({
        queryKey: ["account", "tenant-mobile-code"],
        queryFn: () => apiFetch<TenantInfoResponse | undefined>("/api/v1/auth/tenant"),
    });

    const employerCode = tenantQuery.data?.mobileLoginCode?.trim() || null;
    const collaboratorCode = bootstrap?.accessCode?.trim() || null;
    const hasLinkedCollaborator = Boolean(bootstrap?.collaboratorId);
    const collaboratorEmptyMessage = hasLinkedCollaborator
        ? "Código do colaborador ainda não disponível para sua conta."
        : "Código do colaborador não disponível. Seu usuário não está vinculado a um colaborador.";

    return (
        <Card animate={false}>
            <div className="flex flex-col gap-5">
                <AccessCodeRow
                    label="Código do empregador"
                    code={employerCode}
                    emptyMessage="Código do empregador não disponível para este ambiente."
                    loading={tenantQuery.isLoading}
                />
                <div className="border-t border-base-content/10" />
                <AccessCodeRow
                    label="Código do colaborador"
                    code={collaboratorCode}
                    emptyMessage={collaboratorEmptyMessage}
                />
            </div>
        </Card>
    );
}
