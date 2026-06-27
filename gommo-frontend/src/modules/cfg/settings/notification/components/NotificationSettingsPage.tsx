"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { notificationKeys } from "@/modules/cfg/settings/notification/notification.query";
import { notificationSettingsService } from "@/modules/cfg/settings/notification/services/notification.service";
import { useHasPermission } from "@/shared/auth/permissions";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { InputNumber } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

export function NotificationSettingsPage() {
    const queryClient = useQueryClient();
    const canWrite = useHasPermission("notification:write");
    const [vacationDueNoticeDays, setVacationDueNoticeDays] = useState<number | null>(30);
    const [error, setError] = useState<string | null>(null);

    const settingsQuery = useQuery({
        queryKey: notificationKeys.settings,
        queryFn: () => notificationSettingsService.getSettings(),
    });

    useEffect(() => {
        if (settingsQuery.data) {
            setVacationDueNoticeDays(settingsQuery.data.vacationDueNoticeDays);
        }
    }, [settingsQuery.data]);

    const saveMutation = useMutation({
        mutationFn: () =>
            notificationSettingsService.updateSettings({
                vacationDueNoticeDays: vacationDueNoticeDays ?? 30,
            }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: notificationKeys.settings });
            await queryClient.invalidateQueries({ queryKey: notificationKeys.summary });
            toast.success("Configurações de notificações atualizadas");
            setError(null);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível salvar as configurações de notificações.",
            });
            setError(ex.displayMessage);
        },
    });

    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        saveMutation.mutate();
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4 md:p-6">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-base-content">Notificações</h1>
                    <p className="mt-1 text-sm text-base-content/55">
                        Configure os avisos operacionais exibidos no sino do sistema.
                    </p>
                </div>

                <Card animate={false} title="Férias a vencer" subtitle="Antecedência para alertar o DP/RH">
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <InputNumber
                            label="Avisar com antecedência"
                            hint="Informe a quantidade de dias antes do fim do período concessivo."
                            value={vacationDueNoticeDays}
                            onValueChange={setVacationDueNoticeDays}
                            integer
                            decimalPlaces={0}
                            thousandSeparator={false}
                            suffix="dias"
                            align="left"
                            required
                            disabled={settingsQuery.isLoading || !canWrite}
                            wrapperClassName="max-w-xs"
                        />
                        {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                variant="primary"
                                loading={saveMutation.isPending}
                                disabled={!canWrite}
                            >
                                Salvar configurações
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}

export default NotificationSettingsPage;
