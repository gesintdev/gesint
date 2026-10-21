/**
 * Espelho de PermissionModuleCatalog (backend) para wildcards ADM:{sistema} no FE.
 * Ao adicionar modulo no catalogo Java, espelhar aqui.
 */
const MODULES_BY_SYSTEM: Record<string, ReadonlySet<string>> = {
    CFG: new Set([
        "role",
        "actingprofile",
        "user",
        "workschedule",
        "digitalcertificate",
        "documenttype",
        "admission",
        "exitinterview",
        "developmentplanconfig",
        "attendance",
        "notification",
        "careerspage",
        "audit",
    ]),
    DP: new Set([
        "company",
        "department",
        "jobposition",
        "workschedule",
        "payment",
        "collaborator",
        "admission",
        "offboarding",
        "occupationalexam",
        "notification",
        "agenda",
        "attendance",
        "leave",
        "storage",
    ]),
    CONTABILIDADE: new Set([
        "payroll",
        "payrollevent",
        "payslip",
        "benefit",
        "benefitenrollment",
        "tax",
        "notification",
        "agenda",
        "storage",
    ]),
    RH: new Set([
        "collaborator",
        "admission",
        "exitinterview",
        "contract",
        "leave",
        "performance",
        "jobvacancy",
        "jobrequisition",
        "candidate",
        "jobvacancyapplication",
        "experience",
        "developmentplan",
        "notification",
        "agenda",
        "storage",
    ]),
};

/** Espelho de EXPLICIT_GRANT_ONLY_MODULES: fora do acesso dinamico ADM:{sistema}. */
const EXPLICIT_GRANT_ONLY_MODULES: ReadonlySet<string> = new Set(["audit"]);

const SYSTEM_ADMIN_PREFIX = "ADM:";

export function isSystemAdminMarker(authority: string): boolean {
    return authority.startsWith(SYSTEM_ADMIN_PREFIX) && authority.length > SYSTEM_ADMIN_PREFIX.length;
}

export function systemFromAdminMarker(authority: string): string | null {
    if (!isSystemAdminMarker(authority)) return null;
    return authority.slice(SYSTEM_ADMIN_PREFIX.length);
}

export function moduleCoveredBySystemAdmin(
    granted: readonly string[],
    permission: string,
): boolean {
    const module = permission.includes(":") ? permission.slice(0, permission.indexOf(":")) : permission;
    if (!module || EXPLICIT_GRANT_ONLY_MODULES.has(module)) return false;
    for (const authority of granted) {
        const system = systemFromAdminMarker(authority);
        if (!system) continue;
        if (MODULES_BY_SYSTEM[system]?.has(module)) return true;
    }
    return false;
}
