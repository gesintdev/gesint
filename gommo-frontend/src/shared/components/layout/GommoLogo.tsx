"use client";

import clsx from "clsx";

import { SystemLogo } from "@/shared/components/brand/SystemLogo";
import { useClientDisplayName } from "@/shared/hooks/useClientDisplayName";

type GommoLogoProps = {
    /** Sidebar recolhido: só o ícone. Expandido: ícone + nome do cliente. */
    collapsed?: boolean;
    /**
     * @deprecated Prefira `collapsed`. `icon` ≈ collapsed; `full` ≈ expandido.
     */
    variant?: "full" | "icon";
    className?: string;
    iconClassName?: string;
    /** Sobre fundo brand (ex.: login). */
    onBrand?: boolean;
    /** Sobrescreve o nome resolvido da sessão/URL. */
    clientName?: string | null;
};

export function GommoLogo({
    collapsed,
    variant = "full",
    className,
    iconClassName,
    onBrand = false,
    clientName,
}: GommoLogoProps) {
    const resolvedName = useClientDisplayName();
    const isCollapsed = collapsed ?? variant === "icon";
    const displayName = (clientName ?? resolvedName)?.trim() || null;
    const showName = Boolean(displayName) && !isCollapsed;

    return (
        <div
            className={clsx(
                "gommo-logo",
                !onBrand && "gommo-logo--shell",
                isCollapsed && "gommo-logo--collapsed",
                !displayName && "gommo-logo--icon-only",
                onBrand && "gommo-logo--on-brand",
                iconClassName,
                className,
            )}
            aria-label={displayName ? `Gommo — ${displayName}` : "Gommo"}
            role="img"
        >
            <span className="gommo-logo__icon-slot">
                {/* size espelha o height de .gommo-logo__icon — o posicionamento segue vindo do CSS. */}
                <SystemLogo variant="monogram" size="1.5rem" className="gommo-logo__icon" />
            </span>
            <span className={clsx("gommo-logo__name", !showName && "gommo-logo__name--hidden")} aria-hidden={!showName}>
                {displayName ? (
                    <>
                        <span className="gommo-logo__divider" aria-hidden="true" />
                        <span className="gommo-logo__client">{displayName}</span>
                    </>
                ) : null}
            </span>
        </div>
    );
}
