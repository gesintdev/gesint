"use client";
import { UserPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { findRouteById } from "@/shared/workspace/workspace-routes";
import { useWorkspaceNavigation } from "@/shared/workspace/useWorkspaceNavigation";

export function CollaboratorPeoplePrimaryAction() {
    const { openRouteCreate } = useWorkspaceNavigation();

    return (
        <Button
            size="sm"
            leftIcon={<UserPlus className="size-3.5" strokeWidth={2.5} />}
            onClick={() => {
                const route = findRouteById("collaborator-admission");
                if (route) openRouteCreate(route, "Adm");
            }}
        >
            Nova Admissão
        </Button>
    );
}
