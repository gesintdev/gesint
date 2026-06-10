import { FileText, Gift, Receipt } from "lucide-react";
import type { AppRoute } from "@/modules/root/enum/ModuleEnum";

export const payrollRoutes: AppRoute[] = [
    {
        id: "payroll",
        label: "Folha",
        icon: Receipt,
        children: [
            { id: "payroll-run", label: "Processamento", href: "/payroll", icon: Receipt },
            { id: "payslip", label: "Holerites", href: "/payroll/payslips", icon: FileText },
        ],
    },
    { id: "benefit", label: "Benefícios", href: "/benefit", icon: Gift },
];
