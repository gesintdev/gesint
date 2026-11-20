-- Flag: documento obrigatório no processo de admissão.
ALTER TABLE public.document_type
    ADD COLUMN IF NOT EXISTS required_for_admission boolean NOT NULL DEFAULT false;

-- Carga inicial: tipos padrão da admissão (lista atual do select).
UPDATE public.document_type
SET required_for_admission = true
WHERE type_code IN (
    'RG',
    'CPF',
    'COMPROVANTE_ENDERECO',
    'CTPS',
    'TITULO_ELEITOR',
    'CERTIDAO_NASCIMENTO'
)
  AND status <> 'DELETED'::gesint_types.status_enum;

DO $$
DECLARE
    tenant_schema TEXT;
BEGIN
    FOR tenant_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gesint_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.document_type', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        EXECUTE format(
            'ALTER TABLE %I.document_type ADD COLUMN IF NOT EXISTS required_for_admission boolean NOT NULL DEFAULT false',
            tenant_schema
        );
        EXECUTE format(
            $sql$
            UPDATE %I.document_type
            SET required_for_admission = true
            WHERE type_code IN (
                'RG',
                'CPF',
                'COMPROVANTE_ENDERECO',
                'CTPS',
                'TITULO_ELEITOR',
                'CERTIDAO_NASCIMENTO'
            )
              AND status <> 'DELETED'::gesint_types.status_enum
            $sql$,
            tenant_schema
        );
    END LOOP;
END
$$;

SELECT public.gesint_audit_sync_table('document_type');
