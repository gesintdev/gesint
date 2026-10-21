-- Alinha company_id do indice de busca com a entidade indexada.
-- Documentos de cargo/departamento compartilhados devem ter company_id nulo; ao mudar o escopo
-- sem este backfill o filtro Hibernate esconde a linha antiga e o indexer tenta inserir outra.

DO $$
BEGIN
    IF to_regclass('search_document') IS NULL THEN
        RETURN;
    END IF;

    UPDATE search_document sd
       SET company_id = jp.company_id
      FROM job_position jp
     WHERE sd.document_type = 'JOB_POSITION'
       AND sd.entity_id = jp.id
       AND sd.status <> 'DELETED'
       AND (sd.company_id IS DISTINCT FROM jp.company_id);

    IF to_regclass('department') IS NOT NULL THEN
        UPDATE search_document sd
           SET company_id = d.company_id
          FROM department d
         WHERE sd.document_type = 'DEPARTMENT'
           AND sd.entity_id = d.id
           AND sd.status <> 'DELETED'
           AND (sd.company_id IS DISTINCT FROM d.company_id);
    END IF;

    IF to_regclass('admission_process') IS NOT NULL THEN
        UPDATE search_document sd
           SET company_id = ap.company_id
          FROM admission_process ap
         WHERE sd.document_type = 'ADMISSION'
           AND sd.entity_id = ap.id
           AND sd.status <> 'DELETED'
           AND ap.company_id IS NOT NULL
           AND (sd.company_id IS DISTINCT FROM ap.company_id);
    END IF;

    IF to_regclass('collaborator') IS NOT NULL THEN
        UPDATE search_document sd
           SET company_id = c.company_id
          FROM collaborator c
         WHERE sd.document_type = 'PERSON'
           AND sd.entity_id = c.id
           AND sd.status <> 'DELETED'
           AND c.company_id IS NOT NULL
           AND (sd.company_id IS DISTINCT FROM c.company_id);
    END IF;
END $$;

DO $sync_search_document_branch_scope$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.search_document', target_schema)) IS NULL THEN
            CONTINUE;
        END IF;

        IF to_regclass(format('%I.job_position', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                UPDATE %I.search_document sd
                   SET company_id = jp.company_id
                  FROM %I.job_position jp
                 WHERE sd.document_type = 'JOB_POSITION'
                   AND sd.entity_id = jp.id
                   AND sd.status <> 'DELETED'
                   AND (sd.company_id IS DISTINCT FROM jp.company_id)
                $sql$,
                target_schema,
                target_schema
            );
        END IF;

        IF to_regclass(format('%I.department', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                UPDATE %I.search_document sd
                   SET company_id = d.company_id
                  FROM %I.department d
                 WHERE sd.document_type = 'DEPARTMENT'
                   AND sd.entity_id = d.id
                   AND sd.status <> 'DELETED'
                   AND (sd.company_id IS DISTINCT FROM d.company_id)
                $sql$,
                target_schema,
                target_schema
            );
        END IF;

        IF to_regclass(format('%I.admission_process', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                UPDATE %I.search_document sd
                   SET company_id = ap.company_id
                  FROM %I.admission_process ap
                 WHERE sd.document_type = 'ADMISSION'
                   AND sd.entity_id = ap.id
                   AND sd.status <> 'DELETED'
                   AND ap.company_id IS NOT NULL
                   AND (sd.company_id IS DISTINCT FROM ap.company_id)
                $sql$,
                target_schema,
                target_schema
            );
        END IF;

        IF to_regclass(format('%I.collaborator', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                UPDATE %I.search_document sd
                   SET company_id = c.company_id
                  FROM %I.collaborator c
                 WHERE sd.document_type = 'PERSON'
                   AND sd.entity_id = c.id
                   AND sd.status <> 'DELETED'
                   AND c.company_id IS NOT NULL
                   AND (sd.company_id IS DISTINCT FROM c.company_id)
                $sql$,
                target_schema,
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_search_document_branch_scope$;
