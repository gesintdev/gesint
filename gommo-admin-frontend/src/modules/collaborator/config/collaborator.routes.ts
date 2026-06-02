import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import {
    Briefcase,
    CalendarDays,
    MessageSquare,
    UserMinus,
    UserPlus,
    UserRound,
    Users,
} from "lucide-react";

export const collaboratorRoutes: AppRoute[] = [
    {
        id: "collaborator",
        label: "Colaboradores",
        icon: Users,
        permission: "admission:read",
        children: [
            {
                id: "collaborator-people",
                label: "Pessoas",
                href: "/collaborator/people",
                icon: UserRound,
                permission: "collaborator:read",
            },
            { id: "collaborator-admission", label: "Admissão", href: "/collaborator/admission", icon: UserPlus, permission: "admission:read" },
        ],
    },
    { id: "contract", label: "Contratos", href: "/contract", icon: Briefcase },
    { id: "attendance", label: "Ponto", href: "/attendance", icon: CalendarDays },
    { id: "leave", label: "Férias e afastamentos", href: "/leave", icon: CalendarDays },
    { id: "offboarding", label: "Desligamento", href: "/offboarding", icon: UserMinus },
    { id: "exit-interview", label: "Entrevista de desligamento", href: "/exit-interview", icon: MessageSquare },
];
