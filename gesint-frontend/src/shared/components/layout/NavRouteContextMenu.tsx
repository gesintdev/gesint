"use client";

import { Sparkles, Users } from "lucide-react";

import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { ContextMenu } from "@/shared/components/ui/ContextMenu";

export type NavRouteContextMenuState = {
    route: AppRoute;
    x: number;
    y: number;
};

type NavRouteContextMenuProps = {
    state: NavRouteContextMenuState | null;
    onClose: () => void;
    onLinkedProfiles: (route: AppRoute) => void;
    onAskAssistant?: (route: AppRoute) => void;
};

export function NavRouteContextMenu({
    state,
    onClose,
    onLinkedProfiles,
    onAskAssistant,
}: NavRouteContextMenuProps) {
    if (!state) return null;

    return (
        <ContextMenu
            x={state.x}
            y={state.y}
            ariaLabel="Ações do menu"
            onClose={onClose}
            entries={[
                {
                    type: "item",
                    item: {
                        id: "linked-profiles",
                        label: "Perfis vinculados",
                        icon: (
                            <Users className="size-3.5 shrink-0 text-base-content/45" strokeWidth={2} />
                        ),
                        onSelect: () => onLinkedProfiles(state.route),
                    },
                },
                ...(onAskAssistant
                    ? [
                          { type: "separator" as const },
                          {
                              type: "item" as const,
                              item: {
                                  id: "ask-assistant",
                                  label: "Conversar sobre este menu",
                                  icon: (
                                      <Sparkles className="size-3.5 shrink-0 text-base-content/45" strokeWidth={2} />
                                  ),
                                  onSelect: () => onAskAssistant(state.route),
                              },
                          },
                      ]
                    : []),
            ]}
        />
    );
}
