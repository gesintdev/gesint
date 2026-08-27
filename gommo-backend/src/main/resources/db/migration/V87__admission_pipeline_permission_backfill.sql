-- V86 concedeu admission:pipeline apenas aos perfis de sistema ADMIN e HR, deixando de fora
-- os perfis criados pelo cliente — inclusive os de acesso total, que na pratica ja enxergam
-- tudo de admissao. O efeito era a aba Acompanhamento sumir para quem deveria ve-la.
--
-- Criterio: quem ja pode ler admissoes passa a poder acompanhar a esteira. A permissao e de
-- leitura e nao expoe nada alem do que a listagem de admissoes ja mostra.

INSERT INTO role_permission (role_id, permission_id)
SELECT rp.role_id, target.id
FROM role_permission rp
INNER JOIN permission source ON source.id = rp.permission_id AND source.authority = 'admission:read'
CROSS JOIN permission target
WHERE target.authority = 'admission:pipeline'
ON CONFLICT DO NOTHING;

DO $sync_admission_pipeline_grant$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.role_permission', target_schema)) IS NULL
           OR to_regclass(format('%I.permission', target_schema)) IS NULL THEN
            CONTINUE;
        END IF;

        EXECUTE format(
            $sql$
            INSERT INTO %I.role_permission (role_id, permission_id)
            SELECT rp.role_id, target.id
            FROM %I.role_permission rp
            INNER JOIN %I.permission source
                ON source.id = rp.permission_id AND source.authority = 'admission:read'
            CROSS JOIN %I.permission target
            WHERE target.authority = 'admission:pipeline'
            ON CONFLICT DO NOTHING
            $sql$,
            target_schema,
            target_schema,
            target_schema,
            target_schema
        );
    END LOOP;
END
$sync_admission_pipeline_grant$;
