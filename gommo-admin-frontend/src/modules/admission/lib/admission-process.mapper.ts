import type { AdmissionProcess, AdmissionProcessCreateDto } from "@/modules/admission/dto/admission-process.dto";
import { digitsOnly } from "@/shared/lib/input/digits";

function toDateInput(value?: string): string {
    return value?.slice(0, 10) ?? "";
}

export function admissionprocessToFormDto(entity: AdmissionProcess): AdmissionProcessCreateDto {
    return {
        admissionStatus: entity.admissionStatus,
        startedAt: toDateInput(entity.startedAt),
        notes: entity.notes ?? "",
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
        workloadHours: entity.workloadHours != null ? String(entity.workloadHours) : "",
    };
}

export const emptyAdmissionProcessForm = (): AdmissionProcessCreateDto => ({
    admissionStatus: "DRAFT",
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
});

export function admissionFormToPayload(form: AdmissionProcessCreateDto): AdmissionProcessCreateDto {
    return {
        ...form,
        cpf: digitsOnly(form.cpf),
        phone: form.phone ? digitsOnly(form.phone) : undefined,
        zipCode: form.zipCode ? digitsOnly(form.zipCode) : undefined,
        stateCode: form.stateCode?.trim().toUpperCase() || undefined,
        companyId: form.companyId?.trim() || undefined,
        departmentId: form.departmentId?.trim() || undefined,
        jobPositionId: form.jobPositionId?.trim() || undefined,
        socialName: form.socialName?.trim() || undefined,
        rg: form.rg?.trim() || undefined,
        rgIssuer: form.rgIssuer?.trim() || undefined,
        rgStateCode: form.rgStateCode?.trim().toUpperCase() || undefined,
        motherName: form.motherName?.trim() || undefined,
        fatherName: form.fatherName?.trim() || undefined,
        pisPasep: form.pisPasep?.trim() || undefined,
        email: form.email?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
        baseSalary: form.baseSalary != null ? Number(form.baseSalary) : undefined,
        workloadHours: form.workloadHours != null ? Number(form.workloadHours) : undefined,
    };
}
