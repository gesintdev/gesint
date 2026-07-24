import { UserPlus, UserRound, Users } from "lucide-react";

import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { lazyNamed, routeGroup, tabbedCrudRoute } from "@/shared/routing";

/**
 * Admissão e Pessoas são compartilhadas entre RH e DP (mesmo href).
 * O workspace registra o loader uma vez; a navegação por sistema reutiliza a rota.
 */
export const collaboratorSharedRouteGroup: AppRoute = routeGroup({
    id: "collaborator",
    label: "Colaboradores",
    icon: Users,
    permission: "admission:read",
    children: [
        tabbedCrudRoute({
            id: "collaborator-admission",
            href: "/collaborator/admission",
            label: "Admissão",
            icon: UserPlus,
            permission: "admission:read",
            routeId: "collaborator-admission",
            tabShortLabel: "Adm",
            fieldTabName: "fullName",
            workspace: lazyNamed(
                () => import("@/modules/rh/person/collaborators/admission/components/AdmissionWorkspacePage"),
                "AdmissionWorkspacePage",
            ),
            list: lazyNamed(
                () => import("@/modules/rh/person/collaborators/admission/components/AdmissionProcessListClient"),
                "AdmissionProcessListClient",
            ),
            form: lazyNamed(
                () => import("@/modules/rh/person/collaborators/admission/components/AdmissionProcessFormClient"),
                "AdmissionProcessFormClient",
            ),
        }),
        tabbedCrudRoute({
            id: "collaborator-people",
            href: "/collaborator/people",
            label: "Pessoas",
            icon: UserRound,
            permission: "collaborator:read",
            routeId: "collaborator-people",
            tabShortLabel: "Pessoa",
            fieldTabName: "fullName",
            editOnly: true,
            showListToFormButton: false,
            listToolbar: "Consulte e edite dados pessoais. Novos colaboradores entram somente pela admissão.",
            formTabLabel: "Dados pessoais",
            formTabLabelEdit: "Editar pessoa",
            list: lazyNamed(
                () => import("@/modules/rh/person/collaborators/people/components/CollaboratorListClient"),
                "CollaboratorListClient",
            ),
            form: lazyNamed(
                () => import("@/modules/rh/person/collaborators/people/components/CollaboratorFormClient"),
                "CollaboratorFormClient",
            ),
            listPrimaryAction: lazyNamed(
                () => import("@/modules/rh/person/collaborators/people/components/CollaboratorPeoplePrimaryAction"),
                "CollaboratorPeoplePrimaryAction",
            ),
        }),
    ],
});
