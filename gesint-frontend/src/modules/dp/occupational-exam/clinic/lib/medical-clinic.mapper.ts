import type {
    MedicalClinic,
    MedicalClinicCreateDto,
} from "@/modules/dp/occupational-exam/clinic/dto/medical-clinic.dto";
import { digitsOnly } from "@/shared/lib/input/digits";

export function emptyMedicalClinicForm(): MedicalClinicCreateDto {
    return {
        corporateName: "",
        cnpj: "",
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        district: "",
        stateId: "",
        cityId: "",
        phone: "",
        email: "",
        examsOffered: "",
        accreditationValidUntil: "",
    };
}

export function medicalClinicToFormDto(entity: MedicalClinic): MedicalClinicCreateDto {
    return {
        corporateName: entity.corporateName,
        cnpj: entity.cnpj,
        zipCode: entity.zipCode ?? "",
        street: entity.street ?? "",
        number: entity.number ?? "",
        complement: entity.complement ?? "",
        district: entity.district ?? "",
        stateId: entity.stateId ?? "",
        cityId: entity.cityId ?? "",
        phone: entity.phone ?? "",
        email: entity.email ?? "",
        examsOffered: entity.examsOffered ?? "",
        accreditationValidUntil: entity.accreditationValidUntil ?? "",
    };
}

export function medicalClinicToRequestDto(form: MedicalClinicCreateDto): MedicalClinicCreateDto {
    return {
        corporateName: form.corporateName.trim(),
        cnpj: digitsOnly(form.cnpj),
        zipCode: form.zipCode ? digitsOnly(form.zipCode) : undefined,
        street: form.street?.trim() || undefined,
        number: form.number?.trim() || undefined,
        complement: form.complement?.trim() || undefined,
        district: form.district?.trim() || undefined,
        stateId: form.stateId?.trim() || undefined,
        cityId: form.cityId?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        email: form.email?.trim() || undefined,
        examsOffered: form.examsOffered?.trim() || undefined,
        accreditationValidUntil: form.accreditationValidUntil?.trim() || undefined,
    };
}
