-- Perfis ADMIN passam a usar marcador dinamico (ADM:{sistema}) em runtime.
-- Nao materializam mais role_permission; remove sync e limpa vinculos legados.

CREATE OR REPLACE FUNCTION public.gommo_sync_admin_profile_permissions()
RETURNS void
LANGUAGE sql
AS $$
    -- No-op: Administrador por sistema nao depende de role_permission.
    SELECT NULL;
$$;

-- Remove permissoes materializadas dos perfis ADMIN (acesso total agora e por role_type).
DELETE FROM role_permission rp
USING role r
WHERE rp.role_id = r.id
  AND r.role_type = 'ADMIN';

DO $clear_admin_role_permissions$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gommo_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.role_permission', n.nspname)) IS NOT NULL
          AND to_regclass(format('%I.role', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        EXECUTE format(
            $sql$
            DELETE FROM %I.role_permission rp
            USING %I.role r
            WHERE rp.role_id = r.id
              AND r.role_type = 'ADMIN'
            $sql$,
            target_schema,
            target_schema
        );
    END LOOP;
END
$clear_admin_role_permissions$;
