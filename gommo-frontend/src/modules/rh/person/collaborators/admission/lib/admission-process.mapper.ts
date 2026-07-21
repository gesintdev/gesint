import type {
    AdmissionEmergencyContact,
    AdmissionProcess,
    AdmissionProcessCreateDto,
} from "@/modules/rh/person/collaborators/admission/dto/admission-process.dto";
import { normalizeEmergencyContacts } from "@/modules/rh/person/collaborators/admission/lib/admission-emergency-contacts.util";
import { digitsOnly } from "@/shared/lib/input/digits";

const ADMISSION_STEP_IDS = [
    "dados-basicos",
    "contatos-emergencia",
    "endereco",
    "documentos",
    "vinculo",
    "contrato",
    "observacoes",
];

function toDateInput(value?: string): string {
    return value?.slice(0, 10) ?? "";
}

export function admissionprocessToFormDto(entity: AdmissionProcess): AdmissionProcessCreateDto {
    return {
        admissionStatus: entity.admissionStatus,
        startedAt: toDateInput(entity.startedAt),
        notes: entity.notes ?? "",
        photoObjectId: entity.photoObjectId ?? "",
        fullName: entity.fullName ?? "",
        socialName: entity.socialName ?? "",
        cpf: entity.cpf ?? "",
        rg: entity.rg ?? "",
        rgIssuer: entity.rgIssuer ?? "",
        rgStateCode: entity.rgStateCode ?? "",
        birthDate: toDateInput(entity.birthDate),
        gender: entity.gender,
        maritalStatus: entity.maritalStatus,
        motherName: entity.motherName ?? "",
        fatherName: entity.fatherName ?? "",
        nationality: entity.nationality ?? "Brasileiro",
        pisPasep: entity.pisPasep ?? "",
        email: entity.email ?? "",
        phone: entity.phone ?? "",
        zipCode: entity.zipCode ?? "",
        street: entity.street ?? "",
        number: entity.number ?? "",
        complement: entity.complement ?? "",
        district: entity.district ?? "",
        cityId: entity.cityId ?? "",
        stateId: entity.stateId ?? "",
        expectedStartDate: toDateInput(entity.expectedStartDate),
        companyId: entity.companyId ?? "",
        departmentId: entity.departmentId ?? "",
        jobPositionId: entity.jobPositionId ?? "",
        contractType: entity.contractType ?? "CLT",
        baseSalary: entity.baseSalary != null ? String(entity.baseSalary) : "",
        workloadSchedule: entity.workloadSchedule ?? "",
        workScheduleId: entity.workScheduleId ?? "",
        emergencyContacts: normalizeEmergencyContacts(entity.emergencyContacts),
        contractStartDate: toDateInput(entity.contractStartDate),
        contractEndDate: toDateInput(entity.contractEndDate),
        providerCnpj: entity.providerCnpj ?? "",
        providerLegalName: entity.providerLegalName ?? "",
        providerTradeName: entity.providerTradeName ?? "",
        recessEnabled: entity.recessEnabled ?? false,
        recessTotalDaysPerCycle: entity.recessTotalDaysPerCycle ?? "",
        recessCycleMonths: entity.recessCycleMonths ?? "",
        recessEligibilityAfterMonths: entity.recessEligibilityAfterMonths ?? "",
        recessFinancialMode: entity.recessFinancialMode,
        recessPaidPercentage: entity.recessPaidPercentage ?? "",
        recessAllowSplit: entity.recessAllowSplit ?? false,
        recessMaxSplitPeriods: entity.recessMaxSplitPeriods ?? "",
        recessMinimumSplitDays: entity.recessMinimumSplitDays ?? "",
        recessAdvanceNoticeDays: entity.recessAdvanceNoticeDays ?? 0,
        recessNotes: entity.recessNotes ?? "",
    };
}

