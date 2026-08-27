-- V92 adicionou company_id em public.job_position, mas tenants ja provisionados nao recebem
-- colunas novas automaticamente. Espelha a coluna e o indice nos schemas tenant_* existentes.

DO $sync_job_position_company_id$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.job_position', target_schema)) IS NULL THEN
            CONTINUE;
        END IF;

        EXECUTE format(
            'ALTER TABLE %I.job_position ADD COLUMN IF NOT EXISTS company_id UUID',
            target_schema
        );
        EXECUTE format(
            'CREATE INDEX IF NOT EXISTS idx_job_position_company ON %I.job_position (company_id) WHERE status <> ''DELETED''',
            target_schema
        );
    END LOOP;
END
$sync_job_position_company_id$;
