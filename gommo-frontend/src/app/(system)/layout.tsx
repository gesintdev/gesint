import {SystemShell} from "@/shared/components/layout/SystemShell";
import {WorkspaceShell} from "@/shared/components/workspace/WorkspaceShell";

export default function SystemLayout() {
    return (
        <SystemShell>
            <WorkspaceShell/>
        </SystemShell>
    );
}
