-- Mock dev: notificacoes para testar sino/listagem.
--
-- Remocao rapida:
--   DELETE FROM public.system_notification
--   WHERE reference_type = 'MOCK_NOTIFICATION';
--
-- Executar (na raiz do repo):
--   Get-Content scripts/dev/seed-mock-notifications.sql | docker compose exec -T postgres psql -U gommo -d gommo

BEGIN;

INSERT INTO public.system_notification (
    id,
    code,
    status,
    notification_type,
    title,
    message,
    reference_type,
    reference_id,
    reference_due_date,
    read_at,
    created_at,
    updated_at
)
SELECT
    data.id,
    data.code,
    'ACTIVE',
    data.notification_type,
    data.title,
    data.message,
    'MOCK_NOTIFICATION',
    data.reference_id,
    data.reference_due_date,
    data.read_at,
    data.created_at,
    data.updated_at
FROM (
    VALUES
        (
            '91000000-0000-4000-8000-000000000001'::uuid,
            910001,
            'VACATION_DUE',
            'Ferias vencem hoje',
            'O periodo concessivo de Ana Paula vence hoje.',
            '91000000-0000-4000-8000-000000000101'::uuid,
            CURRENT_DATE,
            NULL::timestamptz,
            now() - interval '5 minutes',
            now() - interval '5 minutes'
        ),
        (
            '91000000-0000-4000-8000-000000000002'::uuid,
            910002,
            'VACATION_DUE',
            'Ferias a vencer',
            'O periodo concessivo de Bruno Lima vence em 7 dias.',
            '91000000-0000-4000-8000-000000000102'::uuid,
            CURRENT_DATE + 7,
            NULL::timestamptz,
            now() - interval '35 minutes',
            now() - interval '35 minutes'
        ),
        (
            '91000000-0000-4000-8000-000000000003'::uuid,
            910003,
            'VACATION_DUE',
            'Ferias a vencer',
            'O periodo concessivo de Camila Rocha vence em 21 dias.',
            '91000000-0000-4000-8000-000000000103'::uuid,
            CURRENT_DATE + 21,
            NULL::timestamptz,
            now() - interval '2 hours',
            now() - interval '2 hours'
        ),
        (
            '91000000-0000-4000-8000-000000000004'::uuid,
            910004,
            'VACATION_DUE',
            'Ferias ja revisadas',
            'O periodo concessivo de Diego Martins vence em 12 dias.',
            '91000000-0000-4000-8000-000000000104'::uuid,
            CURRENT_DATE + 12,
            now() - interval '20 minutes',
            now() - interval '1 day',
            now() - interval '20 minutes'
        )
) AS data (
    id,
    code,
    notification_type,
    title,
    message,
    reference_id,
    reference_due_date,
    read_at,
    created_at,
    updated_at
)
WHERE NOT EXISTS (
    SELECT 1
    FROM public.system_notification existing
    WHERE existing.id = data.id
       OR existing.code = data.code
);

COMMIT;

SELECT
    'mock_notifications' AS check,
    COUNT(*) FILTER (WHERE read_at IS NULL) AS unread,
    COUNT(*) AS total
FROM public.system_notification
WHERE reference_type = 'MOCK_NOTIFICATION'
  AND status <> 'DELETED';
