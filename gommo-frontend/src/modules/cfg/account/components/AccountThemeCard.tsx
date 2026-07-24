"use client";

import clsx from "clsx";
import {Monitor, Moon, Sun} from "lucide-react";
import {useTheme} from "next-themes";
import {useEffect, useState} from "react";
import {toast} from "sonner";

import {Card} from "@/shared/components/ui/Card";
import {
    nextThemeToPreference,
    persistThemePreference,
    type ThemePreference,
} from "@/shared/lib/theme-preference";

const THEME_OPTIONS: Array<{
    value: ThemePreference;
    label: string;
    description: string;
    icon: typeof Sun;
}> = [
    {
        value: "light",
        label: "Claro",
        description: "Tema claro padrão do Gommo",
        icon: Sun,
    },
    {
        value: "dark",
        label: "Escuro",
        description: "Ideal para ambientes com pouca luz",
        icon: Moon,
    },
    {
        value: "system",
        label: "Dispositivo",
        description: "Segue o tema do sistema operacional",
        icon: Monitor,
    },
];

export function AccountThemeCard() {
    const {theme, setTheme} = useTheme();
    const [mounted, setMounted] = useState(false);
    const [selected, setSelected] = useState<ThemePreference>("light");

    useEffect(() => {
        setMounted(true);
        setSelected(nextThemeToPreference(theme));
    }, [theme]);

    const handleSelect = (preference: ThemePreference) => {
        setSelected(preference);
        persistThemePreference(preference, setTheme);
        toast.success("Tema padrão atualizado");
    };

    return (
        <Card animate={false} title="Tema" subtitle="Escolha o tema padrão da sua conta">
            <div className="grid gap-2.5 sm:grid-cols-3">
                {THEME_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const active = mounted && selected === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option.value)}
                            className={clsx(
                                "flex flex-col items-start gap-2 rounded-xl border px-3.5 py-3.5 text-left transition-colors",
                                active
                                    ? "border-primary/35 bg-primary/8"
                                    : "border-base-content/10 bg-base-200/40 hover:border-base-content/18 hover:bg-base-200/70 dark:bg-base-300/25",
                            )}
                        >
                            <span
                                className={clsx(
                                    "flex size-8 items-center justify-center rounded-lg",
                                    active ? "bg-primary/15 text-primary" : "bg-base-content/6 text-base-content/55",
                                )}
                            >
                                <Icon className="size-4" strokeWidth={2} />
                            </span>
                            <span>
                                <span className="block text-sm font-semibold text-base-content">{option.label}</span>
                                <span className="mt-0.5 block text-[11px] leading-snug text-base-content/50">
                                    {option.description}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </Card>
    );
}
