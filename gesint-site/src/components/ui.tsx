import Image from "next/image";
import {SmartLink} from "@/components/SmartLink";
import type {ComponentProps, ReactNode} from "react";

/** Largura útil do Figma: 1264px com 88px de margem em 1440px. */
export function Container({className = "", children}: {className?: string; children: ReactNode}) {
    return (
        <div className={`px-5 md:px-10 xl:px-[88px] ${className}`}>
            <div className="mx-auto w-full max-w-[1264px]">{children}</div>
        </div>
    );
}

/** Logo oficial (símbolo + "gesint"), o mesmo arquivo de `gesint-frontend/public/brand`. A altura vem do className. */
export function Logo({className = ""}: {className?: string}) {
    return (
        <Image
            src="/brand/gesint-logo-blue.svg"
            alt="Gesint"
            width={307}
            height={100}
            preload
            className={`w-auto ${className}`}
        />
    );
}

export function Divider({className = ""}: {className?: string}) {
    return <div aria-hidden className={`h-px bg-line ${className}`}/>;
}

export function Eyebrow({className = "", children}: {className?: string; children: ReactNode}) {
    return <p className={`text-[12px] font-medium text-muted ${className}`}>{children}</p>;
}

/** Título de seção (48px Light no desktop). */
export function SectionTitle({className = "", children}: {className?: string; children: ReactNode}) {
    return (
        <h2
            className={`text-[32px] font-light leading-[1.15] tracking-[-0.031em] text-ink md:text-[42px] lg:text-[48px] ${className}`}
        >
            {children}
        </h2>
    );
}

/** Quebra de linha do Figma: só vale em telas largas; abaixo disso o texto quebra sozinho. */
export function Br() {
    return <br className="hidden xl:inline"/>;
}

const buttonBase =
    "inline-flex h-[50px] items-center whitespace-pre rounded-[5px] px-5 text-[15px] font-medium transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60";

const buttonVariants = {
    primary: "bg-brand text-white hover:bg-brand-hover",
    /** Contorno fino, para a ação secundária ao lado da principal. */
    outline: "border border-line bg-white text-ink hover:border-ink/30",
} as const;

type ButtonVariant = keyof typeof buttonVariants;

/** Botão que navega (rota interna ou âncora da home, via `SmartLink`). */
export function ButtonLink({
    className = "",
    variant = "primary",
    children,
    ...props
}: ComponentProps<typeof SmartLink> & {variant?: ButtonVariant}) {
    return (
        <SmartLink className={`${buttonBase} ${buttonVariants[variant]} ${className}`} {...props}>
            {children}
        </SmartLink>
    );
}

export function Button({className = "", variant = "primary", type = "button", ...props}: ComponentProps<"button"> & {variant?: ButtonVariant}) {
    return <button type={type} className={`${buttonBase} justify-center ${buttonVariants[variant]} ${className}`} {...props}/>;
}

/** Link de texto com seta (padrão "Fale com a Gesint ↗"). */
export function ArrowLink({href, children, className = ""}: {href: string; children: ReactNode; className?: string}) {
    return (
        <SmartLink href={href} className={`group/arrow inline-flex items-center gap-1.5 text-[15px] font-medium text-brand hover:text-brand-hover ${className}`}>
            {children}
            <span aria-hidden className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/arrow:-translate-y-0.5 group-hover/arrow:translate-x-0.5">
                ↗
            </span>
        </SmartLink>
    );
}

/** Cabeçalho de seção no padrão do site: rótulo em caixa alta, título leve e um apoio à direita no desktop. */
export function SectionHeader({
    eyebrow,
    title,
    aside,
    className = "",
}: {
    eyebrow: string;
    title: ReactNode;
    aside?: ReactNode;
    className?: string;
}) {
    return (
        <div className={`flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between ${className}`}>
            <div>
                <Eyebrow>{eyebrow}</Eyebrow>
                <SectionTitle className="mt-4 md:mt-[18px]">{title}</SectionTitle>
            </div>
            {aside && <div className="text-[16px] text-muted lg:mb-[15px] lg:w-[340px]">{aside}</div>}
        </div>
    );
}

/** Card branco padrão do site. */
export function Panel({className = "", children}: {className?: string; children: ReactNode}) {
    return <div className={`rounded-md bg-white ${className}`}>{children}</div>;
}

const badgeTones = {
    success: "bg-success-bg text-success-fg",
    warning: "bg-warning-bg text-warning-fg",
    info: "bg-info-bg text-info-fg",
    neutral: "bg-surface text-muted",
} as const;

export function StatusBadge({
    tone,
    className = "",
    children,
}: {
    tone: keyof typeof badgeTones;
    className?: string;
    children: ReactNode;
}) {
    return <span className={`inline-flex items-center rounded font-medium ${badgeTones[tone]} ${className}`}>{children}</span>;
}
