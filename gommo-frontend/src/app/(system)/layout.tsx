import { cookies } from "next/headers";
import { SystemShell } from "@/shared/components/layout/SystemShell";
import { WorkspaceShell } from "@/shared/components/workspace/WorkspaceShell";
import { SystemEnumHelper } from "@/modules/root/enum/SystemEnum";

export default async function SystemLayout() {
    const cookieStore = await cookies();
    const initialStoredSystem = SystemEnumHelper.parseStoredSystemCookie(
        cookieStore.get("gommo-active-system")?.value,
    );

    return (
        <SystemShell initialStoredSystem={initialStoredSystem}>
            <WorkspaceShell />
        </SystemShell>
    );
}
