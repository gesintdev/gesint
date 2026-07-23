"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import clsx from "clsx";
import {
    Bold,
    Code2,
    Heading2,
    Italic,
    Link2,
    List,
    ListOrdered,
} from "lucide-react";
import { marked } from "marked";
import { type ReactNode, useEffect, useRef } from "react";
import TurndownService from "turndown";

import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { fieldClass, InputFieldChrome } from "@/shared/components/ui/input/InputFieldChrome";

export type InputMarkdownProps = InputFieldChromeProps & {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    className?: string;
};

type ToolbarAction = {
    label: string;
    icon: ReactNode;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
};

const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
});

marked.setOptions({
    gfm: true,
    breaks: true,
});

function markdownToHtml(markdown: string): string {
    const trimmed = markdown.trim();
    if (!trimmed) return "";
    return marked.parse(trimmed, { async: false }) as string;
}

function htmlToMarkdown(html: string): string {
    return turndown.turndown(html ?? "").replace(/\n{3,}/g, "\n\n").trim();
}

export function InputMarkdown({
    label,
    hint,
    error,
    required,
    disabled,
    readOnly,
    wrapperClassName,
    id: idProp,
    value,
    onValueChange,
    placeholder,
    rows = 10,
    className,
}: InputMarkdownProps) {
    const editable = !disabled && !readOnly;
    const minHeight = Math.max(180, rows * 18);
    const lastEmittedRef = useRef((value ?? "").trim());

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                linkOnPaste: true,
            }),
            ...(placeholder
                ? [
                      Placeholder.configure({
                          placeholder,
                          showOnlyWhenEditable: true,
                      }),
                  ]
                : []),
        ],
        content: markdownToHtml(value) || "",
        editable,
        immediatelyRender: false,
        shouldRerenderOnTransaction: true,
        editorProps: {
            attributes: {
                ...(idProp ? { id: idProp } : {}),
                class: clsx(
                    "gommo-markdown min-h-[180px] px-3 py-2.5 text-sm font-normal leading-relaxed text-base-content outline-none",
                    "[&_h2]:mb-2.5 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-base-content",
                    "[&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-base-content",
                    "[&_p]:mb-2.5 [&_p]:font-normal [&_p]:last:mb-0",
                    "[&_ul]:mb-2.5 [&_ul]:list-disc [&_ul]:ps-5",
                    "[&_ol]:mb-2.5 [&_ol]:list-decimal [&_ol]:ps-5",
                    "[&_li]:mb-1 [&_li]:font-normal",
                    "[&_a]:font-normal [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
                    "[&_strong]:font-semibold [&_b]:font-semibold",
                    "[&_code]:rounded [&_code]:bg-base-200 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12px] [&_code]:font-normal",
                    "[&_pre]:mb-2.5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-base-200 [&_pre]:p-3",
                    "[&_blockquote]:my-2.5 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:ps-3 [&_blockquote]:font-normal [&_blockquote]:text-base-content/65",
                    "[&_.is-empty:first-child::before]:pointer-events-none",
                    "[&_.is-empty:first-child::before]:float-left",
                    "[&_.is-empty:first-child::before]:h-0",
                    "[&_.is-empty:first-child::before]:font-normal",
                    "[&_.is-empty:first-child::before]:text-base-content/35",
                    "[&_.is-empty:first-child::before]:content-[attr(data-placeholder)]",
                ),
                style: `min-height: ${minHeight}px; font-variation-settings: "wght" 450;`,
            },
        },
        onUpdate: ({ editor: current }) => {
            const next = current.isEmpty ? "" : htmlToMarkdown(current.getHTML());
            lastEmittedRef.current = next;
            onValueChange(next);
        },
    });

    useEffect(() => {
        if (!editor) return;
        editor.setEditable(editable);
    }, [editor, editable]);

    useEffect(() => {
        if (!editor) return;
        const incoming = (value ?? "").trim();
        if (incoming === lastEmittedRef.current) return;
        editor.commands.setContent(markdownToHtml(incoming) || "", { emitUpdate: false });
        lastEmittedRef.current = incoming;
    }, [editor, value]);

    if (!editor) {
        return (
            <InputFieldChrome
                label={label}
                error={error}
                required={required}
                disabled={disabled}
                id={idProp}
                labelFor={false}
                wrapperClassName={wrapperClassName}
            >
                <div
                    className="skeleton-shimmer rounded-[var(--gommo-control-radius)] border border-[var(--gommo-border)]"
                    style={{ minHeight }}
                />
            </InputFieldChrome>
        );
    }

    const setLink = () => {
        const previous = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("URL do link", previous ?? "https://");
        if (url === null) return;
        const trimmed = url.trim();
        if (!trimmed) {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
    };

    const actions: ToolbarAction[] = [
        {
            label: "Negrito",
            icon: <Bold className="size-3.5" />,
            active: editor.isActive("bold"),
            onClick: () => editor.chain().focus().toggleBold().run(),
        },
        {
            label: "Itálico",
            icon: <Italic className="size-3.5" />,
            active: editor.isActive("italic"),
            onClick: () => editor.chain().focus().toggleItalic().run(),
        },
        {
            label: "Título",
            icon: <Heading2 className="size-3.5" />,
            active: editor.isActive("heading", { level: 2 }),
            onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
            label: "Lista",
            icon: <List className="size-3.5" />,
            active: editor.isActive("bulletList"),
            onClick: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
            label: "Lista numerada",
            icon: <ListOrdered className="size-3.5" />,
            active: editor.isActive("orderedList"),
            onClick: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
            label: "Link",
            icon: <Link2 className="size-3.5" />,
            active: editor.isActive("link"),
            onClick: setLink,
        },
        {
            label: "Código",
            icon: <Code2 className="size-3.5" />,
            active: editor.isActive("code"),
            onClick: () => editor.chain().focus().toggleCode().run(),
        },
    ];

    return (
        <InputFieldChrome
            label={label}
            error={error}
            required={required}
            disabled={disabled}
            id={idProp}
            labelFor={false}
            wrapperClassName={wrapperClassName}
        >
            <div
                className={clsx(
                    "overflow-hidden rounded-[var(--gommo-control-radius)] border border-[var(--gommo-border)] bg-base-100",
                    fieldClass(disabled, readOnly, Boolean(error)),
                    className,
                )}
            >
                <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--gommo-border-subtle)] bg-base-200/40 px-2 py-1.5">
                    {actions.map((action) => (
                        <button
                            key={action.label}
                            type="button"
                            title={action.label}
                            aria-label={action.label}
                            aria-pressed={action.active}
                            disabled={!editable || action.disabled}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={action.onClick}
                            className={clsx(
                                "inline-flex size-7 items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-35",
                                action.active
                                    ? "bg-primary/15 text-primary"
                                    : "text-base-content/60 hover:bg-base-content/5 hover:text-base-content",
                            )}
                        >
                            {action.icon}
                        </button>
                    ))}
                </div>
                <EditorContent
                    editor={editor}
                    className="font-normal [font-variation-settings:'wght'_450] [&_.tiptap]:font-normal"
                />
            </div>
            {hint ? <p className="mt-1.5 text-[11px] text-base-content/45">{hint}</p> : null}
        </InputFieldChrome>
    );
}
