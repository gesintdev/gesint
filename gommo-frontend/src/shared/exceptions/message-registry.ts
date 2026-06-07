import { AUTH_CLIENT_MESSAGES, AUTH_MESSAGES } from "@/modules/root/exceptions/auth.messages";
import {
  COLLABORATOR_CLIENT_MESSAGES,
  COLLABORATOR_MESSAGES,
} from "@/modules/person/collaborators/people/exceptions/collaborator.messages";
import { COMPANY_CLIENT_MESSAGES, COMPANY_MESSAGES } from "@/modules/company/exceptions/company.messages";
import { DEPARTMENT_CLIENT_MESSAGES, DEPARTMENT_MESSAGES } from "@/modules/organization/department/exceptions/department.messages";
import { JOBPOSITION_CLIENT_MESSAGES, JOBPOSITION_MESSAGES } from "@/modules/organization/jobposition/exceptions/jobposition.messages";
import {
  CONTRACT_CLIENT_MESSAGES,
  CONTRACT_MESSAGES,
} from "@/modules/person/contract/exceptions/employment-contract.messages";
import {
  ATTENDANCE_CLIENT_MESSAGES,
  ATTENDANCE_MESSAGES,
} from "@/modules/person/attendance/exceptions/attendance-record.messages";
import { LEAVE_CLIENT_MESSAGES, LEAVE_MESSAGES } from "@/modules/person/leave/exceptions/leave-request.messages";
import { PAYROLL_CLIENT_MESSAGES, PAYROLL_MESSAGES } from "@/modules/payroll/exceptions/payroll-run.messages";
import {
    PAYROLL_EVENT_CLIENT_MESSAGES,
    PAYROLL_EVENT_MESSAGES,
} from "@/modules/payroll/payroll-event/exceptions/payroll-event.messages";
import { PAYSLIP_CLIENT_MESSAGES, PAYSLIP_MESSAGES } from "@/modules/payroll/payslip/exceptions/payslip.messages";
import {
    PAYSLIP_ENTRY_CLIENT_MESSAGES,
    PAYSLIP_ENTRY_MESSAGES,
} from "@/modules/payroll/payslip-entry/exceptions/payslip-entry.messages";
import { BENEFIT_CLIENT_MESSAGES, BENEFIT_MESSAGES } from "@/modules/payroll/benefit/exceptions/benefit-plan.messages";
import {
  ADMISSION_CLIENT_MESSAGES,
  ADMISSION_MESSAGES,
} from "@/modules/person/collaborators/admission/exceptions/admission-process.messages";
import {
  OFFBOARDING_CLIENT_MESSAGES,
  OFFBOARDING_MESSAGES,
} from "@/modules/person/offboarding/exceptions/offboarding.messages";
import {
  EXITINTERVIEW_CLIENT_MESSAGES,
  EXITINTERVIEW_MESSAGES,
} from "@/modules/person/exitinterview/exceptions/exit-interview.messages";
import { CORE_MESSAGES } from "@/shared/exceptions/core.messages";

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
  ...PAYROLL_EVENT_MESSAGES,
  ...PAYROLL_EVENT_CLIENT_MESSAGES,
  ...PAYSLIP_MESSAGES,
  ...PAYSLIP_CLIENT_MESSAGES,
  ...PAYSLIP_ENTRY_MESSAGES,
  ...PAYSLIP_ENTRY_CLIENT_MESSAGES,
  ...BENEFIT_MESSAGES,
  ...BENEFIT_CLIENT_MESSAGES,
  ...ADMISSION_MESSAGES,
  ...ADMISSION_CLIENT_MESSAGES,
  ...OFFBOARDING_MESSAGES,
  ...OFFBOARDING_CLIENT_MESSAGES,
  ...EXITINTERVIEW_MESSAGES,
  ...EXITINTERVIEW_CLIENT_MESSAGES,
};

export function resolveMessageByCode(code: string | undefined, fallback: string): string {
  if (!code) return fallback;
  return REGISTRY[code] ?? fallback;
}

export function registerMessages(catalog: Record<string, string>): void {
  Object.assign(REGISTRY, catalog);
}
