"use client";

import clsx from "clsx";
import { AlertTriangle } from "lucide-react";

import { CareersImageField } from "@/modules/careers/admin/components/CareersImageField";
import type { CareersPageTheme } from "@/modules/careers/admin/dto/careers-page.dto";
import { CAREERS_COLOR_PRESETS } from "@/modules/careers/admin/lib/careers-editor";
import type { CareersCornerStyle, CareersFontStyle } from "@/modules/careers/shared/dto/careers.dto";
import { CAREERS_SOCIAL_NETWORKS } from "@/modules/careers/shared/lib/careers-labels";
import {
    CAREERS_CORNER_STYLE_OPTIONS,
    CAREERS_FONT_STYLE_OPTIONS,
    contrastRatio,
} from "@/modules/careers/shared/lib/careers-theme";
import { InputCheckbox, InputColor, InputSelect, InputString } from "@/shared/components/ui/input/index";

type CareersThemePanelProps = {
    theme: CareersPageTheme;
    organizationName: string;
    disabled?: boolean;
    onChange: (patch: Partial<CareersPageTheme>) => void;
};

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="grid gap-3">
            <h3 className="text-sm font-semibold text-base-content">{title}</h3>
            {children}
        </section>
    );
}

function ContrastWarning({ color }: { color?: string | null }) {
    if (!color || contrastRatio(color) >= 4.5) return null;
    return (
        <p className="flex items-center gap-1.5 text-xs text-base-content/70">
            <AlertTriangle className="size-3.5 text-warning" strokeWidth={2} />
            Contraste baixo com o texto — pode dificultar a leitura.
        </p>
    );
}

export function CareersThemePanel({ theme, organizationName, disabled, onChange }: CareersThemePanelProps) {
    return (
        <div className="grid gap-6">
            <PanelSection title="Identidade">
                <InputString
                    label="Nome exibido"
                    hint={`Vazio: usa "${organizationName}".`}
                    value={theme.displayName ?? ""}
                    maxLength={200}
                    disabled={disabled}
                    onValueChange={(value) => onChange({ displayName: value })}
                />
                <CareersImageField
                    label="Logomarca (opcional)"
                    hint="PNG ou SVG convertido em PNG, fundo transparente, até 5 MB."
                    value={theme.logoObjectId}
                    fit="contain"
                    disabled={disabled}
                    onChange={(objectId) => onChange({ logoObjectId: objectId || null })}
                />
            </PanelSection>

            <PanelSection title="Cores">
                <div className="flex flex-wrap gap-2">
                    {CAREERS_COLOR_PRESETS.map((preset) => {
                        const active =
                            (theme.primaryColor ?? "") === preset.primary && (theme.accentColor ?? "") === preset.accent;
                        return (
                            <button
                                key={preset.label}
                                type="button"
                                disabled={disabled}
                                onClick={() => onChange({ primaryColor: preset.primary, accentColor: preset.accent })}
                                className={clsx(
                                    "flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium",
                                    active
                                        ? "border-primary bg-primary/5 text-base-content"
                                        : "border-(--gommo-border-subtle) text-base-content/70 hover:bg-base-200",
                                )}
                            >
                                <span
                                    className="size-3.5 rounded-full border border-base-content/10"
                                    style={{ background: preset.primary || "var(--gommo-primary)" }}
                                />
                                {preset.label}
                            </button>
                        );
                    })}
                </div>
                <InputColor
                    label="Cor principal"
                    hint="Capa, botões e destaques. Vazio: azul do Gesint."
                    value={theme.primaryColor ?? ""}
                    disabled={disabled}
                    onValueChange={(value) => onChange({ primaryColor: value })}
                />
                <ContrastWarning color={theme.primaryColor} />
                <InputColor
                    label="Cor de apoio"
                    hint="Usada em detalhes e selos."
                    value={theme.accentColor ?? ""}
                    disabled={disabled}
                    onValueChange={(value) => onChange({ accentColor: value })}
                />
            </PanelSection>

            <PanelSection title="Estilo">
                <InputSelect
                    label="Tipografia"
                    items={CAREERS_FONT_STYLE_OPTIONS}
                    value={theme.fontStyle ?? "MODERN"}
                    disabled={disabled}
                    onValueChange={(value) => onChange({ fontStyle: value as CareersFontStyle })}
                />
                <InputSelect
                    label="Cantos"
                    items={CAREERS_CORNER_STYLE_OPTIONS}
                    value={theme.cornerStyle ?? "ROUNDED"}
                    disabled={disabled}
                    onValueChange={(value) => onChange({ cornerStyle: value as CareersCornerStyle })}
                />
                <InputCheckbox
                    size="sm"
                    checked={theme.showSalary}
                    disabled={disabled}
                    onCheckedChange={(checked) => onChange({ showSalary: checked })}
                    label="Mostrar faixa salarial nas vagas (quando cadastrada)"
                    labelClassName="text-[13px] text-base-content/80"
                />
            </PanelSection>

            <PanelSection title="Redes sociais">
                {CAREERS_SOCIAL_NETWORKS.map((network) => (
                    <InputString
                        key={network.value}
                        label={network.label}
                        placeholder={network.placeholder}
                        value={theme.socialLinks[network.value] ?? ""}
                        disabled={disabled}
                        onValueChange={(value) =>
                            onChange({ socialLinks: { ...theme.socialLinks, [network.value]: value } })
                        }
                    />
                ))}
            </PanelSection>
        </div>
    );
}
