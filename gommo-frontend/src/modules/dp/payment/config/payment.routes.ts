import { Wallet } from "lucide-react";

import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { lazyNamed, tabbedCrudRoute } from "@/shared/routing";

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
            () => import("@/modules/dp/payment/components/PaymentPeriodListClient"),
            "PaymentPeriodListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/dp/payment/components/PaymentPeriodFormClient"),
            "PaymentPeriodFormClient",
        ),
    }),
];
