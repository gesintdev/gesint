import type {
    OccupationalPhysician,
    OccupationalPhysicianCreateDto,
} from "@/modules/rh/person/occupational-exam/physician/dto/occupational-physician.dto";

export function emptyOccupationalPhysicianForm(): OccupationalPhysicianCreateDto {
    return {
        fullName: "",
        crm: "",
        crmState: "",
        role: "EXAMINER",
        clinicId: "",
        phone: "",
        email: "",
    };
}

export function occupationalPhysicianToFormDto(entity: OccupationalPhysician): OccupationalPhysicianCreateDto {
    return {
        fullName: entity.fullName,
        crm: entity.crm,
        crmState: entity.crmState,
        role: entity.role,
        clinicId: entity.clinicId ?? "",
        phone: entity.phone ?? "",
        email: entity.email ?? "",
    };
}

export function occupationalPhysicianToRequestDto(
    form: OccupationalPhysicianCreateDto,
): OccupationalPhysicianCreateDto {
    return {
        fullName: form.fullName.trim(),
        crm: form.crm.trim(),
        crmState: form.crmState.trim().toUpperCase(),
        role: form.role,
        clinicId: form.clinicId?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        email: form.email?.trim() || undefined,
    };
}
