"use client";

import type { ComponentType } from "react";
import { ClientFormClient } from "@/modules/client/components/ClientFormClient";
import { ClientListClient } from "@/modules/client/components/ClientListClient";
import type { Client } from "@/modules/client/dto/client.dto";
import { ClientUserFormClient } from "@/modules/clientuser/components/ClientUserFormClient";
import { ClientUserListClient } from "@/modules/clientuser/components/ClientUserListClient";
import type { ClientUser } from "@/modules/clientuser/dto/clientuser.dto";
import { AdminUserFormClient } from "@/modules/adminuser/components/AdminUserFormClient";
import { AdminUserListClient } from "@/modules/adminuser/components/AdminUserListClient";
import type { AdminUser } from "@/modules/adminuser/dto/adminuser.dto";
import { TabbedCrudPage } from "@/shared/components/layout/TabbedCrudPage";
import { WorkspacePage } from "@/shared/components/layout/WorkspacePage";
import { ClientPaymentFormClient } from "@/modules/clientpayment/components/ClientPaymentFormClient";
import { ClientPaymentListClient } from "@/modules/clientpayment/components/ClientPaymentListClient";
import type { ClientPayment } from "@/modules/clientpayment/dto/clientpayment.dto";
import { ClientSubscriptionFormClient } from "@/modules/clientsubscription/components/ClientSubscriptionFormClient";
import { ClientSubscriptionListClient } from "@/modules/clientsubscription/components/ClientSubscriptionListClient";
import type { ClientSubscription } from "@/modules/clientsubscription/dto/clientsubscription.dto";
import { ComingSoonView } from "@/shared/workspace/views/ComingSoonView";

export type WorkspacePageEntry = {
    href: string;
    Component: ComponentType;
};

function ClientPage() {
    return (
        <TabbedCrudPage<Client>
            routeId="clients"
            href="/clients"
            routeLabel="Clientes"
            tabShortLabel="Cliente"
            fieldTabName="name"
            list={<ClientListClient />}
            form={<ClientFormClient />}
        />
    );
}

function ClientUserPage() {
    return (
        <TabbedCrudPage<ClientUser>
            routeId="client-users"
            href="/client-users"
            routeLabel="Usuários administrativos"
            tabShortLabel="Usuário"
            fieldTabName="displayName"
            list={<ClientUserListClient />}
            form={<ClientUserFormClient />}
        />
    );
}

function AdminUserPage() {
    return (
        <TabbedCrudPage<AdminUser>
            routeId="admin-users"
            href="/admin-users"
            routeLabel="Operadores"
            tabShortLabel="Operador"
            fieldTabName="fullName"
            list={<AdminUserListClient />}
            form={<AdminUserFormClient />}
        />
    );
}

function ClientSubscriptionPage() {
    return (
        <TabbedCrudPage<ClientSubscription>
            routeId="client-status"
            href="/clients/status"
            routeLabel="Status e assinatura"
            tabShortLabel="Assinatura"
            fieldTabName="planCode"
            list={<ClientSubscriptionListClient />}
            form={<ClientSubscriptionFormClient />}
        />
    );
}

function ClientPaymentPage() {
    return (
        <TabbedCrudPage<ClientPayment>
            routeId="client-payments"
            href="/clients/payments"
            routeLabel="Pagamentos"
            tabShortLabel="Pagamento"
            fieldTabName="referenceCode"
            list={<ClientPaymentListClient />}
            form={<ClientPaymentFormClient />}
        />
    );
}

function AdminDashboardView() {
    return (
        <WorkspacePage>
            <div className="flex min-h-[12rem] flex-col gap-2 p-8">
                <h1 className="text-xl font-semibold">Painel administrativo</h1>
                <p className="text-sm text-base-content/60">
                    Cadastre e gerencie clientes, assinaturas, pagamentos e usuários com acesso inicial ao sistema de cada tenant.
                </p>
            </div>
        </WorkspacePage>
    );
}

export const WORKSPACE_PAGE_REGISTRY: WorkspacePageEntry[] = [
    { href: "/dashboard", Component: AdminDashboardView },
    { href: "/clients", Component: ClientPage },
    { href: "/client-users", Component: ClientUserPage },
    { href: "/clients/status", Component: ClientSubscriptionPage },
    { href: "/clients/payments", Component: ClientPaymentPage },
    {
        href: "/clients/permissions",
        Component: () => (
            <ComingSoonView
                title="Permissões do cliente"
                description="Pacotes de módulos e limites de uso liberados para cada tenant."
            />
        ),
    },
    { href: "/admin-users", Component: AdminUserPage },
];

const REGISTRY_BY_HREF = new Map(WORKSPACE_PAGE_REGISTRY.map((e) => [e.href, e.Component]));

export function getWorkspacePageComponent(href: string): ComponentType | undefined {
    return REGISTRY_BY_HREF.get(href);
}
