"use client";

import clsx from "clsx";
import { User } from "lucide-react";
import { useStorageObjectUrl } from "@/shared/hooks/useStorageObjectUrl";

type ProfileAvatarProps = {
    name?: string;
    photoObjectId?: string | null;
    size?: "sm" | "md" | "lg" | "xl";
    shape?: "circle" | "squircle" | "rounded";
    className?: string;
};

const SIZE_CLASS: Record<NonNullable<ProfileAvatarProps["size"]>, string> = {
    sm: "h-7 w-7",
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

export function ProfileAvatar({
    name = "Usuário",
    photoObjectId,
    size = "md",
    shape = "circle",
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
