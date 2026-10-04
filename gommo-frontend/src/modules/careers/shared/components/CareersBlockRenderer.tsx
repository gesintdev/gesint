"use client";

import clsx from "clsx";
import { Check, ChevronDown, Quote } from "lucide-react";
import type { ReactNode } from "react";

import { CareersVacancyList } from "@/modules/careers/shared/components/CareersVacancyList";
import type {
    CareersBlock,
    CareersFaqItem,
    CareersItem,
    CareersPhoto,
    CareersStat,
    CareersTestimonial,
    CareersVacancySummary,
} from "@/modules/careers/shared/dto/careers.dto";
import { careersAssetUrl } from "@/modules/careers/shared/lib/careers-assets";
import { readBoolean, readList, readString } from "@/modules/careers/shared/lib/careers-blocks";
import { isSafeHttpUrl, toVideoEmbedUrl } from "@/modules/careers/shared/lib/careers-format";
import { MarkdownContent } from "@/shared/components/ui/MarkdownContent";

type CareersBlockRendererProps = {
    block: CareersBlock;
    organizationName: string;
    vacancies: CareersVacancySummary[];
    preview?: boolean;
    talentPoolVisible?: boolean;
};

function safeHref(url: string): string | null {
    const value = url.trim();
    if (value.startsWith("#")) return value;
    return isSafeHttpUrl(value) ? value : null;
}

function Section({
    id,
    title,
    subtitle,
    children,
    muted,
}: {
    id?: string;
    title?: string | null;
    subtitle?: string | null;
    children: ReactNode;
    muted?: boolean;
}) {
    return (
        <section id={id} className={clsx("scroll-mt-20 px-5 py-12 @md:px-10 @md:py-16", muted && "bg-base-200/60")}>
            <div className="mx-auto w-full max-w-5xl">
                {title || subtitle ? (
                    <header className="mb-8 max-w-2xl">
                        {title ? (
                            <h2 className="text-2xl font-semibold tracking-tight text-base-content @md:text-[28px]">
                                {title}
                            </h2>
                        ) : null}
                        {subtitle ? <p className="mt-2 text-[15px] leading-relaxed text-base-content/60">{subtitle}</p> : null}
                    </header>
                ) : null}
                {children}
            </div>
        </section>
    );
}

function ActionLink({ href, label, variant = "primary" }: { href: string | null; label: string; variant?: "primary" | "light" }) {
    if (!href || !label.trim()) return null;
    const external = !href.startsWith("#");
    return (
        <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className={clsx(
                "inline-flex h-11 items-center justify-center rounded-[var(--careers-radius)] px-6 text-sm font-semibold transition-opacity hover:opacity-90",
                variant === "primary" ? "bg-primary text-primary-content" : "bg-base-100 text-base-content",
            )}
        >
            {label}
        </a>
    );
}

