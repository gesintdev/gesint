import Image from "next/image";
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

export function ButtonLink({className = "", children, ...props}: ComponentProps<"a">) {
    return (
        <a
            className={`inline-flex h-[50px] items-center whitespace-pre rounded-[5px] bg-brand px-5 text-[15px] font-medium text-white transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${className}`}
            {...props}
        >
            {children}
        </a>
    );
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
