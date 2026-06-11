import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { lazyNamed, tabbedCrudRoute } from "@/shared/routing";
import { Wallet } from "lucide-react";

export const paymentRoutes: AppRoute[] = [
    tabbedCrudRoute({
        id: "payment-period",
        href: "/payments",
        label: "Pagamentos",
        icon: Wallet,
        permission: "payment:read",
        routeId: "payment-period",
        tabShortLabel: "Pagamentos",
        listToolbar:
            "Cadastre competências e envie os PDFs recebidos da contabilidade. O sistema separa holerites por colaborador.",
        list: lazyNamed(
            () => import("@/modules/payment/components/PaymentPeriodListClient"),
            "PaymentPeriodListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/payment/components/PaymentPeriodFormClient"),
            "PaymentPeriodFormClient",
        ),
    }),
];
