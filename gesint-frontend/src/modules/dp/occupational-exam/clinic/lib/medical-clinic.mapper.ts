import type {
    MedicalClinic,
    MedicalClinicCreateDto,
} from "@/modules/dp/occupational-exam/clinic/dto/medical-clinic.dto";
import { digitsOnly } from "@/shared/lib/input/digits";

export function emptyMedicalClinicForm(): MedicalClinicCreateDto {
    return {
        corporateName: "",
        cnpj: "",
        address: "",
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
        address: entity.address ?? "",
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
        address: form.address?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        email: form.email?.trim() || undefined,
        examsOffered: form.examsOffered?.trim() || undefined,
        accreditationValidUntil: form.accreditationValidUntil?.trim() || undefined,
    };
}
