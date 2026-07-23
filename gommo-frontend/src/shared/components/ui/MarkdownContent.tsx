"use client";

import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
    value?: string | null;
    className?: string;
    emptyFallback?: string;
};

export function MarkdownContent({ value, className, emptyFallback }: MarkdownContentProps) {
    const content = value?.trim() ?? "";
    if (!content) {
        return emptyFallback ? (
            <p className={clsx("text-sm text-base-content/45", className)}>{emptyFallback}</p>
        ) : null;
    }

    return (
        <div
            className={clsx(
                "gommo-markdown text-sm font-normal leading-relaxed text-base-content/85 [font-variation-settings:'wght'_450]",
                "[&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-base-content",
                "[&_h2]:mb-2.5 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-base-content",
                "[&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-base-content",
                "[&_p]:mb-2.5 [&_p]:font-normal [&_p]:last:mb-0",
                "[&_ul]:mb-2.5 [&_ul]:list-disc [&_ul]:ps-5",
                "[&_ol]:mb-2.5 [&_ol]:list-decimal [&_ol]:ps-5",
                "[&_li]:mb-1 [&_li]:font-normal",
                "[&_a]:font-normal [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline",
                "[&_strong]:font-semibold [&_b]:font-semibold",
                "[&_code]:rounded [&_code]:bg-base-200 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12px]",
                "[&_pre]:mb-2.5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-base-200 [&_pre]:p-3",
                "[&_blockquote]:my-2.5 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:ps-3 [&_blockquote]:text-base-content/65",
                "[&_hr]:my-4 [&_hr]:border-base-content/10",
                className,
            )}
        >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
    );
}
