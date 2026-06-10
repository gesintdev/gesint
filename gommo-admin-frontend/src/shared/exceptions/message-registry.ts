import {
    JOBPOSITION_CLIENT_MESSAGES,
    JOBPOSITION_MESSAGES,
} from "@/modules/jobposition/exceptions/jobposition.messages";
import { ADMIN_USER_MESSAGES } from "@/modules/adminuser/exceptions/adminuser.messages";
import {
    ADMISSION_CLIENT_MESSAGES,
    ADMISSION_MESSAGES,
} from "@/modules/admission/exceptions/admission-process.messages";
import {
    ATTENDANCE_CLIENT_MESSAGES,
    ATTENDANCE_MESSAGES,
} from "@/modules/attendance/exceptions/attendance-record.messages";
import { BENEFIT_CLIENT_MESSAGES, BENEFIT_MESSAGES } from "@/modules/benefit/exceptions/benefit-plan.messages";
import { CLIENT_USER_MESSAGES } from "@/modules/clientuser/exceptions/clientuser.messages";
import {
    COLLABORATOR_CLIENT_MESSAGES,
    COLLABORATOR_MESSAGES,
} from "@/modules/collaborator/exceptions/collaborator.messages";
import { COMPANY_CLIENT_MESSAGES, COMPANY_MESSAGES } from "@/modules/company/exceptions/company.messages";
import {
    CONTRACT_CLIENT_MESSAGES,
    CONTRACT_MESSAGES,
} from "@/modules/contract/exceptions/employment-contract.messages";
import { DEPARTMENT_CLIENT_MESSAGES, DEPARTMENT_MESSAGES } from "@/modules/department/exceptions/department.messages";
import {
    EXITINTERVIEW_CLIENT_MESSAGES,
    EXITINTERVIEW_MESSAGES,
} from "@/modules/exitinterview/exceptions/exit-interview.messages";
import { LEAVE_CLIENT_MESSAGES, LEAVE_MESSAGES } from "@/modules/leave/exceptions/leave-request.messages";
import {
    OFFBOARDING_CLIENT_MESSAGES,
    OFFBOARDING_MESSAGES,
} from "@/modules/offboarding/exceptions/offboarding.messages";
import { PAYROLL_CLIENT_MESSAGES, PAYROLL_MESSAGES } from "@/modules/payroll/exceptions/payroll-run.messages";
import { PAYSLIP_CLIENT_MESSAGES, PAYSLIP_MESSAGES } from "@/modules/payslip/exceptions/payslip.messages";
import { AUTH_CLIENT_MESSAGES, AUTH_MESSAGES } from "@/modules/root/exceptions/auth.messages";
import { CORE_MESSAGES } from "@/shared/exceptions/core.messages";
import { formatValidationMessage } from "@/shared/exceptions/validation-message";

const REGISTRY: Record<string, string> = {
    ...CORE_MESSAGES,
    ...AUTH_MESSAGES,
    ...AUTH_CLIENT_MESSAGES,
    ...COLLABORATOR_MESSAGES,
    ...COLLABORATOR_CLIENT_MESSAGES,
    ...COMPANY_MESSAGES,
    ...COMPANY_CLIENT_MESSAGES,
    ...DEPARTMENT_MESSAGES,
    ...DEPARTMENT_CLIENT_MESSAGES,
    ...JOBPOSITION_MESSAGES,
    ...JOBPOSITION_CLIENT_MESSAGES,
    ...CONTRACT_MESSAGES,
    ...CONTRACT_CLIENT_MESSAGES,
    ...ATTENDANCE_MESSAGES,
    ...ATTENDANCE_CLIENT_MESSAGES,
    ...LEAVE_MESSAGES,
    ...LEAVE_CLIENT_MESSAGES,
    ...PAYROLL_MESSAGES,
    ...PAYROLL_CLIENT_MESSAGES,
    ...PAYSLIP_MESSAGES,
    ...PAYSLIP_CLIENT_MESSAGES,
    ...BENEFIT_MESSAGES,
    ...BENEFIT_CLIENT_MESSAGES,
    ...ADMISSION_MESSAGES,
    ...ADMISSION_CLIENT_MESSAGES,
    ...OFFBOARDING_MESSAGES,
    ...OFFBOARDING_CLIENT_MESSAGES,
    ...EXITINTERVIEW_MESSAGES,
    ...EXITINTERVIEW_CLIENT_MESSAGES,
    ...CLIENT_USER_MESSAGES,
    ...ADMIN_USER_MESSAGES,
};

export function resolveMessageByCode(code: string | undefined, fallback: string): string {
    if (!code) return fallback;
    if (code === "VALIDATION_ERROR") {
        return formatValidationMessage(fallback);
    }
    return REGISTRY[code] ?? fallback;
}

export function registerMessages(catalog: Record<string, string>): void {
    Object.assign(REGISTRY, catalog);
}
