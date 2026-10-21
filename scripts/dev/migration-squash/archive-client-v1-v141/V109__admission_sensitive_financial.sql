-- Admissao: mesmo dado sensivel/financeiro do colaborador.
-- Ajusta descricoes curtas (hints da UI de perfil, alinhadas ao HTML RN-03).

INSERT INTO permission (id, code, module, authority, description) VALUES
    ('53000000-0000-0000-0000-000000000033', 10043, 'admission', 'admission:sensitive', 'raça/cor, PCD'),
    ('53000000-0000-0000-0000-000000000034', 10044, 'admission', 'admission:financial', 'dados bancários, salário')
ON CONFLICT (id) DO NOTHING;

UPDATE permission SET description = 'raça/cor, PCD'
WHERE authority = 'collaborator:sensitive';

UPDATE permission SET description = 'dados bancários, salário'
WHERE authority = 'collaborator:financial';

UPDATE permission SET description = 'CID, obs. médicas'
WHERE authority = 'leave:sensitive';

UPDATE permission SET description = 'clínico'
WHERE authority = 'occupationalexam:clinical';

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', p.id
FROM permission p
WHERE p.id IN (
    '53000000-0000-0000-0000-000000000033',
    '53000000-0000-0000-0000-000000000034'
)
ON CONFLICT DO NOTHING;

SELECT public.gesint_sync_admin_profile_permissions();

DO $sync_admission_sensitive$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gesint_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.permission', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        EXECUTE format(
            $sql$
            INSERT INTO %I.permission (id, code, authority, module, description)
            SELECT p.id, p.code, p.authority, p.module, p.description
            FROM public.permission p
            WHERE p.id IN (
                '53000000-0000-0000-0000-000000000033'::uuid,
                '53000000-0000-0000-0000-000000000034'::uuid
            )
            ON CONFLICT (id) DO NOTHING
            $sql$,
            target_schema
        );

        EXECUTE format(
            $sql$
            UPDATE %I.permission AS t
            SET description = p.description
            FROM public.permission p
            WHERE t.id = p.id
              AND p.authority IN (
                  'collaborator:sensitive',
                  'collaborator:financial',
                  'leave:sensitive',
                  'occupationalexam:clinical',
                  'admission:sensitive',
                  'admission:financial'
              )
            $sql$,
            target_schema
        );

        IF to_regclass(format('%I.role_permission', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.role_permission (role_id, permission_id)
                SELECT '00000000-0000-0000-0000-000000000001'::uuid, p.id
                FROM %I.permission p
                WHERE p.id IN (
                    '53000000-0000-0000-0000-000000000033'::uuid,
                    '53000000-0000-0000-0000-000000000034'::uuid
                )
                ON CONFLICT DO NOTHING
                $sql$,
                target_schema,
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_admission_sensitive$;
