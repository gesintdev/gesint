"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { accountPreferencesQueryKey } from "@/modules/cfg/account/account-preferences.query";
import { useAccountPreferences } from "@/modules/cfg/account/hooks/useAccountPreferences";
import {
    type AccountPreferences,
    accountService,
    type PdfDeliveryMode,
} from "@/modules/cfg/account/services/account.service";
import { Card } from "@/shared/components/ui/Card";

const OPTIONS: Array<{
    value: PdfDeliveryMode;
    label: string;
    description: string;
    icon: typeof Download;
}> = [
    {
        value: "DOWNLOAD",
        label: "Baixar arquivo",
        description: "Salva o PDF no dispositivo",
        icon: Download,
    },
    {
        value: "NEW_TAB",
        label: "Abrir em nova aba",
        description: "Exibe o PDF no navegador",
        icon: ExternalLink,
    },
];

export function AccountPdfPreferenceCard() {
    const queryClient = useQueryClient();
    const preferences = useAccountPreferences();
    const selected = preferences.data?.reportPdfDeliveryMode ?? "DOWNLOAD";
    const mutation = useMutation({
        mutationFn: (reportPdfDeliveryMode: PdfDeliveryMode) =>
            accountService.updatePreferences({ reportPdfDeliveryMode }),
        onSuccess: (data) => {
            queryClient.setQueryData<AccountPreferences>(accountPreferencesQueryKey, data);
            toast.success("Preferência de relatórios atualizada");
        },
        onError: () => toast.error("Não foi possível atualizar a preferência"),
    });

    return (
        <Card animate={false} title="Relatórios em PDF" subtitle="Defina como os relatórios serão abertos">
            <div className="grid gap-2.5 sm:grid-cols-2">
                {OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const active = selected === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            disabled={preferences.isLoading || mutation.isPending}
                            onClick={() => mutation.mutate(option.value)}
                            className={clsx(
                                "flex items-center gap-3 rounded-xl border px-3.5 py-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                                active
                                    ? "border-primary/35 bg-primary/8"
                                    : "border-base-content/10 bg-base-200/40 enabled:hover:border-base-content/18 enabled:hover:bg-base-200/70 dark:bg-base-300/25",
                            )}
                        >
                            <span
                                className={clsx(
                                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                                    active ? "bg-primary/15 text-primary" : "bg-base-content/6 text-base-content/55",
                                )}
                            >
                                <Icon className="size-4" strokeWidth={2} />
                            </span>
                            <span>
                                <span className="block text-sm font-semibold text-base-content">{option.label}</span>
                                <span className="mt-0.5 block text-[11px] leading-snug text-base-content/50">
                                    {option.description}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </Card>
    );
}
