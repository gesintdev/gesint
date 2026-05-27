import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import {
    Building2,
    CreditCard,
    KeyRound,
    ShieldCheck,
    ToggleLeft,
    Users,
} from "lucide-react";

/** Gestão de clientes (tenants) que contratam o Gommo */
export const clientsRoutes: AppRoute[] = [
    {
        id: "clients-hub",
        label: "Gestão de clientes",
        icon: Building2,
        children: [
            { id: "clients", label: "Clientes", href: "/clients", icon: Building2 },
            {
                id: "client-users",
                label: "Usuários administrativos",
                href: "/client-users",
                icon: Users,
            },
            {
                id: "client-status",
                label: "Status e assinatura",
                href: "/clients/status",
                icon: ToggleLeft,
            },
            {
                id: "client-payments",
                label: "Pagamentos",
                href: "/clients/payments",
                icon: CreditCard,
            },
            {
                id: "client-permissions",
                label: "Permissões do cliente",
                href: "/clients/permissions",
                icon: KeyRound,
            },
        ],
    },
];
