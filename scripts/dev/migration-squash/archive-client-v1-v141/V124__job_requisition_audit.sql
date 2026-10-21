-- Integracao das branches de auditoria (V121/V122) e requisicao de vaga (V123):
-- job_requisition nasceu depois do Envers e precisa do historico como as demais entidades.
SELECT public.gesint_audit_sync_table('job_requisition');
