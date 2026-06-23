UPDATE collaborator c
SET status = 'INACTIVE'
WHERE c.status <> 'DELETED'
  AND EXISTS (
      SELECT 1
      FROM offboarding o
      WHERE o.collaborator_id = c.id
        AND o.status <> 'DELETED'
  );
