"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, CircleHelp, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { accountSettingsRoute } from "@/modules/cfg/account/config/account.routes";
import releaseVersion from "@/generated/release-version.json";
import { ReleaseNotesModal } from "@/shared/components/release-notes/ReleaseNotesModal";
import { ProfileAvatar } from "@/shared/components/ui/ProfileAvatar";
import { showLoggingOutOverlay } from "@/shared/lib/logging-out-overlay";
import { signOutToTenantLogin } from "@/shared/lib/sign-out.client";
import { useWorkspaceStore } from "@/shared/workspace/workspace.store";
import { defaultShortLabel } from "@/shared/workspace/workspace-routes";

type SidebarUserMenuProps = {
    /** Painel de rotas recolhido (só avatar). */
    collapsed: boolean;
    /** Fecha drawer mobile apos navegar. */
    onNavigate?: () => void;
};

type MenuPos = { top: number; left: number; placement: "above" | "side" };

const MENU_WIDTH = 240;
const MENU_GAP = 6;

export function SidebarUserMenu({ collapsed, onNavigate }: SidebarUserMenuProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const openModuleTab = useWorkspaceStore((s) => s.openModuleTab);
    const [open, setOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const [pos, setPos] = useState<MenuPos | null>(null);
    const [mounted, setMounted] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const anchorRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const name = session?.user?.name?.trim() || session?.user?.username || "Usuário";
    const email = session?.user?.email;
    const photoObjectId = session?.user?.photoObjectId;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (collapsed) setOpen(false);
    }, [collapsed]);

    const updatePosition = useCallback(() => {
        const anchor = anchorRef.current;
        if (!anchor) return;
        const rect = anchor.getBoundingClientRect();
        const pad = 8;
        const measured = menuRef.current?.getBoundingClientRect().height ?? 0;
        const menuHeight = measured > 0 ? measured : collapsed ? 248 : 268;

        if (collapsed) {
            // Borda direita do painel recolhido visível (evita gap pelo content de 14rem).
            const panel = anchor.closest(".sidebar-routes-panel");
            const panelRight = panel?.getBoundingClientRect().right ?? rect.right;
            const left = Math.round(
                Math.min(panelRight + MENU_GAP, window.innerWidth - MENU_WIDTH - pad),
            );
            const preferredTop = rect.top + rect.height / 2 - menuHeight / 2;
            const top = Math.round(
                Math.min(Math.max(pad, preferredTop), window.innerHeight - menuHeight - pad),
            );
            setPos((prev) =>
                prev && prev.top === top && prev.left === left && prev.placement === "side"
                    ? prev
                    : { top, left: Math.max(pad, left), placement: "side" },
            );
            return;
        }

        const left = Math.round(Math.min(rect.left, window.innerWidth - MENU_WIDTH - pad));
        const preferredTop = rect.top - menuHeight - MENU_GAP;
        const top = Math.round(
            Math.min(Math.max(pad, preferredTop), window.innerHeight - menuHeight - pad),
        );
        setPos((prev) =>
            prev && prev.top === top && prev.left === left && prev.placement === "above"
                ? prev
                : { top, left: Math.max(pad, left), placement: "above" },
        );
    }, [collapsed]);

    useLayoutEffect(() => {
        if (!open) {
            setPos(null);
            return;
        }
        updatePosition();
    }, [open, updatePosition]);

    // Segundo passe: altura real do popover já montado (mantém dentro da viewport).
    useLayoutEffect(() => {
        if (!open || !pos) return;
        updatePosition();
    }, [open, pos, updatePosition]);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: MouseEvent) => {
            const target = event.target as Node;
            if (rootRef.current?.contains(target)) return;
            if (menuRef.current?.contains(target)) return;
            setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        const onReposition = () => updatePosition();
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        window.addEventListener("resize", onReposition);
        window.addEventListener("scroll", onReposition, true);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("resize", onReposition);
            window.removeEventListener("scroll", onReposition, true);
        };
    }, [open, updatePosition]);

    const openAccountSettings = () => {
        setOpen(false);
        onNavigate?.();
        const href = accountSettingsRoute.href ?? "/account";
        openModuleTab({
            routeId: accountSettingsRoute.id,
            href,
            routeLabel: "Meu perfil",
            shortLabel: defaultShortLabel("Meu perfil"),
            entityKey: "list",
            icon: accountSettingsRoute.icon,
        });
        router.replace(href);
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

    const itemClass =
        "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] text-base-content/85 transition-colors hover:bg-base-content/8";

    return (
        <>
            <div
                ref={rootRef}
                className={clsx(
                    "sidebar-user-menu shrink-0 border-t",
                    collapsed ? "sidebar-user-menu--collapsed" : "sidebar-user-menu--expanded",
                )}
                style={{ borderColor: "var(--sidebar-border)" }}
            >
                <div
                    ref={anchorRef}
                    className={clsx(
                        "sidebar-user-menu__card",
                        open && "sidebar-user-menu__card--open",
                        collapsed && "sidebar-user-menu__card--collapsed",
                    )}
                >
                    <button
                        type="button"
                        aria-label="Menu da conta"
                        aria-expanded={open}
                        aria-haspopup="menu"
                        onClick={() => setOpen((value) => !value)}
                        className="sidebar-user-menu__main"
                    >
                        <span className="sidebar-user-menu__avatar-slot">
                            <ProfileAvatar
                                name={name}
                                photoObjectId={photoObjectId}
                                size="sm"
                                shape="circle"
                                className="shrink-0"
                            />
                        </span>
                        <span className="sidebar-copy sidebar-user-menu__meta min-w-0 text-left">
                            <span className="block truncate text-[13px] font-semibold leading-tight text-base-content">
                                {name}
                            </span>
                            {email ? (
                                <span className="mt-0.5 block truncate text-[11px] leading-tight text-base-content/45">
                                    {email}
                                </span>
                            ) : null}
                        </span>
                    </button>
                    <button
                        type="button"
                        aria-label="Sair da conta"
                        title="Sair da conta"
                        tabIndex={collapsed ? -1 : 0}
                        aria-hidden={collapsed}
                        className="sidebar-copy sidebar-user-menu__logout"
                        onClick={logout}
                    >
                        <LogOut className="size-3.5" strokeWidth={2} />
                    </button>
                </div>
            </div>

            {mounted
                ? createPortal(
                      <AnimatePresence>
                          {open && pos ? (
                              <motion.div
                                  ref={menuRef}
                                  role="menu"
                                  aria-label="Conta do usuário"
                                  initial={{
                                      opacity: 0,
                                      y: pos.placement === "above" ? 6 : 0,
                                      x: pos.placement === "side" ? -6 : 0,
                                      scale: 0.97,
                                  }}
                                  animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                                  exit={{
                                      opacity: 0,
                                      y: pos.placement === "above" ? 4 : 0,
                                      x: pos.placement === "side" ? -4 : 0,
                                      scale: 0.97,
                                  }}
                                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                                  className={clsx(
                                      "sidebar-user-menu__popover surface-popover fixed z-[80] p-1.5",
                                      pos.placement === "above" && "sidebar-user-menu__popover--above",
                                      pos.placement === "side" && "sidebar-user-menu__popover--side",
                                  )}
                                  style={{
                                      top: pos.top,
                                      left: pos.left,
                                      width: MENU_WIDTH,
                                  }}
                              >
                                  <div className="flex items-center gap-2.5 rounded-md px-2.5 py-2">
                                      <ProfileAvatar
                                          name={name}
                                          photoObjectId={photoObjectId}
                                          size="md"
                                          shape="circle"
                                      />
                                      <span className="min-w-0 flex-1 text-left">
                                          <span className="block truncate text-[13px] font-semibold leading-tight text-base-content">
                                              {name}
                                          </span>
                                          {email ? (
                                              <span className="mt-0.5 block truncate text-[11px] leading-tight text-base-content/45">
                                                  {email}
                                              </span>
                                          ) : null}
                                      </span>
                                      {pos.placement === "above" ? (
                                          <ChevronUp
                                              className="size-4 shrink-0 text-base-content/35"
                                              strokeWidth={2}
                                          />
                                      ) : null}
                                  </div>

                                  <div className="my-1 h-px bg-base-content/8" />

                                  <button
                                      type="button"
                                      role="menuitem"
                                      className={itemClass}
                                      onClick={openAccountSettings}
                                  >
                                      <User
                                          className="size-[15px] shrink-0 text-base-content/38"
                                          strokeWidth={2}
                                      />
                                      Meu perfil
                                  </button>
                                  <button
                                      type="button"
                                      role="menuitem"
                                      className={itemClass}
                                      onClick={openHelp}
                                  >
                                      <CircleHelp
                                          className="size-[15px] shrink-0 text-base-content/38"
                                          strokeWidth={2}
                                      />
                                      Ajuda
                                  </button>

                                  <div className="my-1 h-px bg-base-content/8" />

                                  <button
                                      type="button"
                                      role="menuitem"
                                      className={`${itemClass} text-error hover:bg-error/8 hover:text-error`}
                                      onClick={logout}
                                  >
                                      <LogOut className="size-[15px] shrink-0" strokeWidth={2} />
                                      Sair da conta
                                  </button>
                              </motion.div>
                          ) : null}
                      </AnimatePresence>,
                      document.body,
                  )
                : null}

            <ReleaseNotesModal
                open={helpOpen}
                currentVersion={releaseVersion.version}
                onClose={() => setHelpOpen(false)}
            />
        </>
    );
}
