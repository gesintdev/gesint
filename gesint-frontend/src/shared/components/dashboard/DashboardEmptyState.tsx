import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

/**
 * Estado vazio do dashboard. `tone="success"` comunica "está em dia" (nada a fazer), diferente de
 * "ainda não há dados".
 */
export function DashboardEmptyState({
    icon: Icon = Inbox,
    message,
    tone,
}: {
    icon?: LucideIcon;
    message: string;
    tone?: "success" | "error";
}) {
    return (
        <div className="gesint-dash-empty">
            <span className="gesint-dash-empty__icon" data-tone={tone}>
                <Icon className="size-4" strokeWidth={2} />
            </span>
            <p>{message}</p>
        </div>
    );
}
