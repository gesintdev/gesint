-- Alinha company_id da esteira de admissao com a admissao e com a matriz.
-- Etapas criadas pela V86 nasceram sem filial; admission_process pode ter recebido company_id
-- depois (manual ou app). Sem este backfill o filtro Hibernate esconde as etapas e o servico
-- tenta recriar linhas, violando uk_admission_step_code.

ALTER TABLE admission_process ADD COLUMN IF NOT EXISTS company_id UUID;

DO $$
DECLARE
    headquarters UUID;
BEGIN
    SELECT id INTO headquarters FROM company WHERE is_headquarters AND status <> 'DELETED' LIMIT 1;
    IF headquarters IS NULL THEN
        SELECT id INTO headquarters FROM company WHERE status <> 'DELETED' ORDER BY created_at, code LIMIT 1;
    END IF;
    IF headquarters IS NULL THEN
        RETURN;
    END IF;

    UPDATE admission_process
       SET company_id = headquarters
     WHERE company_id IS NULL
       AND status <> 'DELETED';

    IF to_regclass('admission_step') IS NOT NULL THEN
        UPDATE admission_step s
           SET company_id = ap.company_id
          FROM admission_process ap
         WHERE s.admission_id = ap.id
           AND ap.company_id IS NOT NULL
           AND (s.company_id IS NULL OR s.company_id <> ap.company_id);
    END IF;

    IF to_regclass('esocial_event') IS NOT NULL THEN
        UPDATE esocial_event e
           SET company_id = ap.company_id
          FROM admission_process ap
         WHERE e.admission_id = ap.id
           AND ap.company_id IS NOT NULL
           AND (e.company_id IS NULL OR e.company_id <> ap.company_id);
    END IF;
END $$;

DO $sync_admission_branch_scope$
DECLARE
    target_schema text;
    headquarters UUID;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.admission_process', target_schema)) IS NULL THEN
            CONTINUE;
        END IF;

        EXECUTE format(
            'ALTER TABLE %I.admission_process ADD COLUMN IF NOT EXISTS company_id UUID',
            target_schema
        );

        EXECUTE format(
            'SELECT id FROM %I.company WHERE is_headquarters AND status <> ''DELETED'' LIMIT 1',
            target_schema
        ) INTO headquarters;

        IF headquarters IS NULL THEN
            EXECUTE format(
                'SELECT id FROM %I.company WHERE status <> ''DELETED'' ORDER BY created_at, code LIMIT 1',
                target_schema
            ) INTO headquarters;
        END IF;

        IF headquarters IS NOT NULL THEN
            EXECUTE format(
                'UPDATE %I.admission_process SET company_id = $1 WHERE company_id IS NULL AND status <> ''DELETED''',
                target_schema
            ) USING headquarters;
        END IF;

        IF to_regclass(format('%I.admission_step', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                UPDATE %I.admission_step s
                   SET company_id = ap.company_id
                  FROM %I.admission_process ap
                 WHERE s.admission_id = ap.id
                   AND ap.company_id IS NOT NULL
                   AND (s.company_id IS NULL OR s.company_id <> ap.company_id)
                $sql$,
                target_schema,
                target_schema
            );
        END IF;

        IF to_regclass(format('%I.esocial_event', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                UPDATE %I.esocial_event e
                   SET company_id = ap.company_id
                  FROM %I.admission_process ap
                 WHERE e.admission_id = ap.id
                   AND ap.company_id IS NOT NULL
                   AND (e.company_id IS NULL OR e.company_id <> ap.company_id)
                $sql$,
                target_schema,
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_admission_branch_scope$;
