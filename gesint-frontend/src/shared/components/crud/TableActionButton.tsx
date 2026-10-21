"use client";

import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/shared/components/ui/Button";

export type TableActionVariant = "open" | "edit" | "delete" | "download";

const VARIANT_CLASS: Record<TableActionVariant, string> = {
    open: "gesint-table-action--open",
    edit: "gesint-table-action--edit",
    delete: "gesint-table-action--delete",
    download: "gesint-table-action--download",
};

type TableActionButtonProps = Omit<ComponentProps<typeof Button>, "variant" | "size"> & {
    actionVariant: TableActionVariant;
    leftIcon: ReactNode;
};

export function TableActionButton({ actionVariant, className, leftIcon, ...props }: TableActionButtonProps) {
    return (
        <Button
            variant="ghost"
            size="sm"
            className={clsx(
                "gesint-table-action-button",
                VARIANT_CLASS[actionVariant],
                className,
            )}
            {...props}
        >
            {leftIcon}
        </Button>
    );
}

