export type OccupationalPhysicianRole = "EXAMINER" | "PCMSO_COORDINATOR";

export class OccupationalPhysician {
    id!: string;
    code!: number;
    status!: string;
    fullName!: string;
    crm!: string;
    crmState!: string;
    role!: OccupationalPhysicianRole;
    clinicId?: string;
    phone?: string;
    email?: string;
}

export class OccupationalPhysicianCreateDto {
    fullName!: string;
    crm!: string;
    crmState!: string;
    role!: OccupationalPhysicianRole;
    clinicId?: string;
    phone?: string;
    email?: string;
}
