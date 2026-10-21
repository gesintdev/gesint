"use client";

import clsx from "clsx";
import { User } from "lucide-react";

import { useStorageObjectUrl } from "@/shared/hooks/useStorageObjectUrl";

type ProfileAvatarProps = {
    name?: string;
    photoObjectId?: string | null;
    size?: "sm" | "md" | "lg" | "xl";
    shape?: "circle" | "squircle" | "rounded";
    /** Sem foto: ícone genérico (padrão) ou as iniciais do nome. */
    fallback?: "icon" | "initials";
    className?: string;
};

const SIZE_CLASS: Record<NonNullable<ProfileAvatarProps["size"]>, string> = {
    sm: "h-[1.75rem] w-[1.75rem]",
    md: "h-9 w-9",
    lg: "h-12 w-12",
    xl: "h-[200px] w-[200px]",
};
const ICON_CLASS: Record<NonNullable<ProfileAvatarProps["size"]>, string> = {
    sm: "size-3.5",
    md: "size-4",
    lg: "size-6",
    xl: "size-16",
};
const SHAPE_CLASS: Record<NonNullable<ProfileAvatarProps["shape"]>, string> = {
    circle: "rounded-full",
    squircle: "mask mask-squircle",
    rounded: "rounded-2xl",
};
const INITIALS_CLASS: Record<NonNullable<ProfileAvatarProps["size"]>, string> = {
    sm: "text-[9px]",
    md: "text-[11px]",
    lg: "text-sm",
    xl: "text-4xl",
};

function initialsOf(name: string): string {
    const parts = name
        .trim()
        .split(/\s+/)
        .filter((part) => part.length > 1);
    if (parts.length === 0) return name.trim().slice(0, 1).toUpperCase();
    const first = parts[0]!.slice(0, 1);
    const last = parts.length > 1 ? parts[parts.length - 1]!.slice(0, 1) : "";
    return (first + last).toUpperCase();
}

export function ProfileAvatar({
    name = "Usuário",
    photoObjectId,
    size = "md",
    shape = "circle",
    fallback = "icon",
    className,
}: ProfileAvatarProps) {
    const photoUrl = useStorageObjectUrl(photoObjectId);
    const sizeClass = SIZE_CLASS[size];
    const shapeClass = SHAPE_CLASS[shape];
    const iconClass = ICON_CLASS[size];

    if (photoUrl) {
        return (
            <div className={clsx("avatar shrink-0", className)}>
                <div className={clsx(shapeClass, sizeClass, "overflow-hidden bg-base-200")}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
                </div>
            </div>
        );
    }

    if (fallback === "initials") {
        return (
            <span
                className={clsx(
                    "flex shrink-0 items-center justify-center border border-base-300 bg-base-200 font-semibold text-base-content/60",
                    INITIALS_CLASS[size],
                    shapeClass,
                    sizeClass,
                    className,
                )}
                aria-hidden
            >
                {initialsOf(name)}
            </span>
        );
    }

    return (
        <span
            className={clsx(
                "flex shrink-0 items-center justify-center bg-base-200 text-base-content/28",
                shapeClass,
                sizeClass,
                className,
            )}
            aria-hidden
        >
            <User className={iconClass} strokeWidth={1.75} />
        </span>
    );
}
