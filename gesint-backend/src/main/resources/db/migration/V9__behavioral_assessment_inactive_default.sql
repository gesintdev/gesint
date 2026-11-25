-- Avaliacao Comportamental desativada por padrao no kanban de admissao.
UPDATE public.admission_process_kanban_column
SET status = 'INACTIVE',
    updated_at = now()
WHERE column_key = 'behavioral_assessment'
  AND status = 'ACTIVE';

DO $$
DECLARE
    tenant_schema TEXT;
BEGIN
    FOR tenant_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gesint_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.admission_process_kanban_column', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        EXECUTE format(
            $sql$
            UPDATE %I.admission_process_kanban_column
            SET status = 'INACTIVE',
                updated_at = now()
            WHERE column_key = 'behavioral_assessment'
              AND status = 'ACTIVE'
            $sql$,
            tenant_schema
        );
    END LOOP;
END
$$;

SELECT public.gesint_audit_sync_table('admission_process_kanban_column');
