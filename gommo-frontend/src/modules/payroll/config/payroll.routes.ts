import type { AppRoute } from "@/modules/root/enum/ModuleEnum";
import {FileText, Gift, Receipt, Scale, UserCheck} from "lucide-react";

export const payrollRoutes: AppRoute[] = [
    {
        id: "payroll",
        label: "Folha",
        icon: Receipt,
        children: [
            {id: "payroll-run", label: "Processamento", href: "/payroll", icon: Receipt},
            {id: "payslip", label: "Holerites", href: "/payroll/payslips", icon: FileText},
        ],
    },
    {
        id: "benefit",
        label: "Benefícios",
        icon: Gift,
        children: [
            {id: "benefit-plan", label: "Planos", href: "/benefit", icon: Gift},
            {id: "benefit-enrollment", label: "Vínculos", href: "/benefit/enrollments", icon: UserCheck},
        ],
    },
    {id: "tax", label: "Fiscal", href: "/tax", icon: Scale},
]