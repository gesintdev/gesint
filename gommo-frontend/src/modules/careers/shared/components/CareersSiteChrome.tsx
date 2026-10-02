"use client";

import clsx from "clsx";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { CareersBranding } from "@/modules/careers/shared/dto/careers.dto";
import { careersAssetUrl } from "@/modules/careers/shared/lib/careers-assets";
import { isSafeHttpUrl } from "@/modules/careers/shared/lib/careers-format";
import { CAREERS_SOCIAL_NETWORKS } from "@/modules/careers/shared/lib/careers-labels";
import { careersThemeStyle } from "@/modules/careers/shared/lib/careers-theme";
import { SystemLogo } from "@/shared/components/brand/SystemLogo";

/** Contêiner com o tema do cliente. `@container` faz o preview mobile do editor responder à largura. */
export function CareersThemeScope({
    branding,
    className,
    children,
}: {
    branding?: Partial<CareersBranding> | null;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={clsx("@container bg-base-200 text-base-content", className)} style={careersThemeStyle(branding)}>
            {children}
        </div>
    );
}

export function careersDisplayName(branding: Partial<CareersBranding> | null | undefined, organizationName: string) {
    return branding?.displayName?.trim() || organizationName?.trim() || "Carreiras";
}

export function CareersSiteHeader({
    branding,
    organizationName,
    preview,
    actions,
}: {
    branding?: Partial<CareersBranding> | null;
    organizationName: string;
    preview?: boolean;
    actions?: ReactNode;
}) {
    const name = careersDisplayName(branding, organizationName);
    const logo = careersAssetUrl(branding?.logoObjectId);
    const brand = (
        <span className="flex min-w-0 items-center gap-2.5">
            {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt={name} className="h-8 max-w-[160px] object-contain" />
            ) : (
                <SystemLogo size="1.75rem" title={name} />
            )}
            <span className="truncate text-sm font-semibold text-base-content">{name}</span>
            <span className="hidden text-sm text-base-content/45 @md:inline">· Carreiras</span>
        </span>
    );

    return (
        <header
            className={clsx(
                "z-20 flex h-14 items-center justify-between gap-3 border-b border-base-content/10 bg-base-100 px-5 @md:px-8",
                !preview && "sticky top-0",
            )}
        >
            {preview ? brand : <Link href="/careers">{brand}</Link>}
            <div className="flex items-center gap-2">{actions}</div>
        </header>
    );
}

export function CareersSiteFooter({
    branding,
    organizationName,
}: {
    branding?: Partial<CareersBranding> | null;
    organizationName: string;
}) {
    const name = careersDisplayName(branding, organizationName);
    const links = CAREERS_SOCIAL_NETWORKS.map((network) => ({
        ...network,
        url: branding?.socialLinks?.[network.value],
    })).filter((item) => isSafeHttpUrl(item.url));

    return (
        <footer className="border-t border-base-content/10 bg-base-100 px-5 py-8 @md:px-10">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 @md:flex-row @md:items-center @md:justify-between">
                <p className="text-xs text-base-content/50">
                    © {new Date().getFullYear()} {name}. Recrutamento com Gesint.
                </p>
                {links.length > 0 ? (
                    <nav aria-label="Redes sociais" className="flex flex-wrap gap-x-4 gap-y-2">
                        {links.map((link) => (
                            <a
                                key={link.value}
                                href={link.url!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-base-content/60 hover:text-primary"
                            >
                                {link.label}
                                <ExternalLink className="size-3" strokeWidth={2} />
                            </a>
                        ))}
                    </nav>
                ) : null}
            </div>
        </footer>
    );
}
