import type {
    ActingProfile,
    ActingProfileCreateDto,
    DataScope,
    SystemScope,
} from "@/modules/cfg/settings/actingprofile/dto/acting-profile.dto";

export function emptyActingProfileForm(system: SystemScope = "RH"): ActingProfileCreateDto {
    return {
        name: "",
        description: "",
        system,
        dataScope: "ALL",
        scopeRef: null,
    };
}

export function actingProfileToFormDto(profile: ActingProfile): ActingProfileCreateDto {
    return {
        name: profile.name,
        description: profile.description ?? "",
        system: profile.system,
        dataScope: profile.dataScope,
        scopeRef: profile.scopeRef ?? null,
    };
}

export function normalizeActingProfileDto(dto: ActingProfileCreateDto): ActingProfileCreateDto {
    const dataScope: DataScope = dto.dataScope;
    return {
        name: dto.name.trim(),
        description: dto.description?.trim() || undefined,
        system: dto.system,
        dataScope,
        scopeRef: dataScope === "DEPARTMENT" ? (dto.scopeRef ?? null) : null,
    };
}
