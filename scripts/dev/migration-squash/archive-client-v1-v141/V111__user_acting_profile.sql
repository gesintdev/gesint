-- Vinculo usuario x perfil de atuacao x filial (espelha user_role).
-- company_id nulo = legado/global (todas as filiais); chave propria por causa do nulo.

CREATE TABLE IF NOT EXISTS user_acting_profile (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL,
    acting_profile_id  UUID NOT NULL,
    company_id         UUID
);

CREATE INDEX IF NOT EXISTS idx_user_acting_profile_user
    ON user_acting_profile (user_id);

CREATE INDEX IF NOT EXISTS idx_user_acting_profile_company
    ON user_acting_profile (company_id);

CREATE UNIQUE INDEX IF NOT EXISTS uk_user_acting_profile_user_profile_company
    ON user_acting_profile (
        user_id,
        acting_profile_id,
        COALESCE(company_id, '00000000-0000-0000-0000-000000000000'::uuid)
    );

-- Espelha em TODOS os schemas que ja tem user_role (nao so tenant_%).
DO $sync_user_acting_profile$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gesint_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.user_role', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        IF to_regclass(format('%I.user_acting_profile', target_schema)) IS NULL
           AND to_regclass('public.user_acting_profile') IS NOT NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.user_acting_profile (LIKE public.user_acting_profile INCLUDING ALL)',
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_user_acting_profile$;
