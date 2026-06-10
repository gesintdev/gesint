"use client";
import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/shared/components/ui/Button";
import clsx from "clsx";

export type TableActionVariant = "open" | "edit" | "delete" | "download";

const VARIANT_CLASS: Record<TableActionVariant, string> = {
    open: "gommo-table-action--open",
    edit: "gommo-table-action--edit",
    delete: "gommo-table-action--delete",
    download: "gommo-table-action--download",
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
            className={clsx(VARIANT_CLASS[actionVariant], className)}
            leftIcon={leftIcon}
            {...props}
        />
    );
}
