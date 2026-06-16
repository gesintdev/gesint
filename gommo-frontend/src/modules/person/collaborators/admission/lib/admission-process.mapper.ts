import type {
    AdmissionProcess,
    AdmissionProcessCreateDto,
    AdmissionEmergencyContact,
} from "@/modules/person/collaborators/admission/dto/admission-process.dto";
import { normalizeEmergencyContacts } from "@/modules/person/collaborators/admission/lib/admission-emergency-contacts.util";
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
        city: entity.city ?? "",
        stateCode: entity.stateCode ?? "",
        expectedStartDate: toDateInput(entity.expectedStartDate),
        companyId: entity.companyId ?? "",
        departmentId: entity.departmentId ?? "",
        jobPositionId: entity.jobPositionId ?? "",
        contractType: entity.contractType ?? "CLT",
        baseSalary: entity.baseSalary != null ? String(entity.baseSalary) : "",
        workloadSchedule: entity.workloadSchedule ?? "",
        emergencyContacts: normalizeEmergencyContacts(entity.emergencyContacts),
        contractStartDate: toDateInput(entity.contractStartDate),
        contractEndDate: toDateInput(entity.contractEndDate),
        providerCnpj: entity.providerCnpj ?? "",
        providerLegalName: entity.providerLegalName ?? "",
        providerTradeName: entity.providerTradeName ?? "",
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
    workloadSchedule: "",
    emergencyContacts: normalizeEmergencyContacts(),
    contractStartDate: "",
    contractEndDate: "",
    providerCnpj: "",
    providerLegalName: "",
    providerTradeName: "",
});

export function admissionFormToPayload(
    form: AdmissionProcessCreateDto,
): AdmissionProcessCreateDto {
    const emergencyContacts = sanitizeEmergencyContacts(form.emergencyContacts);
    return {
        ...form,
        cpf: digitsOnly(form.cpf),
        phone: form.phone ? digitsOnly(form.phone) : undefined,
        zipCode: form.zipCode ? digitsOnly(form.zipCode) : undefined,
        emergencyContacts,
        stateCode: form.stateCode?.trim().toUpperCase() || undefined,
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
        contractStartDate: form.contractStartDate || undefined,
        contractEndDate: form.contractEndDate || undefined,
        providerCnpj: form.providerCnpj ? digitsOnly(form.providerCnpj) : undefined,
        providerLegalName: form.providerLegalName?.trim() || undefined,
        providerTradeName: form.providerTradeName?.trim() || undefined,
        baseSalary: form.baseSalary != null && form.baseSalary !== "" ? Number(form.baseSalary) : undefined,
    };
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
