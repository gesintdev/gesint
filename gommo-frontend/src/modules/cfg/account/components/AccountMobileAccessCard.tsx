"use client";

import { useQuery } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { apiFetch } from "@/shared/lib/api.client";

type TenantInfoResponse = {
    slug?: string;
    name?: string;
    mobileLoginCode?: string | null;
};

export function AccountMobileAccessCard() {
    const tenantQuery = useQuery({
        queryKey: ["account", "tenant-mobile-code"],
        queryFn: () => apiFetch<TenantInfoResponse | undefined>("/api/v1/auth/tenant"),
    });

    const code = tenantQuery.data?.mobileLoginCode?.trim() || null;

    const handleCopy = async () => {
        if (!code) return;
        try {
            await navigator.clipboard.writeText(code);
            toast.success("Código copiado");
        } catch {
            toast.error("Não foi possível copiar o código.");
        }
    };

    return (
        <Card animate={false}>
            {tenantQuery.isLoading ? (
                <div className="skeleton-shimmer h-14 w-full rounded-xl" />
            ) : code ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-base-content/45">
                            Código mobile
                        </p>
                        <p className="mt-1 font-mono text-base font-semibold tracking-wider text-base-content">
                            {code}
                        </p>
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
            ) : (
                <p className="text-sm text-base-content/55">
                    Código mobile não disponível para este ambiente.
                </p>
            )}
        </Card>
    );
}
