"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { AppWindow, PanelRight, PanelTop } from "lucide-react";
import { toast } from "sonner";

import { accountPreferencesQueryKey } from "@/modules/cfg/account/account-preferences.query";
import { useAccountPreferences } from "@/modules/cfg/account/hooks/useAccountPreferences";
import {
    type AccountPreferences,
    type AssistantOpenMode,
    accountService,
    DEFAULT_ASSISTANT_OPEN_MODE,
    DEFAULT_PDF_DELIVERY_MODE,
} from "@/modules/cfg/account/services/account.service";
import { Card } from "@/shared/components/ui/Card";

const OPTIONS: Array<{
    value: AssistantOpenMode;
    label: string;
    description: string;
    icon: typeof PanelRight;
}> = [
    {
        value: "SIDE",
        label: "Janela lateral",
        description: "Abre o assistente ao lado da tela",
        icon: PanelRight,
    },
    {
        value: "MODAL",
        label: "Modal",
        description: "Abre o assistente em uma janela",
        icon: AppWindow,
    },
    {
        value: "TAB",
        label: "Aba",
        description: "Abre o assistente em uma aba do workspace",
        icon: PanelTop,
    },
];

export function AccountAssistantPreferenceCard() {
    const queryClient = useQueryClient();
    const preferences = useAccountPreferences();
    const selected = preferences.data?.assistantOpenMode ?? DEFAULT_ASSISTANT_OPEN_MODE;
    const mutation = useMutation({
        mutationFn: (assistantOpenMode: AssistantOpenMode) => {
            const current = queryClient.getQueryData<AccountPreferences>(accountPreferencesQueryKey);
            return accountService.updatePreferences({
                reportPdfDeliveryMode: current?.reportPdfDeliveryMode ?? DEFAULT_PDF_DELIVERY_MODE,
                assistantOpenMode,
            });
        },
        onSuccess: (data) => {
            queryClient.setQueryData<AccountPreferences>(accountPreferencesQueryKey, data);
            toast.success("Preferência do assistente atualizada");
        },
        onError: () => toast.error("Não foi possível atualizar a preferência"),
    });

    return (
        <Card animate={false} title="Assistente IA" subtitle="Defina como o assistente será aberto">
            <div className="grid gap-2.5 sm:grid-cols-3">
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
                                "flex flex-col items-start gap-2 rounded-xl border px-3.5 py-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                                active
                                    ? "border-primary/35 bg-primary/8"
                                    : "border-base-content/10 bg-base-200/40 enabled:hover:border-base-content/18 enabled:hover:bg-base-200/70 dark:bg-base-300/25",
                            )}
                        >
                            <span
                                className={clsx(
                                    "flex size-8 items-center justify-center rounded-lg",
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
