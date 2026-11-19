"use client";

import {AssistantWorkspaceView} from "@/shared/components/assistant/AssistantWorkspaceView";

export function AssistantWorkspacePage() {
    return (
        <div className="flex h-full min-h-0 flex-col bg-base-100">
            <AssistantWorkspaceView/>
        </div>
    );
}

export default AssistantWorkspacePage;
