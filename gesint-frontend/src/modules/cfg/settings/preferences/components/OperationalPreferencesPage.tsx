"use client";

import { NotificationSettingsCard } from "@/modules/cfg/settings/notification/components/NotificationSettingsCard";
import { useHasPermission } from "@/shared/auth/permissions";

/**
 * Preferências operacionais do CFG (notificações do sistema). As preferências de ponto foram para
 * Gestão de Ponto › Configurações › Preferências de ponto.
 */
export function OperationalPreferencesPage() {
    const canConfigureNotification = useHasPermission("notification:write");

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4 md:p-6">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-base-content">Preferências</h1>
                    <p className="mt-1 text-sm text-base-content/55">
                        Notificações do sistema. As regras de ponto ficam em Gestão de Ponto › Preferências de ponto.
                    </p>
                </div>
                {canConfigureNotification ? (
                    <NotificationSettingsCard />
                ) : (
                    <p className="text-sm text-base-content/55">
                        Você não tem permissão para visualizar estas preferências.
                    </p>
                )}
            </div>
        </div>
    );
}

export default OperationalPreferencesPage;
