"use client";
import { SquareArrowOutUpRight } from "lucide-react";
import { TableActionButton } from "@/shared/components/crud/TableActionButton";
import { useOpenWorkspaceRecordTab } from "@/shared/workspace/useOpenWorkspaceRecordTab";

type OpenInWorkspaceTabButtonProps<T extends { id: string }> = {
    row: T;
};

export function OpenInWorkspaceTabButton<T extends { id: string }>({ row }: OpenInWorkspaceTabButtonProps<T>) {
    const openInNewTab = useOpenWorkspaceRecordTab();

    return (
        <TableActionButton
            actionVariant="open"
            aria-label="Abrir em nova aba"
            title="Abrir em nova aba"
            leftIcon={<SquareArrowOutUpRight className="size-3.5" strokeWidth={2} />}
            onClick={(e) => {
                e.stopPropagation();
                openInNewTab(row);
            }}
        />
    );
}
