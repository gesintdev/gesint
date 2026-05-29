import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { lazyNamed, routeGroup, tabbedCrudRoute } from "@/shared/routing";
import { FileText, Gift, Receipt, Scale, UserCheck } from "lucide-react";

export const payrollRoutes: AppRoute[] = [
    routeGroup({
        id: "payroll",
        label: "Folha",
        icon: Receipt,
        children: [
            tabbedCrudRoute({
                id: "payroll-run",
                href: "/payroll",
                label: "Processamento",
                icon: Receipt,
                routeId: "payroll-run",
                tabShortLabel: "Folha",
                list: lazyNamed(
                    () => import("@/modules/payroll/components/PayrollRunListClient"),
                    "PayrollRunListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/payroll/components/PayrollRunFormClient"),
                    "PayrollRunFormClient",
                ),
            }),
            tabbedCrudRoute({
                id: "payslip",
                href: "/payroll/payslips",
                label: "Holerites",
                icon: FileText,
                routeId: "payslip",
                tabShortLabel: "Hol",
                list: lazyNamed(
                    () => import("@/modules/payslip/components/PayslipListClient"),
                    "PayslipListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/payslip/components/PayslipFormClient"),
                    "PayslipFormClient",
                ),
            }),
        ],
    }),
    routeGroup({
        id: "benefit",
        label: "Benefícios",
        icon: Gift,
        children: [
            tabbedCrudRoute({
                id: "benefit-plan",
                href: "/benefit",
                label: "Planos",
                icon: Gift,
                routeId: "benefit-plan",
                tabShortLabel: "Plano",
                fieldTabName: "name",
                list: lazyNamed(
                    () => import("@/modules/benefit/components/BenefitPlanListClient"),
                    "BenefitPlanListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/benefit/components/BenefitPlanFormClient"),
                    "BenefitPlanFormClient",
                ),
            }),
            tabbedCrudRoute({
                id: "benefit-enrollment",
                href: "/benefit/enrollments",
                label: "Vínculos",
                icon: UserCheck,
                routeId: "benefit-enrollment",
                tabShortLabel: "Vínc",
                list: lazyNamed(
                    () => import("@/modules/benefitenrollment/components/BenefitEnrollmentListClient"),
                    "BenefitEnrollmentListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/benefitenrollment/components/BenefitEnrollmentFormClient"),
                    "BenefitEnrollmentFormClient",
                ),
            }),
        ],
    }),
    tabbedCrudRoute({
        id: "tax",
        href: "/tax",
        label: "Fiscal",
        icon: Scale,
        routeId: "tax",
        tabShortLabel: "Fiscal",
        list: lazyNamed(
            () => import("@/modules/tax/components/TaxObligationListClient"),
            "TaxObligationListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/tax/components/TaxObligationFormClient"),
            "TaxObligationFormClient",
        ),
    }),
];