function ItemsGrid({ items, icon }: { items: CareersItem[]; icon?: boolean }) {
    const visible = items.filter((item) => item.title?.trim());
    if (visible.length === 0) return null;
    return (
        <div className="grid gap-3 @md:grid-cols-2 @3xl:grid-cols-3">
            {visible.map((item, index) => (
                <div
                    key={`${item.title}-${index}`}
                    className="rounded-[var(--careers-radius)] border border-base-content/10 bg-base-100 p-5"
                >
                    <div className="flex items-start gap-3">
                        {icon ? (
                            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Check className="size-3.5" strokeWidth={2.5} />
                            </span>
                        ) : null}
                        <div className="min-w-0">
                            <p className="text-[15px] font-semibold text-base-content">{item.title}</p>
                            {item.description?.trim() ? (
                                <p className="mt-1 text-sm leading-relaxed text-base-content/60">{item.description}</p>
                            ) : null}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function CareersImage({ objectId, alt, className }: { objectId?: string | null; alt: string; className?: string }) {
    const src = careersAssetUrl(objectId);
    if (!src) return null;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" className={className} />;
}

function HeroBlock({ block, organizationName }: { block: CareersBlock; organizationName: string }) {
    const cover = careersAssetUrl(readString(block.content, "coverObjectId"));
    const highlight = readString(block.content, "highlight");
    const ctaLabel = readString(block.content, "ctaLabel") || "Ver vagas abertas";
    const centered = readString(block.content, "align") === "center";

    return (
        <section
            className={clsx(
                "relative overflow-hidden px-5 py-16 @md:px-10 @md:py-24",
                cover ? "text-white" : "bg-primary text-primary-content",
            )}
        >
            {cover ? (
                <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cover} alt="" className="absolute inset-0 size-full object-cover" />
                    <div className="absolute inset-0 bg-black/55" />
                </>
            ) : null}
            <div className={clsx("relative mx-auto w-full max-w-5xl", centered && "text-center")}>
                {highlight ? (
                    <span className="mb-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
                        {highlight}
                    </span>
                ) : null}
                <h1 className={clsx("max-w-3xl text-3xl font-bold tracking-tight @md:text-5xl", centered && "mx-auto")}>
                    {block.title?.trim() || `Trabalhe na ${organizationName}`}
                </h1>
                {block.subtitle ? (
                    <p className={clsx("mt-4 max-w-2xl text-base leading-relaxed opacity-85 @md:text-lg", centered && "mx-auto")}>
                        {block.subtitle}
                    </p>
                ) : null}
                <div className="mt-8">
                    <a
                        href="#vagas"
                        className="inline-flex h-11 items-center justify-center rounded-[var(--careers-radius)] bg-white px-6 text-sm font-semibold text-neutral-900 transition-opacity hover:opacity-90"
                    >
                        {ctaLabel}
                    </a>
                </div>
            </div>
        </section>
    );
}

function DayInLifeBlock({ block, preview }: { block: CareersBlock; preview?: boolean }) {
    const photos = readList<CareersPhoto>(block.content, "photos").filter((photo) => photo.objectId);
    const testimonials = readList<CareersTestimonial>(block.content, "testimonials").filter((item) => item.quote?.trim());
    const authorized = readBoolean(block.content, "imageUseAuthorized");
    if (photos.length === 0 && testimonials.length === 0) {
        return preview ? (
            <Section title={block.title} subtitle={block.subtitle}>
                <p className="text-sm text-base-content/50">Adicione fotos ou depoimentos para este bloco aparecer.</p>
            </Section>
        ) : null;
    }
    return (
        <Section title={block.title} subtitle={block.subtitle} muted>
            {preview && !authorized ? (
                <p className="mb-4 rounded-[var(--careers-radius)] bg-warning/20 px-3 py-2 text-[13px] text-base-content/80">
                    Falta confirmar a autorização de uso de imagem — sem ela a página não pode ser publicada.
                </p>
            ) : null}
            {photos.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2 @3xl:grid-cols-3">
                    {photos.map((photo) => (
                        <figure key={photo.objectId} className="overflow-hidden rounded-[var(--careers-radius)] bg-base-100">
                            <CareersImage objectId={photo.objectId} alt={photo.caption || ""} className="aspect-[4/3] w-full object-cover" />
                            {photo.caption ? (
                                <figcaption className="px-3 py-2 text-xs text-base-content/60">{photo.caption}</figcaption>
                            ) : null}
                        </figure>
                    ))}
                </div>
            ) : null}
            {testimonials.length > 0 ? (
                <div className={clsx("grid gap-3 @md:grid-cols-2", photos.length > 0 && "mt-6")}>
                    {testimonials.map((item, index) => (
                        <blockquote
                            key={`${item.name}-${index}`}
                            className="rounded-[var(--careers-radius)] border border-base-content/10 bg-base-100 p-5"
                        >
                            <Quote className="size-5 text-primary" strokeWidth={2} />
                            <p className="mt-3 text-[15px] leading-relaxed text-base-content/80">{item.quote}</p>
                            <footer className="mt-4 flex items-center gap-3">
                                {item.photoObjectId ? (
                                    <CareersImage
                                        objectId={item.photoObjectId}
                                        alt={item.name || ""}
                                        className="size-10 rounded-full object-cover"
                                    />
                                ) : null}
                                <div>
                                    {item.name ? <p className="text-sm font-semibold text-base-content">{item.name}</p> : null}
                                    {item.role ? <p className="text-xs text-base-content/55">{item.role}</p> : null}
                                </div>
                            </footer>
                        </blockquote>
                    ))}
                </div>
            ) : null}
        </Section>
    );
}

export function CareersBlockRenderer({
    block,
    organizationName,
    vacancies,
    preview,
    talentPoolVisible,
}: CareersBlockRendererProps) {
    const content = block.content ?? {};

    switch (block.type) {
        case "HERO":
            return <HeroBlock block={block} organizationName={organizationName} />;
        case "WHY_WORK_HERE":
            return (
                <Section title={block.title} subtitle={block.subtitle}>
                    {readString(content, "body") ? (
                        <MarkdownContent value={readString(content, "body")} className="mb-6 max-w-3xl text-[15px]" />
                    ) : null}
                    <ItemsGrid items={readList<CareersItem>(content, "items")} />
                </Section>
            );
        case "BENEFITS":
            return (
                <Section title={block.title} subtitle={block.subtitle} muted>
                    <ItemsGrid items={readList<CareersItem>(content, "items")} icon />
                </Section>
            );
        case "DAY_IN_LIFE":
            return <DayInLifeBlock block={block} preview={preview} />;
        case "OPEN_VACANCIES":
            return (
                <Section id="vagas" title={block.title} subtitle={block.subtitle}>
                    <CareersVacancyList
                        vacancies={vacancies}
                        showFilters={content.showFilters !== false}
                        preview={preview}
                        emptyHint={
                            talentPoolVisible
                                ? "Deixe seu currículo no banco de talentos logo abaixo."
                                : "Volte em breve — novas oportunidades aparecem aqui."
                        }
                    />
                </Section>
            );
        case "TALENT_POOL": {
            const href = safeHref(readString(content, "ctaUrl"));
            return (
                <section className="px-5 py-12 @md:px-10">
                    <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-5 rounded-[var(--careers-radius)] border border-base-content/10 bg-base-100 p-6 @md:flex-row @md:items-center @md:justify-between @md:p-8">
                        <div className="max-w-2xl">
                            <h2 className="text-xl font-semibold text-base-content">{block.title}</h2>
                            {block.subtitle ? (
                                <p className="mt-2 text-[15px] leading-relaxed text-base-content/60">{block.subtitle}</p>
                            ) : null}
                        </div>
                        <ActionLink href={href} label={readString(content, "ctaLabel") || "Quero participar"} />
                    </div>
                </section>
            );
        }
        case "TEXT":
            return (
                <Section title={block.title} subtitle={block.subtitle}>
                    <MarkdownContent value={readString(content, "body")} className="max-w-3xl text-[15px]" />
                </Section>
            );
        case "IMAGE_TEXT": {
            const imageRight = readString(content, "imagePosition") === "right";
            const imageId = readString(content, "imageObjectId");
            return (
                <Section>
                    <div className="grid items-center gap-8 @3xl:grid-cols-2">
                        <div className={clsx(imageRight && "@3xl:order-2")}>
                            {imageId ? (
                                <CareersImage
                                    objectId={imageId}
                                    alt={block.title || ""}
                                    className="aspect-[4/3] w-full rounded-[var(--careers-radius)] object-cover"
                                />
                            ) : (
                                <div className="aspect-[4/3] w-full rounded-[var(--careers-radius)] bg-base-200" />
                            )}
                        </div>
                        <div>
                            {block.title ? (
                                <h2 className="text-2xl font-semibold tracking-tight text-base-content">{block.title}</h2>
                            ) : null}
                            {block.subtitle ? <p className="mt-2 text-[15px] text-base-content/60">{block.subtitle}</p> : null}
                            <MarkdownContent value={readString(content, "body")} className="mt-4 text-[15px]" />
                        </div>
                    </div>
                </Section>
            );
        }
        case "STATS": {
            const stats = readList<CareersStat>(content, "items").filter((item) => item.value?.trim());
            if (stats.length === 0 && !preview) return null;
            return (
                <Section title={block.title} subtitle={block.subtitle} muted>
                    <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2 @3xl:grid-cols-4">
                        {stats.map((item, index) => (
                            <div key={`${item.label}-${index}`} className="rounded-[var(--careers-radius)] bg-base-100 p-5 text-center">
                                <p className="text-3xl font-bold text-primary">{item.value}</p>
                                <p className="mt-1 text-sm text-base-content/60">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </Section>
            );
        }
        case "FAQ": {
            const items = readList<CareersFaqItem>(content, "items").filter((item) => item.question?.trim());
            return (
                <Section title={block.title} subtitle={block.subtitle}>
                    <div className="grid max-w-3xl gap-2">
                        {items.map((item, index) => (
                            <details
                                key={`${item.question}-${index}`}
                                className="group rounded-[var(--careers-radius)] border border-base-content/10 bg-base-100 px-5 py-4"
                            >
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-medium text-base-content">
                                    {item.question}
                                    <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" strokeWidth={2} />
                                </summary>
                                {item.answer ? (
                                    <MarkdownContent value={item.answer} className="mt-3 text-sm text-base-content/70" />
                                ) : null}
                            </details>
                        ))}
                    </div>
                </Section>
            );
        }
        case "VIDEO": {
            const embed = toVideoEmbedUrl(readString(content, "url"));
            if (!embed && !preview) return null;
            return (
                <Section title={block.title} subtitle={block.subtitle}>
                    {embed ? (
                        <div className="aspect-video overflow-hidden rounded-[var(--careers-radius)] bg-black">
                            <iframe
                                src={embed}
                                title={block.title || "Vídeo"}
                                className="size-full border-0"
                                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    ) : (
                        <p className="text-sm text-base-content/50">Informe um link do YouTube ou Vimeo.</p>
                    )}
                </Section>
            );
        }
        case "CTA":
            return (
                <section className="px-5 py-12 @md:px-10">
                    <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-5 rounded-[var(--careers-radius)] bg-primary p-8 text-primary-content @md:flex-row @md:items-center @md:justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold">{block.title}</h2>
                            {block.subtitle ? <p className="mt-2 text-[15px] opacity-85">{block.subtitle}</p> : null}
                        </div>
                        <ActionLink
                            href={safeHref(readString(content, "buttonUrl"))}
                            label={readString(content, "buttonLabel")}
                            variant="light"
                        />
                    </div>
                </section>
            );
        default:
            return null;
    }
}
