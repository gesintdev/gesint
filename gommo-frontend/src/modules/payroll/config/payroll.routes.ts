import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import { lazyNamed, routeGroup, tabbedCrudRoute } from "@/shared/routing";
import { FileText, Gift, ListOrdered, Receipt, Scale, UserCheck, CalendarDays } from "lucide-react";

export const payrollRoutes: AppRoute[] = [
    routeGroup({
        id: "payroll",
        label: "Folha",
        icon: Receipt,
        children: [
            tabbedCrudRoute({
                id: "payroll-run",
                href: "/payroll",
                label: "Folha de pagamento",
                icon: Receipt,
                permission: "payroll:read",
                routeId: "payroll-run",
                tabShortLabel: "Folha de pagamento",
                listToolbar: "Competências da folha (MM/AAAA). Abra, edite ou feche períodos antes do processamento.",
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
                id: "payroll-event",
                href: "/payroll/events",
                label: "Eventos de folha",
                icon: ListOrdered,
                permission: "payrollevent:read",
                routeId: "payroll-event",
                tabShortLabel: "Eventos",
                fieldTabName: "eventCode",
                listToolbar: "Rubricas parametrizáveis (proventos, descontos e informativos) usadas no cálculo da folha.",
                list: lazyNamed(
                    () => import("@/modules/payroll/payroll-event/components/PayrollEventListClient"),
                    "PayrollEventListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/payroll/payroll-event/components/PayrollEventFormClient"),
                    "PayrollEventFormClient",
                ),
            }),
            tabbedCrudRoute({
                id: "payslip",
                href: "/payroll/payslips",
                label: "Holerites",
                icon: FileText,
                permission: "payslip:read",
                routeId: "payslip",
                tabShortLabel: "Hol",
                list: lazyNamed(
                    () => import("@/modules/payroll/payslip/components/PayslipListClient"),
                    "PayslipListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/payroll/payslip/components/PayslipFormClient"),
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
                permission: "benefit:read",
                routeId: "benefit-plan",
                tabShortLabel: "Plano",
                fieldTabName: "name",
                list: lazyNamed(
                    () => import("@/modules/payroll/benefit/components/BenefitPlanListClient"),
                    "BenefitPlanListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/payroll/benefit/components/BenefitPlanFormClient"),
                    "BenefitPlanFormClient",
                ),
            }),
            tabbedCrudRoute({
                id: "benefit-enrollment",
                href: "/benefit/enrollments",
                label: "Vínculos",
                icon: UserCheck,
                permission: "benefitenrollment:read",
                routeId: "benefit-enrollment",
                tabShortLabel: "Vínc",
                list: lazyNamed(
                    () => import("@/modules/payroll/benefitenrollment/components/BenefitEnrollmentListClient"),
                    "BenefitEnrollmentListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/payroll/benefitenrollment/components/BenefitEnrollmentFormClient"),
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
        permission: "tax:read",
        routeId: "tax",
        tabShortLabel: "Fiscal",
        list: lazyNamed(
            () => import("@/modules/payroll/tax/components/TaxObligationListClient"),
            "TaxObligationListClient",
        ),
        form: lazyNamed(
            () => import("@/modules/payroll/tax/components/TaxObligationFormClient"),
            "TaxObligationFormClient",
        ),
    }),
    routeGroup({
        id: "leave-menu",
        label: "Férias e afastamentos",
        icon: CalendarDays,
        children: [
            tabbedCrudRoute({
                id: "leave",
                href: "/leave",
                label: "Férias",
                icon: CalendarDays,
                permission: "leave:read",
                routeId: "leave",
                tabShortLabel: "Férias",
                listToolbar: "Férias concedidas e histórico (CLT). Períodos aquisitivo e concessivo calculados pelo contrato.",
                list: lazyNamed(
                    () => import("@/modules/person/vacation/components/VacationListClient"),
                    "VacationListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/person/vacation/components/VacationRequestFormClient"),
                    "VacationRequestFormClient",
                ),
                extraTabs: [
                    {
                        id: "pending-requests",
                        label: "Solicitações do RH",
                        permission: "leave:write",
                        content: lazyNamed(
                            () => import("@/modules/person/leave/components/LeavePendingRequestsClient"),
                            "LeavePendingRequestsClient",
                        ),
                    },
                ],
            }),
            tabbedCrudRoute({
                id: "leave-absence",
                href: "/leave/absence",
                label: "Afastamento",
                icon: CalendarDays,
                permission: "leave:read",
                routeId: "leave-absence",
                tabShortLabel: "Afast.",
                list: lazyNamed(
                    () => import("@/modules/person/leave/components/LeaveAbsenceListClient"),
                    "LeaveAbsenceListClient",
                ),
                form: lazyNamed(
                    () => import("@/modules/person/leave/components/LeaveAbsenceFormClient"),
                    "LeaveAbsenceFormClient",
                ),
            }),
        ],
    }),
];
