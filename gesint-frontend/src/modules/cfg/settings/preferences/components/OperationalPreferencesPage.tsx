"use client";

import { AttendanceSettingsCard } from "@/modules/cfg/settings/attendance/components/AttendanceSettingsCard";
import { NotificationSettingsCard } from "@/modules/cfg/settings/notification/components/NotificationSettingsCard";
import { useHasPermission } from "@/shared/auth/permissions";

/**
 * Página unificada das preferências operacionais (ponto + notificações).
 * Cards empilhados, sem seções FormSection — cada bloco salva de forma independente.
 */
export function OperationalPreferencesPage() {
    const canReadAttendance = useHasPermission("attendance:read");
    const canConfigureNotification = useHasPermission("notification:write");

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4 md:p-6">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-base-content">Preferências</h1>
                    <p className="mt-1 text-sm text-base-content/55">
                        Ajustes operacionais de ponto e notificações do sistema.
                    </p>
                </div>
                {canReadAttendance ? <AttendanceSettingsCard /> : null}
                {canConfigureNotification ? <NotificationSettingsCard /> : null}
                {!canReadAttendance && !canConfigureNotification ? (
                    <p className="text-sm text-base-content/55">
                        Você não tem permissão para visualizar estas preferências.
                    </p>
                ) : null}
            </div>
        </div>
    );
}

export default OperationalPreferencesPage;
