import type { TenantSchemaSyncResult } from "@/modules/client/dto/tenant-schema-sync.dto";

function pluralize(count: number, singular: string, plural: string): string {
    return `${count} ${count === 1 ? singular : plural}`;
}

export function formatTenantSchemaSyncSummary(result: TenantSchemaSyncResult): string {
    const changes: string[] = [];
    const tables = result.createdTables?.length ?? 0;
    const columns = result.addedColumns?.length ?? 0;
    const indexes = result.createdIndexes?.length ?? 0;

    if (tables > 0) changes.push(pluralize(tables, "tabela", "tabelas"));
    if (columns > 0) changes.push(pluralize(columns, "coluna", "colunas"));
    if (indexes > 0) changes.push(pluralize(indexes, "índice", "índices"));

    if (changes.length === 0 && !(result.warnings?.length ?? 0)) {
        return `Schema ${result.schema}: estrutura já estava atualizada.`;
    }

    let message = `Schema ${result.schema}: ${changes.join(", ") || "sincronização concluída"}.`;
    const warnings = result.warnings?.length ?? 0;
    if (warnings > 0) {
        message += ` ${pluralize(warnings, "aviso", "avisos")}.`;
    }
    return message;
}

export function formatTenantSchemaSyncBatchSummary(results: TenantSchemaSyncResult[]): string {
    if (results.length === 0) {
        return "Nenhum tenant com schema dedicado estava pronto para sincronização.";
    }

    const withWarnings = results.filter((result) => (result.warnings?.length ?? 0) > 0).length;
    let message = pluralize(results.length, "tenant sincronizado", "tenants sincronizados");
    if (withWarnings > 0) {
        message += ` (${pluralize(withWarnings, "com aviso", "com avisos")})`;
    }
    message += ".";
    return message;
}

export function collectTenantSchemaSyncWarnings(results: TenantSchemaSyncResult[]): string[] {
    return results.flatMap((result) =>
        (result.warnings ?? []).map((warning) => `${result.schema}: ${warning}`),
    );
}
