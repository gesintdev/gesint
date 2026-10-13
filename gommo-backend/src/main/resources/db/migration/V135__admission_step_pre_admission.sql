-- RN-38: etapa Pre-admissao na esteira (usa o valor criado em V134, ja commitado).

-- Reordena etapas existentes: Pre-admissao ocupa a ordem 1.
UPDATE admission_step
SET display_order = CASE step_key::text
    WHEN 'DOCUMENTACAO' THEN 2
    WHEN 'EXAME' THEN 3
    WHEN 'CONTRATO' THEN 4
    WHEN 'REGISTRO' THEN 5
    WHEN 'ESOCIAL' THEN 6
    WHEN 'INTEGRACAO' THEN 7
    ELSE display_order
END
WHERE step_key::text IN ('DOCUMENTACAO', 'EXAME', 'CONTRATO', 'REGISTRO', 'ESOCIAL', 'INTEGRACAO');

INSERT INTO admission_step (code, admission_id, step_key, step_status, display_order)
SELECT
    (SELECT COALESCE(MAX(s2.code), 0) FROM admission_step s2) + row_number() OVER (ORDER BY ap.created_at, ap.id),
    ap.id,
    'PRE_ADMISSAO'::gommo_types.admission_step_key_enum,
    'IN_PROGRESS'::gommo_types.admission_step_status_enum,
    1
FROM admission_process ap
WHERE ap.status <> 'DELETED'
  AND NOT EXISTS (
        SELECT 1
        FROM admission_step s
        WHERE s.admission_id = ap.id
          AND s.step_key = 'PRE_ADMISSAO'::gommo_types.admission_step_key_enum
          AND s.status <> 'DELETED'
  );

DO $sync_v135$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gommo_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.permission', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        IF to_regclass(format('%I.admission_step', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                UPDATE %I.admission_step
                SET display_order = CASE step_key::text
                    WHEN 'DOCUMENTACAO' THEN 2
                    WHEN 'EXAME' THEN 3
                    WHEN 'CONTRATO' THEN 4
                    WHEN 'REGISTRO' THEN 5
                    WHEN 'ESOCIAL' THEN 6
                    WHEN 'INTEGRACAO' THEN 7
                    ELSE display_order
                END
                WHERE step_key::text IN ('DOCUMENTACAO', 'EXAME', 'CONTRATO', 'REGISTRO', 'ESOCIAL', 'INTEGRACAO')
                $sql$,
                target_schema);

            EXECUTE format(
                $sql$
                INSERT INTO %I.admission_step (code, admission_id, step_key, step_status, display_order)
                SELECT
                    (SELECT COALESCE(MAX(s2.code), 0) FROM %I.admission_step s2)
                        + row_number() OVER (ORDER BY ap.created_at, ap.id),
                    ap.id,
                    'PRE_ADMISSAO'::gommo_types.admission_step_key_enum,
                    'IN_PROGRESS'::gommo_types.admission_step_status_enum,
                    1
                FROM %I.admission_process ap
                WHERE ap.status <> 'DELETED'
                  AND NOT EXISTS (
                        SELECT 1
                        FROM %I.admission_step s
                        WHERE s.admission_id = ap.id
                          AND s.step_key = 'PRE_ADMISSAO'::gommo_types.admission_step_key_enum
                          AND s.status <> 'DELETED'
                  )
                $sql$,
                target_schema,
                target_schema,
                target_schema,
                target_schema);
        END IF;
    END LOOP;
END
$sync_v135$;

SELECT public.gommo_audit_sync_table('admission_step');
