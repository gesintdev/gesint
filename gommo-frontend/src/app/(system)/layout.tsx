import { cookies } from "next/headers";
import { SystemShell } from "@/shared/components/layout/SystemShell";
import { WorkspaceShell } from "@/shared/components/workspace/WorkspaceShell";
import { parseSettingsModeCookie } from "@/shared/lib/active-system-preferences";
import { SystemEnumHelper } from "@/modules/root/enum/SystemEnum";

export default async function SystemLayout() {
    const cookieStore = await cookies();
    const initialStoredSystem = SystemEnumHelper.parseStoredSystemCookie(
        cookieStore.get("gommo-active-system")?.value,
    );
    const initialSettingsMode = parseSettingsModeCookie(cookieStore.get("gommo-settings-mode")?.value);

    return (
        <SystemShell initialStoredSystem={initialStoredSystem} initialSettingsMode={initialSettingsMode}>
            <WorkspaceShell />
        </SystemShell>
    );
}
