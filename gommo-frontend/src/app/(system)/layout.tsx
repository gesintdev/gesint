import { cookies } from "next/headers";

import { SystemEnumHelper } from "@/modules/root/enum/SystemEnum";
import { SystemShell } from "@/shared/components/layout/SystemShell";
import { WorkspaceShell } from "@/shared/components/workspace/WorkspaceShell";
import { parseSettingsModeCookie } from "@/shared/lib/active-system-preferences";
import { ACTIVE_BRANCH_COOKIE_KEY } from "@/shared/lib/branch";

export default async function SystemLayout() {
    const cookieStore = await cookies();
    const initialStoredSystem = SystemEnumHelper.parseStoredSystemCookie(cookieStore.get("gommo-active-system")?.value);
    const initialSettingsMode = parseSettingsModeCookie(cookieStore.get("gommo-settings-mode")?.value);
    const initialBranchId = cookieStore.get(ACTIVE_BRANCH_COOKIE_KEY)?.value ?? null;

    return (
        <SystemShell initialStoredSystem={initialStoredSystem}
                     initialSettingsMode={initialSettingsMode}
                     initialBranchId={initialBranchId}>
            <WorkspaceShell />
        </SystemShell>
    );
}
