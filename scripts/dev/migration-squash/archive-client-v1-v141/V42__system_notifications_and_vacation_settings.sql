CREATE TABLE system_setting (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                INTEGER NOT NULL UNIQUE,
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    setting_key         VARCHAR(120) NOT NULL,
    setting_value       TEXT NOT NULL,
    description         TEXT,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX uk_system_setting_key_active
    ON system_setting (setting_key)
    WHERE status != 'DELETED';

CREATE TABLE system_notification (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                INTEGER NOT NULL UNIQUE,
    status              status_enum NOT NULL DEFAULT 'ACTIVE',
    notification_type   VARCHAR(80) NOT NULL,
    title               VARCHAR(180) NOT NULL,
    message             TEXT NOT NULL,
    reference_type      VARCHAR(80),
    reference_id        UUID,
    reference_due_date  DATE,
    read_at             TIMESTAMPTZ,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE INDEX idx_system_notification_unread
    ON system_notification (read_at, created_at DESC)
    WHERE status != 'DELETED';

CREATE UNIQUE INDEX uk_system_notification_reference_active
    ON system_notification (notification_type, reference_type, reference_id, reference_due_date)
    WHERE status != 'DELETED';

INSERT INTO system_setting (code, setting_key, setting_value, description)
SELECT
    COALESCE((SELECT MAX(code) FROM system_setting), 0) + 1,
    'VACATION_DUE_NOTICE_DAYS',
    '30',
    'Antecedencia, em dias, para notificacao de ferias a vencer'
WHERE NOT EXISTS (
    SELECT 1 FROM system_setting
    WHERE setting_key = 'VACATION_DUE_NOTICE_DAYS'
      AND status != 'DELETED'
);

INSERT INTO permission (id, code, module, authority, description)
SELECT '22000000-0000-0000-0000-000000000001',
       COALESCE((SELECT MAX(code) FROM permission), 0) + 1,
       'notification',
       'notification:read',
       'Listar notificacoes do sistema'
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE authority = 'notification:read');

INSERT INTO permission (id, code, module, authority, description)
SELECT '22000000-0000-0000-0000-000000000002',
       COALESCE((SELECT MAX(code) FROM permission), 0) + 1,
       'notification',
       'notification:write',
       'Gerenciar notificacoes e preferencias'
WHERE NOT EXISTS (SELECT 1 FROM permission WHERE authority = 'notification:write');

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', p.id
FROM permission p
WHERE p.authority IN ('notification:read', 'notification:write')
  AND NOT EXISTS (
      SELECT 1 FROM role_permission rp
      WHERE rp.role_id = '00000000-0000-0000-0000-000000000001'
        AND rp.permission_id = p.id
  );

INSERT INTO role_permission (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', p.id
FROM permission p
WHERE p.authority IN ('notification:read', 'notification:write')
  AND NOT EXISTS (
      SELECT 1 FROM role_permission rp
      WHERE rp.role_id = '00000000-0000-0000-0000-000000000002'
        AND rp.permission_id = p.id
  );
