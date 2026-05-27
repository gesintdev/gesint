"use client";

import {SquareArrowOutUpRight} from "lucide-react";
import {Button} from "@/shared/components/ui/Button";
import {useOpenWorkspaceRecordTab} from "@/shared/workspace/useOpenWorkspaceRecordTab";

type OpenInWorkspaceTabButtonProps<T extends {id: string}> = {
    row: T;
    size?: "sm" | "md";
};

export function OpenInWorkspaceTabButton<T extends {id: string}>({
    row,
    size = "sm",
}: OpenInWorkspaceTabButtonProps<T>) {
    const openInNewTab = useOpenWorkspaceRecordTab();

    return (
        <Button
            variant="ghost"
            size={size}
            aria-label="Abrir em nova aba"
            title="Abrir em nova aba"
            leftIcon={<SquareArrowOutUpRight className="size-3.5" strokeWidth={2}/>}
            onClick={(e) => {
                e.stopPropagation();
                openInNewTab(row);
            }}
        />
    );
}
