"use client";

import { CircleHelp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function AdminHelpTip({
    tooltip,
    href,
}: {
    tooltip: string;
    href: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <span
            style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={tooltip}
                aria-label={tooltip}
                style={{
                    display: "inline-flex",
                    color: "var(--ga-text-muted)",
                    padding: 2,
                    borderRadius: "var(--ga-radius-sm)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <CircleHelp size={14} />
            </Link>
            {open ? (
                <span
                    role="tooltip"
                    style={{
                        position: "absolute",
                        bottom: "calc(100% + 8px)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 240,
                        padding: "8px 10px",
                        borderRadius: "var(--ga-radius-sm)",
                        border: "1px solid var(--ga-border)",
                        background: "var(--ga-surface)",
                        color: "var(--ga-text)",
                        fontSize: 11,
                        lineHeight: 1.4,
                        boxShadow: "var(--ga-shadow)",
                        zIndex: 20,
                        pointerEvents: "none",
                    }}
                >
                    {tooltip}
                </span>
            ) : null}
        </span>
    );
}
