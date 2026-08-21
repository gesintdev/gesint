"use client";

import { cn } from "@/shared/lib/cn";

type GommoLogoProps = {
    variant?: "mark" | "full";
    className?: string;
    markSize?: number;
};

export function GommoLogo({ variant = "mark", className, markSize = 28 }: GommoLogoProps) {
    if (variant === "full") {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src="/brand/gommo-logo-blue.svg"
                alt="Gesint"
                width={120}
                height={28}
                className={cn("h-7 w-auto", className)}
            />
        );
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src="/brand/logo-gesint-letterb-blue.svg"
            alt="Gesint"
            width={markSize}
            height={markSize}
            className={cn("shrink-0", className)}
            style={{ width: markSize, height: markSize }}
        />
    );
}
