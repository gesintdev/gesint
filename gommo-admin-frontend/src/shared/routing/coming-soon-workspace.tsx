"use client";

import type { ComponentType } from "react";

import { ComingSoonView } from "@/shared/workspace/views/ComingSoonView";

export function createComingSoonWorkspacePage(title: string, description: string): ComponentType {
    return function ComingSoonWorkspacePage() {
        return <ComingSoonView title={title} description={description} />;
    };
}
