import {Suspense} from "react";
import {SystemShell} from "@/shared/components/layout/SystemShell";
import {WorkspaceShell} from "@/shared/components/workspace/WorkspaceShell";

export default function SystemLayout() {
    return (
        <SystemShell>
            <Suspense
                fallback={
                    <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-base-content/50">
                        Carregando…
                    </div>
                }
            >
                <WorkspaceShell/>
            </Suspense>
        </SystemShell>
    );
}
