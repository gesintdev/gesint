"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { attendanceSettingsKeys } from "@/modules/gp/attendance/attendance.query";
import type { AttendanceSettings } from "@/modules/gp/attendance/dto/attendance-record.dto";
import { attendancerecordService } from "@/modules/gp/attendance/services/attendance-record.service";
import { invalidateTimeQueries } from "@/modules/gp/shared/lib/invalidate-time-queries";
import { timeManagementService } from "@/modules/gp/shared/services/time-management.service";
import { useHasPermission } from "@/shared/auth/permissions";
import { WorkspacePage } from "@/shared/components/layout/WorkspacePage";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { InputDate, InputNumber, InputString, InputToggle } from "@/shared/components/ui/input";
import { ExceptionCapture } from "@/shared/exceptions";

const DEFAULTS: AttendanceSettings = {
    requirePhoto: true,
    requireLocation: true,
    toleranceMinutes: 10,
    hourBankEnabled: true,
    overtimeEnabled: false,
    hourBankStartDate: null,
    notifyCollaborator: true,
    notifyHr: true,
    notifyNearLimits: true,
    emailCollaborator: false,
    emailHrDigest: false,
    hrDigestRecipients: "",
};

/**
 * Preferências da Gestão de Ponto. Toda opção traz a frase do que ela muda. Escalas continuam no
 * CFG (são usadas pelo sistema inteiro); aqui só se decide como o ponto é apurado e avisado.
 */
