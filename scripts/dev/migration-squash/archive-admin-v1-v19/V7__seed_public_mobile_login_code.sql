INSERT INTO admin.client (
    id, status, code, name, slug, routing_mode, mobile_login_code, database_strategy, database_schema, provisioning_status, created_at, updated_at
)
SELECT
    gen_random_uuid(),
    'ACTIVE',
    COALESCE((SELECT MAX(code) FROM admin.client), 0) + 1,
    'Public',
    'public',
    'SUBDOMAIN',
    '000000000',
    'DEDICATED_DATABASE',
    'public',
    'READY',
    now(),
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM admin.client WHERE slug = 'public' AND status <> 'DELETED'
);

UPDATE admin.client
SET
    mobile_login_code = '000000000',
    routing_mode = COALESCE(routing_mode, 'SUBDOMAIN'),
    database_strategy = COALESCE(database_strategy, 'DEDICATED_DATABASE'),
    database_schema = COALESCE(database_schema, 'public'),
    provisioning_status = COALESCE(provisioning_status, 'READY'),
    updated_at = now()
WHERE slug = 'public'
  AND status <> 'DELETED';
