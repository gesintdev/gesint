import { Building2, CreditCard, KeyRound, ToggleLeft, Users } from "lucide-react";

import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { comingSoonRoute, lazyNamed, routeGroup, tabbedCrudRoute } from "@/shared/routing";
/** Gestão de clientes (tenants) que contratam o Gommo */
export const clientsRoutes: AppRoute[] = [
    routeGroup({
        id: "clients-hub",
        label: "Gestão de clientes",
        icon: Building2,
        children: [
            tabbedCrudRoute({
                id: "clients",
                href: "/clients",
                label: "Clientes",
                icon: Building2,
                routeId: "clients",
                tabShortLabel: "Cliente",
                fieldTabName: "name",
                list: lazyNamed(() => import("@/modules/client/components/ClientListClient"), "ClientListClient"),
                form: lazyNamed(() => import("@/modules/client/components/ClientFormClient"), "ClientFormClient"),
            }),
            tabbedCrudRoute({
                id: "client-users",
                href: "/client-users",
                label: "Usuários administrativos",
                icon: Users,
                routeId: "client-users",
                tabShortLabel: "Usuário",
                fieldTabName: "displayName",
                list: lazyNamed(
                    () => import("@/modules/clientuser/components/ClientUserListClient"),
                    "ClientUserListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/clientuser/components/ClientUserFormClient"),
                    "ClientUserFormClient",
                ),
            }),
            tabbedCrudRoute({
                id: "client-status",
                href: "/clients/status",
                label: "Status e assinatura",
                icon: ToggleLeft,
                routeId: "client-status",
                tabShortLabel: "Assinatura",
                fieldTabName: "planCode",
                list: lazyNamed(
                    () => import("@/modules/clientsubscription/components/ClientSubscriptionListClient"),
                    "ClientSubscriptionListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/clientsubscription/components/ClientSubscriptionFormClient"),
                    "ClientSubscriptionFormClient",
                ),
            }),
            tabbedCrudRoute({
                id: "client-payments",
                href: "/clients/payments",
                label: "Pagamentos",
                icon: CreditCard,
                routeId: "client-payments",
                tabShortLabel: "Pagamento",
                fieldTabName: "referenceCode",
                list: lazyNamed(
                    () => import("@/modules/clientpayment/components/ClientPaymentListClient"),
                    "ClientPaymentListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/clientpayment/components/ClientPaymentFormClient"),
                    "ClientPaymentFormClient",
                ),
            }),
            comingSoonRoute({
                id: "client-permissions",
                href: "/clients/permissions",
                label: "Permissões do cliente",
                icon: KeyRound,
                title: "Permissões do cliente",
                description: "Pacotes de módulos e limites de uso liberados para cada tenant.",
            }),
        ],
    }),
];
