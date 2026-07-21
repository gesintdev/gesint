"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {type SubmitEvent, useEffect, useState} from "react";
import {toast} from "sonner";

import {notificationKeys} from "@/modules/cfg/settings/notification/notification.query";
import {notificationSettingsService} from "@/modules/cfg/settings/notification/services/notification.service";
import {useHasPermission} from "@/shared/auth/permissions";
import {Button} from "@/shared/components/ui/Button";
import {Card} from "@/shared/components/ui/Card";
import {InputNumber} from "@/shared/components/ui/input/index";
import {ExceptionCapture} from "@/shared/exceptions";

export function NotificationSettingsCard() {
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
            await queryClient.invalidateQueries({queryKey: notificationKeys.settings});
            await queryClient.invalidateQueries({queryKey: notificationKeys.summary});
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
        <Card animate={false} title="Notificações" subtitle="Avisos operacionais exibidos no sino do sistema">
            <form onSubmit={handleSubmit} className="grid gap-4">
                <InputNumber
                    label="Férias a vencer — avisar com antecedência"
                    hint="Quantidade de dias antes do fim do período concessivo."
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
                    <Button type="submit" variant="primary" loading={saveMutation.isPending} disabled={!canWrite}>
                        Salvar notificações
                    </Button>
                </div>
            </form>
        </Card>
    );
}