export const emptyAdmissionProcessForm = (): AdmissionProcessCreateDto => ({
    admissionStatus: "IN_PROGRESS",
    startedAt: new Date().toISOString().slice(0, 10),
    notes: "",
    fullName: "",
    socialName: "",
    cpf: "",
    rg: "",
    rgIssuer: "",
    rgStateCode: "",
    birthDate: "",
    nationality: "Brasileiro",
    expectedStartDate: "",
    contractType: "CLT",
    companyId: "",
    departmentId: "",
    jobPositionId: "",
    cityId: "",
    stateId: "",
    workloadSchedule: "",
    workScheduleId: "",
    emergencyContacts: normalizeEmergencyContacts(),
    contractStartDate: "",
    contractEndDate: "",
    providerCnpj: "",
    providerLegalName: "",
    providerTradeName: "",
    recessEnabled: false,
    recessTotalDaysPerCycle: "",
    recessCycleMonths: "",
    recessEligibilityAfterMonths: "",
    recessPaidPercentage: "",
    recessAllowSplit: false,
    recessMaxSplitPeriods: "",
    recessMinimumSplitDays: "",
    recessAdvanceNoticeDays: 0,
    recessNotes: "",
});

export function admissionFormToPayload(form: AdmissionProcessCreateDto): AdmissionProcessCreateDto {
    const emergencyContacts = sanitizeEmergencyContacts(form.emergencyContacts);
    return {
        ...form,
        cpf: digitsOnly(form.cpf),
        phone: form.phone ? digitsOnly(form.phone) : undefined,
        zipCode: form.zipCode ? digitsOnly(form.zipCode) : undefined,
        emergencyContacts,
        cityId: form.cityId?.trim() || undefined,
        stateId: form.stateId?.trim() || undefined,
        companyId: form.companyId?.trim() || undefined,
        departmentId: form.departmentId?.trim() || undefined,
        jobPositionId: form.jobPositionId?.trim() || undefined,
        socialName: form.socialName?.trim() || undefined,
        rg: form.rg?.trim() ? digitsOnly(form.rg).slice(0, 7) : undefined,
        rgIssuer: form.rgIssuer?.trim() || undefined,
        rgStateCode: form.rgStateCode?.trim().toUpperCase() || undefined,
        motherName: form.motherName?.trim() || undefined,
        fatherName: form.fatherName?.trim() || undefined,
        pisPasep: form.pisPasep?.trim() || undefined,
        email: form.email?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
        photoObjectId: form.photoObjectId?.trim() || undefined,
        workloadSchedule: form.workloadSchedule?.trim() || undefined,
        workScheduleId: form.workScheduleId?.trim() || undefined,
        contractStartDate: form.contractStartDate || undefined,
        contractEndDate: form.contractEndDate || undefined,
        providerCnpj: form.providerCnpj ? digitsOnly(form.providerCnpj) : undefined,
        providerLegalName: form.providerLegalName?.trim() || undefined,
        providerTradeName: form.providerTradeName?.trim() || undefined,
        baseSalary: form.baseSalary != null && form.baseSalary !== "" ? Number(form.baseSalary) : undefined,
        recessTotalDaysPerCycle: toOptionalNumber(form.recessTotalDaysPerCycle),
        recessCycleMonths: toOptionalNumber(form.recessCycleMonths),
        recessEligibilityAfterMonths: toOptionalNumber(form.recessEligibilityAfterMonths),
        recessPaidPercentage: toOptionalNumber(form.recessPaidPercentage),
        recessMaxSplitPeriods: toOptionalNumber(form.recessMaxSplitPeriods),
        recessMinimumSplitDays: toOptionalNumber(form.recessMinimumSplitDays),
        recessAdvanceNoticeDays: toOptionalNumber(form.recessAdvanceNoticeDays) ?? 0,
        recessNotes: form.recessNotes?.trim() || undefined,
    };
}

function toOptionalNumber(value?: string | number): number | undefined {
    return value == null || value === "" ? undefined : Number(value);
}

function sanitizeEmergencyContacts(contacts?: AdmissionEmergencyContact[]): AdmissionEmergencyContact[] {
    return (contacts ?? [])
        .map((contact) => ({
            name: contact.name?.trim() ?? "",
            phone: contact.phone ? digitsOnly(contact.phone) : "",
            relationship: contact.relationship?.trim() || undefined,
        }))
        .filter((contact) => contact.name || contact.phone || contact.relationship);
}

export { ADMISSION_STEP_IDS };
