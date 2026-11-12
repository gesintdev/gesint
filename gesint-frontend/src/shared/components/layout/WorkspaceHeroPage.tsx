"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

import { WorkspacePage } from "@/shared/components/layout/WorkspacePage";

type WorkspaceHeroPageProps = {
    title: string;
    subtitle: ReactNode;
    icon: ReactNode;
    /** Ilustração à direita do hero. Some em telas estreitas. */
    art?: ReactNode;
    children: ReactNode;
    className?: string;
    innerClassName?: string;
    headingId?: string;
};

type WorkspaceHeroArtProps = {
    icon: ReactNode;
    badge: ReactNode;
};

export function WorkspaceHeroArt({ icon, badge }: WorkspaceHeroArtProps) {
    return (
        <>
            <div className="gesint-hero-page__sheet">
                <span />
                <span />
                <span />
                {icon}
            </div>
            <span className="gesint-hero-page__badge">{badge}</span>
        </>
    );
}

export function WorkspaceHeroPage({
    title,
    subtitle,
    icon,
    art,
    children,
    className,
    innerClassName,
    headingId,
}: WorkspaceHeroPageProps) {
    return (
        <WorkspacePage>
            <main className={clsx("gesint-hero-page", className)}>
                <div className={clsx("gesint-hero-page__inner", innerClassName)}>
                    <header className="gesint-hero-page__hero">
                        <div className="gesint-hero-page__content">
                            <span className="gesint-hero-page__icon" aria-hidden="true">
                                {icon}
                            </span>
                            <div>
                                <h1 id={headingId} className="gesint-hero-page__title">
                                    {title}
                                </h1>
                                <p className="gesint-hero-page__subtitle">{subtitle}</p>
                            </div>
                        </div>
                        {art ? (
                            <div className="gesint-hero-page__art" aria-hidden="true">
                                {art}
                            </div>
                        ) : null}
                    </header>
                    {children}
                </div>
            </main>
        </WorkspacePage>
    );
}
