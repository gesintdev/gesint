"use client";

import clsx from "clsx";

import { SystemLogo } from "@/shared/components/brand/SystemLogo";
import { useClientDisplayName } from "@/shared/hooks/useClientDisplayName";

type GesintLogoProps = {
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

export function GesintLogo({
    collapsed,
    variant = "full",
    className,
    iconClassName,
    onBrand = false,
    clientName,
}: GesintLogoProps) {
    const resolvedName = useClientDisplayName();
    const isCollapsed = collapsed ?? variant === "icon";
    const displayName = (clientName ?? resolvedName)?.trim() || null;
    const showName = Boolean(displayName) && !isCollapsed;

    return (
        <div
            className={clsx(
                "gesint-logo",
                !onBrand && "gesint-logo--shell",
                isCollapsed && "gesint-logo--collapsed",
                !displayName && "gesint-logo--icon-only",
                onBrand && "gesint-logo--on-brand",
                iconClassName,
                className,
            )}
            aria-label={displayName ? `Gesint — ${displayName}` : "Gesint"}
            role="img"
        >
            <span className="gesint-logo__icon-slot">
                {/* size espelha o height de .gesint-logo__icon — o posicionamento segue vindo do CSS. */}
                <SystemLogo variant="monogram" size="1.5rem" className="gesint-logo__icon" />
            </span>
            <span className={clsx("gesint-logo__name", !showName && "gesint-logo__name--hidden")} aria-hidden={!showName}>
                {displayName ? (
                    <>
                        <span className="gesint-logo__divider" aria-hidden="true" />
                        <span className="gesint-logo__client">{displayName}</span>
                    </>
                ) : null}
            </span>
        </div>
    );
}
