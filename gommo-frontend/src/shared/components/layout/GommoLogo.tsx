import clsx from "clsx";
import Image from "next/image";

type GommoLogoProps = {
    /** Logo completo (sidebar expandido) ou apenas ícone (sidebar recolhido). */
    variant?: "full" | "icon";
    className?: string;
    iconClassName?: string;
    /** Sobre fundo brand (ex.: login). */
    onBrand?: boolean;
};

export function GommoLogo({ variant = "full", className, iconClassName, onBrand = false }: GommoLogoProps) {
    if (variant === "icon") {
        return (
            <Image
                src="/brand/gommo-logo-icon.png"
                alt="Gommo"
                width={32}
                height={32}
                className={clsx("h-8 w-8 shrink-0 rounded-lg object-contain", iconClassName, className)}
            />
        );
    }

    return (
        <Image
            src="/brand/gommo-logo-full.png"
            alt="Gommo"
            width={onBrand ? 180 : 160}
            height={onBrand ? 48 : 44}
            priority={!onBrand}
            className={clsx(
                onBrand
                    ? "gommo-logo-on-brand h-9 w-auto max-w-[180px] shrink-0 object-contain object-left"
                    : "h-9 w-auto max-w-[160px] shrink-0 object-contain object-left",
                className,
            )}
        />
    );
}
