"use client";

export function AdminTabBar({
    tabs,
    active,
    onSelect,
}: {
    tabs: { key: string; label: string }[];
    active: string;
    onSelect: (key: string) => void;
}) {
    return (
        <div className="flex border-b border-[var(--ga-border)] bg-[var(--ga-surface)]">
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
    );
}

export function AdminSubTabBar({
    tabs,
    active,
    onSelect,
}: {
    tabs: { key: string; label: string }[];
    active: string;
    onSelect: (key: string) => void;
}) {
    return (
        <div className="mb-5 flex border-b border-[var(--ga-border)]">
            {tabs.map((tab) => {
                const isActive = active === tab.key;
                return (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onSelect(tab.key)}
                        style={{
                            padding: "7px 14px",
                            border: "none",
                            cursor: "pointer",
                            background: isActive ? "var(--ga-surface-2)" : "transparent",
                            fontSize: 12,
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? "var(--ga-text)" : "var(--ga-text-muted)",
                            borderBottom: isActive
                                ? "2px solid var(--ga-primary)"
                                : "2px solid transparent",
                            borderRadius: "var(--ga-radius-sm) var(--ga-radius-sm) 0 0",
                            marginBottom: -1,
                        }}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
