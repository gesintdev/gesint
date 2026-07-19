"use client";

import type { ReactNode } from "react";

export function AdminModuleToolbar({
    tabs,
    active,
    onSelect,
    actions,
}: {
    tabs: { key: string; label: string }[];
    active: string;
    onSelect: (key: string) => void;
    actions?: ReactNode;
}) {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                background: "var(--ga-surface)",
                borderBottom: "1px solid var(--ga-border)",
                paddingRight: 20,
            }}
        >
            <div style={{ display: "flex", alignItems: "stretch", minWidth: 0 }}>
                {tabs.map((tab) => {
                    const isActive = active === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => onSelect(tab.key)}
                            style={{
                                padding: "10px 18px",
                                border: "none",
                                cursor: "pointer",
                                background: "transparent",
                                fontSize: 13,
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? "var(--ga-primary)" : "var(--ga-text-muted)",
                                borderBottom: isActive
                                    ? "2px solid var(--ga-primary)"
                                    : "2px solid transparent",
                                marginBottom: -1,
                            }}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {actions ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {actions}
                </div>
            ) : null}
        </div>
    );
}
