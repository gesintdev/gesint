"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {type SubmitEvent, useEffect, useState} from "react";
import {toast} from "sonner";

import {attendancerecordKeys} from "@/modules/dp/attendance/attendance.query";
import {attendancerecordService} from "@/modules/dp/attendance/services/attendance-record.service";
import {useHasPermission} from "@/shared/auth/permissions";
import {Button} from "@/shared/components/ui/Button";
import {Card} from "@/shared/components/ui/Card";
import {ExceptionCapture} from "@/shared/exceptions";

export function AttendanceSettingsCard() {
    const queryClient = useQueryClient();
    const canWrite = useHasPermission("attendance:write");
    const [requirePhoto, setRequirePhoto] = useState(true);
    const [requireLocation, setRequireLocation] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const settingsQuery = useQuery({
        queryKey: [...attendancerecordKeys.all, "settings"],
        queryFn: () => attendancerecordService.getSettings(),
    });

    useEffect(() => {
        if (!settingsQuery.data) return;
        setRequirePhoto(settingsQuery.data.requirePhoto);
        setRequireLocation(settingsQuery.data.requireLocation);
    }, [settingsQuery.data]);

    const saveMutation = useMutation({
        mutationFn: () => attendancerecordService.updateSettings({requirePhoto, requireLocation}),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: [...attendancerecordKeys.all, "settings"]});
            toast.success("Configurações de ponto atualizadas");
            setError(null);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível salvar as configurações de ponto.",
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
        <Card
            animate={false}
            title="Ponto"
            subtitle="Validações exigidas no Gommo Tick para registro de ponto"
        >
            <form onSubmit={handleSubmit} className="grid gap-4">
                <label className="flex items-start gap-3 rounded-xl border border-base-300 p-4">
                    <input
                        type="checkbox"
                        className="toggle toggle-primary mt-0.5"
                        checked={requirePhoto}
                        disabled={settingsQuery.isLoading || !canWrite}
                        onChange={(event) => setRequirePhoto(event.target.checked)}
                    />
                    <span>
                        <span className="block text-sm font-semibold text-base-content">Exigir foto</span>
                        <span className="mt-1 block text-sm text-base-content/55">
                            O colaborador deve enviar uma selfie no momento da batida.
                        </span>
                    </span>
                </label>
                <label className="flex items-start gap-3 rounded-xl border border-base-300 p-4">
                    <input
                        type="checkbox"
                        className="toggle toggle-primary mt-0.5"
                        checked={requireLocation}
                        disabled={settingsQuery.isLoading || !canWrite}
                        onChange={(event) => setRequireLocation(event.target.checked)}
                    />
                    <span>
                        <span className="block text-sm font-semibold text-base-content">Exigir localização</span>
                        <span className="mt-1 block text-sm text-base-content/55">
                            O Gommo Tick deve capturar latitude e longitude do dispositivo.
                        </span>
                    </span>
                </label>
                {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
                <div className="flex justify-end">
                    <Button type="submit" variant="primary" loading={saveMutation.isPending} disabled={!canWrite}>
                        Salvar ponto
                    </Button>
                </div>
            </form>
        </Card>
    );
}
