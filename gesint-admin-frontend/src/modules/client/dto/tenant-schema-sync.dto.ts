export type TenantSchemaSyncResult = {
    schema: string;
    createdTables: string[];
    addedColumns: string[];
    createdIndexes: string[];
    warnings: string[];
};
