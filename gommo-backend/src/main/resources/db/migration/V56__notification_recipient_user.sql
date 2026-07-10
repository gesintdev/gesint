-- Destinatário opcional: NULL = inbox RH; preenchido = notificação do colaborador (Tick).

ALTER TABLE system_notification
    ADD COLUMN IF NOT EXISTS recipient_user_id UUID;

CREATE INDEX IF NOT EXISTS idx_system_notification_recipient_unread
    ON system_notification (recipient_user_id, read_at, created_at DESC)
    WHERE status != 'DELETED' AND recipient_user_id IS NOT NULL;

INSERT INTO role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM role r
JOIN permission p ON p.authority IN ('notification:read', 'notification:write')
WHERE r.name = 'MOBILE'
ON CONFLICT DO NOTHING;
