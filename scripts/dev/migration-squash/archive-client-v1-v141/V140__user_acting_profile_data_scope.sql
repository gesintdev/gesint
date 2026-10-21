-- T1 / RN-03: abrangência no vínculo user × atuação (override do template).

ALTER TABLE user_acting_profile
    ADD COLUMN IF NOT EXISTS data_scope VARCHAR(32),
    ADD COLUMN IF NOT EXISTS scope_ref UUID;

ALTER TABLE collaborator
    ADD COLUMN IF NOT EXISTS manager_collaborator_id UUID;

DO $sync_v140$
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
        IF to_regclass(format('%I.user_acting_profile', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.user_acting_profile '
                || 'ADD COLUMN IF NOT EXISTS data_scope VARCHAR(32), '
                || 'ADD COLUMN IF NOT EXISTS scope_ref UUID',
                target_schema);
        END IF;
        IF to_regclass(format('%I.collaborator', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.collaborator '
                || 'ADD COLUMN IF NOT EXISTS manager_collaborator_id UUID',
                target_schema);
        END IF;
    END LOOP;
END
$sync_v140$;

SELECT public.gesint_audit_sync_table('user_acting_profile');
SELECT public.gesint_audit_sync_table('collaborator');
