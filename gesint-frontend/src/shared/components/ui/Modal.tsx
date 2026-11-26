"use client";

import clsx from "clsx";
import {type ReactNode, type Ref, type SyntheticEvent, useEffect, useId, useRef, useState} from "react";
import {createPortal} from "react-dom";

import {Button, type ButtonProps} from "@/shared/components/ui/Button";
import {PopoverPortalProvider} from "@/shared/components/ui/input/popover-portal";
import {ModalHeader} from "@/shared/components/ui/ModalHeader";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full" | "screen";

export type ModalAction = {
    title: string;
    onClick: () => void;
    variant?: ButtonProps["variant"];
    loading?: boolean;
    disabled?: boolean;
    leftIcon?: ReactNode;
    className?: string;
};

type ModalProps = {
    open: boolean;
    onClose: () => void;
    /** Omitir só quando o conteúdo já traz a própria casca (workspace do assistente). */
    title?: ReactNode;
    subtitle?: ReactNode;
    icon?: ReactNode;
    headerActions?: ReactNode;
    closeDisabled?: boolean;
    size?: ModalSize;
    /** Substitui a escala de largura quando o modal não cabe em sm–screen. */
    layoutClassName?: string;
    bodyClassName?: string;
    padded?: boolean;
    scroll?: boolean;
    children: ReactNode;
    actions?: ModalAction[];
    /** Rodapé livre. Botões daqui usam o `Button` do sistema. */
    footer?: ReactNode;
    portal?: boolean;
    dialogRef?: Ref<HTMLDialogElement>;
};

const SIZE_CLASS: Record<ModalSize, string> = {
    sm: "max-h-[90vh] w-full max-w-md",
    md: "max-h-[90vh] w-full max-w-lg",
    lg: "max-h-[90vh] w-full max-w-xl",
    xl: "max-h-[92vh] w-full max-w-2xl",
    "2xl": "max-h-[92vh] w-full max-w-3xl",
    "3xl": "max-h-[90vh] w-full max-w-4xl",
    "4xl": "max-h-[92vh] w-full max-w-5xl",
    full: "h-[92dvh] max-h-[92dvh] w-[min(100vw-1rem,72rem)] max-w-6xl sm:h-[92vh] sm:max-h-[92vh]",
    screen: "h-[95vh] max-h-[95vh] w-[95vw] max-w-[95vw]",
};

function assignDialogRef(ref: Ref<HTMLDialogElement> | undefined, node: HTMLDialogElement | null) {
    if (!ref) return;
    if (typeof ref === "function") {
        ref(node);
        return;
    }
    ref.current = node;
}

/**
 * Modal de conteúdo. Título, fechar, caixa e rodapé saem daqui.
 * Não monte outro `<dialog className="modal">` nem outro botão de fechar.
 */
export function Modal({
                          open,
                          onClose,
                          title,
                          subtitle,
                          icon,
                          headerActions,
                          closeDisabled = false,
                          size = "md",
                          layoutClassName,
                          bodyClassName,
                          padded = true,
                          scroll = true,
                          children,
                          actions,
                          footer,
                          portal = true,
                          dialogRef,
                      }: ModalProps) {
    const internalRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const [mounted, setMounted] = useState(false);
    const [dialogNode, setDialogNode] = useState<HTMLDialogElement | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = internalRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open, mounted]);

    const requestClose = () => {
        if (closeDisabled) return;
        onClose();
    };

    const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
        if (event.target !== internalRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        const openDialogs = document.querySelectorAll("dialog[open]");
        const topmost = openDialogs[openDialogs.length - 1];
        if (topmost && topmost !== internalRef.current) return;
        requestClose();
    };

    if (portal && !mounted) return null;

    const dialog = (
        <dialog
            ref={(node) => {
                internalRef.current = node;
                assignDialogRef(dialogRef, node);
                setDialogNode((current) => (current === node ? current : node));
            }}
            className="modal"
            aria-labelledby={title != null ? titleId : undefined}
            onCancel={handleCancel}
        >
            <PopoverPortalProvider container={dialogNode}>
            <div
                className={clsx(
                    "modal-box flex flex-col gap-0 overflow-hidden p-0",
                    layoutClassName ?? SIZE_CLASS[size],
                )}
                onClick={(event) => event.stopPropagation()}
            >
                {title != null ? (
                    <ModalHeader
                        title={<span id={titleId}>{title}</span>}
                        subtitle={subtitle}
                        icon={icon}
                        actions={headerActions}
                        onClose={requestClose}
                        closeDisabled={closeDisabled}
                    />
                ) : null}
                <div
                    className={clsx(
                        "min-h-0 flex-1",
                        scroll && "overflow-y-auto",
                        padded && "px-4 py-4",
                        bodyClassName,
                    )}
                >
                    {children}
                </div>
                {footer ? (
                    <div className="relative z-10 shrink-0 border-t border-base-content/8 bg-base-100 px-4 py-3">
                        {footer}
                    </div>
                ) : actions?.length ? (
                    <div className="modal-action relative z-10 mt-0 shrink-0 border-t border-base-content/8 bg-base-100 px-4 py-3">
                        {actions.map((action) => (
                            <Button
                                key={action.title}
                                type="button"
                                variant={action.variant ?? "primary"}
                                onClick={action.onClick}
                                loading={action.loading}
                                disabled={action.disabled}
                                leftIcon={action.leftIcon}
                                className={action.className}
                            >
                                {action.title}
                            </Button>
                        ))}
                    </div>
                ) : null}
            </div>
            </PopoverPortalProvider>
            <button type="button" className="modal-backdrop" aria-label="Fechar" onClick={requestClose}/>
        </dialog>
    );

    if (!portal) return dialog;
    return createPortal(dialog, document.body);
}
