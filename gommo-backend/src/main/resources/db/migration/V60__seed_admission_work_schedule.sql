-- Vincula a escala existente em todas as admissões ainda sem escala.

UPDATE admission_process ap
SET work_schedule_id = ws.id
FROM (
    SELECT id
    FROM work_schedule
    WHERE status <> 'DELETED'
    ORDER BY created_at ASC NULLS LAST, code ASC
    LIMIT 1
) ws
WHERE ap.status <> 'DELETED'
  AND ap.work_schedule_id IS NULL;