export function TimeSettingsPage() {
    const queryClient = useQueryClient();
    const canWrite = useHasPermission("attendance:write");
    const [form, setForm] = useState<AttendanceSettings>(DEFAULTS);
    const query = useQuery({
        queryKey: attendanceSettingsKeys.all,
        queryFn: () => attendancerecordService.getSettings(),
    });

    useEffect(() => {
        if (query.data) setForm({ ...DEFAULTS, ...query.data });
    }, [query.data]);

    const set = <K extends keyof AttendanceSettings>(key: K, value: AttendanceSettings[K]) =>
        setForm((current) => ({ ...current, [key]: value }));

    const save = useMutation({
        mutationFn: () => attendancerecordService.updateSettings(form),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: attendanceSettingsKeys.all });
            await invalidateTimeQueries(queryClient);
            toast.success("Preferências de ponto salvas");
        },
        onError: (error: unknown) =>
            ExceptionCapture.handle(error, { fallbackMessage: "Não foi possível salvar as preferências de ponto." }),
    });

    const runNow = useMutation({
        mutationFn: () => timeManagementService.runHealthCheck(),
        onSuccess: (result) =>
            toast.success(
                result.notified === 0
                    ? "Ontem não houve pendência para avisar."
                    : `${result.notified} ${result.notified === 1 ? "colaborador avisado" : "colaboradores avisados"}`,
            ),
        onError: (error: unknown) => ExceptionCapture.handle(error, { fallbackMessage: "Não foi possível enviar os avisos." }),
    });

    const disabled = !canWrite || query.isLoading;

    return (
        <WorkspacePage>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="crud-list-toolbar flex flex-wrap items-center justify-between gap-3 px-4 py-2">
                    <p className="text-[13px] text-base-content/60">
                        Como o ponto é registrado, apurado e avisado. Escalas ficam em Configurações › Escalas.
                    </p>
                    {canWrite ? (
                        <Button
                            variant="primary"
                            leftIcon={<Save className="size-4" />}
                            loading={save.isPending}
                            disabled={query.isLoading}
                            onClick={() => save.mutate()}
                        >
                            Salvar
                        </Button>
                    ) : null}
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    <div className="mx-auto grid w-full max-w-4xl gap-4">
                        <FormSection title="Registro de ponto" disabled={disabled}>
                            <div className="grid gap-2 sm:col-span-12">
                                <InputToggle
                                    label="Exigir foto"
                                    description="O colaborador envia uma selfie a cada marcação no Gesint Tick e na página pública de ponto."
                                    checked={form.requirePhoto}
                                    onCheckedChange={(value) => set("requirePhoto", value)}
                                    disabled={disabled}
                                />
                                <InputToggle
                                    label="Exigir localização"
                                    description="O Gesint Tick só registra a marcação com latitude e longitude do aparelho."
                                    checked={form.requireLocation}
                                    onCheckedChange={(value) => set("requireLocation", value)}
                                    disabled={disabled}
                                />
                            </div>
                        </FormSection>

                        <FormSection title="Jornada e saldo" disabled={disabled}>
                            <div className="grid gap-2 sm:col-span-12">
                                <div className="grid gap-3 sm:grid-cols-[12rem_1fr] sm:items-end">
                                    <InputNumber
                                        label="Tolerância diária"
                                        value={form.toleranceMinutes}
                                        onValueChange={(value) => set("toleranceMinutes", Math.max(0, Math.min(60, value ?? 0)))}
                                        integer
                                        suffix="min"
                                        disabled={disabled}
                                    />
                                    <p className="gesint-time-help pb-1">
                                        Variações de até esse tempo no dia não viram atraso, débito nem crédito. A CLT
                                        (art. 58, § 1º) admite até 10 minutos.
                                    </p>
                                </div>
                                <InputToggle
                                    label="Banco de horas"
                                    description="Horas além da jornada viram crédito e horas a menos viram débito no banco do colaborador."
                                    checked={form.hourBankEnabled}
                                    onCheckedChange={(value) => set("hourBankEnabled", value)}
                                    disabled={disabled}
                                >
                                    <div className="grid gap-3 sm:grid-cols-[12rem_1fr] sm:items-end">
                                        <InputDate
                                            label="Início da apuração"
                                            value={form.hourBankStartDate ?? ""}
                                            onValueChange={(value) => set("hourBankStartDate", value || null)}
                                            disabled={disabled}
                                        />
                                        <p className="gesint-time-help pb-1">
                                            O saldo acumula a partir desta data. Antes dela, nada entra no banco.
                                        </p>
                                    </div>
                                </InputToggle>
                                <InputToggle
                                    label="Horas extras pagas em folha"
                                    description={
                                        form.hourBankEnabled
                                            ? "Mostra a coluna Horas extras. Só vão para a folha as horas que o RH aprovar como hora extra; o resto vai para o banco."
                                            : "Horas além da jornada viram hora extra e aparecem na coluna Horas extras."
                                    }
                                    checked={form.overtimeEnabled}
                                    onCheckedChange={(value) => set("overtimeEnabled", value)}
                                    disabled={disabled}
                                />
                            </div>
                        </FormSection>

                        <FormSection title="Avisos no sistema" disabled={disabled}>
                            <div className="grid gap-2 sm:col-span-12">
                                <InputToggle
                                    label="Avisar o colaborador"
                                    description="Todo dia de manhã, quem teve marcação incompleta, dia sem registro ou limite da CLT estourado recebe um aviso no sino."
                                    checked={form.notifyCollaborator}
                                    onCheckedChange={(value) => set("notifyCollaborator", value)}
                                    disabled={disabled}
                                />
                                <InputToggle
                                    label="Avisar perto do limite"
                                    description="Durante o dia, avisa quem está perto de 10 horas trabalhadas ou de 6 horas sem intervalo, antes da infração."
                                    checked={form.notifyNearLimits}
                                    onCheckedChange={(value) => set("notifyNearLimits", value)}
                                    disabled={disabled}
                                />
                                <InputToggle
                                    label="Resumo diário para o RH"
                                    description="O RH recebe no sino um resumo do dia anterior por filial: quem precisa de atenção e quantos ajustes aguardam decisão."
                                    checked={form.notifyHr}
                                    onCheckedChange={(value) => set("notifyHr", value)}
                                    disabled={disabled}
                                />
                            </div>
                        </FormSection>

                        <FormSection
                            title="Avisos por e-mail"
                            disabled={disabled}
                            headerActions={
                                canWrite ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        leftIcon={<BellRing className="size-3.5" />}
                                        loading={runNow.isPending}
                                        onClick={() => runNow.mutate()}
                                    >
                                        Enviar avisos de ontem agora
                                    </Button>
                                ) : null
                            }
                        >
                            <div className="grid gap-2 sm:col-span-12">
                                <InputToggle
                                    label="E-mail para o colaborador"
                                    description="Além do sino, o colaborador recebe por e-mail o que aconteceu no dia anterior e como pedir o ajuste."
                                    checked={form.emailCollaborator}
                                    onCheckedChange={(value) => set("emailCollaborator", value)}
                                    disabled={disabled}
                                />
                                <InputToggle
                                    label="Resumo diário por e-mail"
                                    description="Envia a lista de quem precisa de atenção para os e-mails abaixo."
                                    checked={form.emailHrDigest}
                                    onCheckedChange={(value) => set("emailHrDigest", value)}
                                    disabled={disabled}
                                >
                                    <InputString
                                        label="Destinatários"
                                        value={form.hrDigestRecipients}
                                        onValueChange={(value) => set("hrDigestRecipients", value)}
                                        placeholder="rh@empresa.com.br, gestor@empresa.com.br"
                                        maxLength={1000}
                                        disabled={disabled}
                                    />
                                </InputToggle>
                                <p className="gesint-time-help">
                                    O envio usa o servidor de e-mail configurado pela Gesint. Sem ele, os avisos continuam
                                    só no sino.
                                </p>
                            </div>
                        </FormSection>
                    </div>
                </div>
            </div>
        </WorkspacePage>
    );
}

export default TimeSettingsPage;
