"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, CircleHelp, LogOut, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import releaseVersion from "@/generated/release-version.json";
import { accountSettingsRoute } from "@/modules/cfg/account/config/account.routes";
import { ReleaseNotesModal } from "@/shared/components/release-notes/ReleaseNotesModal";
import { ProfileAvatar } from "@/shared/components/ui/ProfileAvatar";
import { showLoggingOutOverlay } from "@/shared/lib/logging-out-overlay";
import { signOutToTenantLogin } from "@/shared/lib/sign-out.client";
import { useWorkspaceStore } from "@/shared/workspace/workspace.store";
import { commitWorkspaceUrl } from "@/shared/workspace/workspace-location";
import { defaultShortLabel } from "@/shared/workspace/workspace-routes";

/**
 * Menu da conta no canto direito da topbar (modelo ClickUp): avatar + seta;
 * ao clicar abre o dropdown com dados do usuário e ações da conta.
 */
export function HeaderUserMenu() {
    const { data: session } = useSession();
    const openModuleTab = useWorkspaceStore((s) => s.openModuleTab);
    const [open, setOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const name = session?.user?.name?.trim() || session?.user?.username || "Usuário";
    const email = session?.user?.email;
    const photoObjectId = session?.user?.photoObjectId;

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    const openAccountSettings = () => {
        setOpen(false);
        const href = accountSettingsRoute.href ?? "/account";
        openModuleTab({
            routeId: accountSettingsRoute.id,
            href,
            routeLabel: "Meu perfil",
            shortLabel: defaultShortLabel("Meu perfil"),
            entityKey: "list",
            icon: accountSettingsRoute.icon,
        });
        commitWorkspaceUrl(href, "push");
    };

    const openHelp = () => {
        setOpen(false);
        setHelpOpen(true);
    };

    const logout = () => {
        setOpen(false);
        showLoggingOutOverlay();
        void signOutToTenantLogin();
    };

    return (
        <div ref={rootRef} className="header-user-menu">
            <button
                type="button"
                aria-label="Menu da conta"
                title={name}
                aria-expanded={open}
                aria-haspopup="menu"
                onClick={() => setOpen((value) => !value)}
                className={clsx("header-user-menu__trigger", open && "header-user-menu__trigger--open")}
            >
                <ProfileAvatar
                    name={name}
                    photoObjectId={photoObjectId}
                    size="xs"
                    shape="circle"
                    fallback="initials"
                    className="header-user-menu__avatar"
                />
                <ChevronDown className="header-user-menu__chevron" strokeWidth={1.5} aria-hidden />
            </button>

            <AnimatePresence>
                {open ? (
                    <motion.div
                        role="menu"
                        aria-label="Conta do usuário"
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
                        className="header-user-menu__dropdown surface-popover"
                    >
                        <div className="header-user-menu__profile">
                            <ProfileAvatar name={name} photoObjectId={photoObjectId} size="md" shape="circle" fallback="initials" />
                            <span className="min-w-0 flex-1">
                                <span className="header-user-menu__name">{name}</span>
                                {email ? <span className="header-user-menu__email">{email}</span> : null}
                            </span>
                        </div>

                        <hr className="header-user-menu__divider" />

                        <button type="button" role="menuitem" className="header-user-menu__item" onClick={openAccountSettings}>
                            <User className="header-user-menu__icon" strokeWidth={2} />
                            Meu perfil
                        </button>
                        <button type="button" role="menuitem" className="header-user-menu__item" onClick={openHelp}>
                            <CircleHelp className="header-user-menu__icon" strokeWidth={2} />
                            Ajuda
                        </button>

                        <hr className="header-user-menu__divider" />

                        <button
                            type="button"
                            role="menuitem"
                            className="header-user-menu__item header-user-menu__item--danger"
                            onClick={logout}
                        >
                            <LogOut className="header-user-menu__icon" strokeWidth={2} />
                            Sair da conta
                        </button>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <ReleaseNotesModal
                open={helpOpen}
                currentVersion={releaseVersion.version}
                onClose={() => setHelpOpen(false)}
            />
        </div>
    );
}
