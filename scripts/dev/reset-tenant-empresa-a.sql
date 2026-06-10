-- Reset dev: remove todos os dados de teste da Empresa A (tenant + vinculos admin).
--
-- Mantem o registro admin.client (Empresa A), mas volta o provisionamento para PENDING.
-- Remove usuarios de cliente, assinaturas, pagamentos e o schema tenant_empresa_a inteiro.
--
-- Uso (na raiz do repo):
--   .\scripts\dev\run-reset-tenant-empresa-a.ps1

BEGIN;

DO $reset$
DECLARE
    v_client_id constant uuid := 'a19284f2-f3a5-4435-8670-4a616c0ee3f7';
    v_schema  constant text := 'tenant_empresa_a';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM admin.client WHERE id = v_client_id) THEN
        RAISE NOTICE 'Cliente Empresa A (id %) nao encontrado; nada a limpar.', v_client_id;
        RETURN;
    END IF;

    DELETE FROM admin.client_payment
    WHERE client_id = v_client_id;

    DELETE FROM admin.client_subscription
    WHERE client_id = v_client_id;

    DELETE FROM admin.client_user
    WHERE client_id = v_client_id;

    -- Schema dedicado (HR + auth + tudo)
    EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', v_schema);

    UPDATE admin.client
    SET
        document            = NULL,
        subdomain           = NULL,
        custom_domain       = NULL,
        routing_mode        = 'SUBDOMAIN',
        database_strategy   = 'DEDICATED_SCHEMA',
        database_host       = NULL,
        database_port       = NULL,
        database_name       = NULL,
        database_schema     = NULL,
        database_user       = NULL,
        database_secret_ref = NULL,
        provisioning_status = 'PENDING',
        provisioning_notes  = NULL,
        updated_at          = now()
    WHERE id = v_client_id;

    RAISE NOTICE 'Reset concluido para Empresa A (schema % removido).', v_schema;
END;
$reset$;

COMMIT;

SELECT 'client' AS check, slug, provisioning_status, database_schema
FROM admin.client
WHERE slug = 'empresa-a';

SELECT 'client_users' AS check, COUNT(*) AS total
FROM admin.client_user
WHERE client_id = 'a19284f2-f3a5-4435-8670-4a616c0ee3f7'::uuid;

SELECT 'tenant_schema' AS check, EXISTS (
    SELECT 1 FROM information_schema.schemata WHERE schema_name = 'tenant_empresa_a'
) AS schema_exists;
