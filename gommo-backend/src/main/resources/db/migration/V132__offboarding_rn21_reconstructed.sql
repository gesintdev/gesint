-- RN-21 / T15: Desligamento reconstruído (motivo eSocial, aviso, checklist, pacote, lifecycle).

CREATE TABLE IF NOT EXISTS esocial_table19_dismissal_reason (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            INTEGER NOT NULL UNIQUE,
    status          gommo_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    reason_code     VARCHAR(10) NOT NULL UNIQUE,
    description     VARCHAR(240) NOT NULL,
    dismissal_type  VARCHAR(40) NOT NULL,
    active          BOOLEAN NOT NULL DEFAULT true,
    created_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by      UUID,
    updated_at      TIMESTAMPTZ
);

INSERT INTO esocial_table19_dismissal_reason (id, code, reason_code, description, dismissal_type, active)
VALUES
    ('a1900000-0000-0000-0000-000000000001', 1901, '01', 'Rescisão com justa causa por iniciativa do empregador', 'WITH_CAUSE', true),
    ('a1900000-0000-0000-0000-000000000002', 1902, '02', 'Rescisão sem justa causa por iniciativa do empregador', 'WITHOUT_CAUSE', true),
    ('a1900000-0000-0000-0000-000000000003', 1903, '03', 'Rescisão antecipada do contrato a termo por iniciativa do empregador', 'WITHOUT_CAUSE', true),
    ('a1900000-0000-0000-0000-000000000004', 1904, '04', 'Rescisão antecipada do contrato a termo por iniciativa do empregado', 'RESIGNATION', true),
    ('a1900000-0000-0000-0000-000000000005', 1905, '05', 'Rescisão por culpa recíproca', 'OTHER', true),
    ('a1900000-0000-0000-0000-000000000006', 1906, '06', 'Rescisão por falecimento do empregado', 'OTHER', true),
    ('a1900000-0000-0000-0000-000000000007', 1907, '07', 'Rescisão por iniciativa do empregado (pedido de demissão)', 'RESIGNATION', true),
    ('a1900000-0000-0000-0000-000000000008', 1908, '08', 'Rescisão por acordo entre as partes (art. 484-A)', 'AGREEMENT', true),
    ('a1900000-0000-0000-0000-000000000009', 1909, '09', 'Rescisão por término do contrato a termo', 'END_OF_CONTRACT', true),
    ('a1900000-0000-0000-0000-000000000010', 1910, '10', 'Rescisão por falecimento do empregador individual', 'OTHER', true),
    ('a1900000-0000-0000-0000-000000000015', 1915, '15', 'Rescisão por extinção da empresa', 'WITHOUT_CAUSE', true),
    ('a1900000-0000-0000-0000-000000000016', 1916, '16', 'Rescisão por falência', 'WITHOUT_CAUSE', true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE offboarding
    ADD COLUMN IF NOT EXISTS process_status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN IF NOT EXISTS esocial_dismissal_reason_code VARCHAR(10),
    ADD COLUMN IF NOT EXISTS esocial_dismissal_reason_label VARCHAR(240),
    ADD COLUMN IF NOT EXISTS last_work_day DATE,
    ADD COLUMN IF NOT EXISTS notice_type VARCHAR(40),
    ADD COLUMN IF NOT EXISTS notice_days INTEGER,
    ADD COLUMN IF NOT EXISTS notice_start_date DATE,
    ADD COLUMN IF NOT EXISTS notice_end_date DATE,
    ADD COLUMN IF NOT EXISTS workload_reduction_applicable BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS exit_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS exit_interview_id UUID,
    ADD COLUMN IF NOT EXISTS accountant_package_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS accountant_package_sent_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS accountant_package_detail TEXT,
    ADD COLUMN IF NOT EXISTS demissional_waiver_registered BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS demissional_waiver_notes TEXT,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Registros legados já concluídos (tinham side-effects no create).
UPDATE offboarding
SET process_status = 'COMPLETED',
    completed_at = COALESCE(completed_at, updated_at, created_at),
    last_work_day = COALESCE(last_work_day, dismissal_date),
    accountant_package_status = 'READY'
WHERE status <> 'DELETED';

-- Backfill motivo eSocial a partir do tipo legado.
UPDATE offboarding o
SET esocial_dismissal_reason_code = CASE o.dismissal_type::text
        WHEN 'WITH_CAUSE' THEN '01'
        WHEN 'WITHOUT_CAUSE' THEN '02'
        WHEN 'RESIGNATION' THEN '07'
        WHEN 'AGREEMENT' THEN '08'
        WHEN 'END_OF_CONTRACT' THEN '09'
        ELSE '07'
    END,
    esocial_dismissal_reason_label = (
        SELECT r.description
        FROM esocial_table19_dismissal_reason r
        WHERE r.reason_code = CASE o.dismissal_type::text
            WHEN 'WITH_CAUSE' THEN '01'
            WHEN 'WITHOUT_CAUSE' THEN '02'
            WHEN 'RESIGNATION' THEN '07'
            WHEN 'AGREEMENT' THEN '08'
            WHEN 'END_OF_CONTRACT' THEN '09'
            ELSE '07'
        END
        LIMIT 1
    )
WHERE o.esocial_dismissal_reason_code IS NULL
  AND o.status <> 'DELETED';

DO $sync_v132$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gommo_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.permission', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        EXECUTE format(
            $sql$
            CREATE TABLE IF NOT EXISTS %I.esocial_table19_dismissal_reason (
                id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                code            INTEGER NOT NULL UNIQUE,
                status          gommo_types.status_enum NOT NULL DEFAULT 'ACTIVE',
                reason_code     VARCHAR(10) NOT NULL UNIQUE,
                description     VARCHAR(240) NOT NULL,
                dismissal_type  VARCHAR(40) NOT NULL,
                active          BOOLEAN NOT NULL DEFAULT true,
                created_by      UUID,
                created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_by      UUID,
                updated_at      TIMESTAMPTZ
            )
            $sql$,
            target_schema);

        EXECUTE format(
            $sql$
            INSERT INTO %I.esocial_table19_dismissal_reason (
                id, code, status, reason_code, description, dismissal_type, active, created_at
            )
            SELECT id, code, status, reason_code, description, dismissal_type, active, created_at
            FROM public.esocial_table19_dismissal_reason
            ON CONFLICT (id) DO NOTHING
            $sql$,
            target_schema);

        IF to_regclass(format('%I.offboarding', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                'ALTER TABLE %I.offboarding '
                || 'ADD COLUMN IF NOT EXISTS process_status VARCHAR(20) NOT NULL DEFAULT ''DRAFT'', '
                || 'ADD COLUMN IF NOT EXISTS esocial_dismissal_reason_code VARCHAR(10), '
                || 'ADD COLUMN IF NOT EXISTS esocial_dismissal_reason_label VARCHAR(240), '
                || 'ADD COLUMN IF NOT EXISTS last_work_day DATE, '
                || 'ADD COLUMN IF NOT EXISTS notice_type VARCHAR(40), '
                || 'ADD COLUMN IF NOT EXISTS notice_days INTEGER, '
                || 'ADD COLUMN IF NOT EXISTS notice_start_date DATE, '
                || 'ADD COLUMN IF NOT EXISTS notice_end_date DATE, '
                || 'ADD COLUMN IF NOT EXISTS workload_reduction_applicable BOOLEAN NOT NULL DEFAULT false, '
                || 'ADD COLUMN IF NOT EXISTS exit_checklist JSONB NOT NULL DEFAULT ''[]''::jsonb, '
                || 'ADD COLUMN IF NOT EXISTS exit_interview_id UUID, '
                || 'ADD COLUMN IF NOT EXISTS accountant_package_status VARCHAR(20) NOT NULL DEFAULT ''PENDING'', '
                || 'ADD COLUMN IF NOT EXISTS accountant_package_sent_at TIMESTAMPTZ, '
                || 'ADD COLUMN IF NOT EXISTS accountant_package_detail TEXT, '
                || 'ADD COLUMN IF NOT EXISTS demissional_waiver_registered BOOLEAN NOT NULL DEFAULT false, '
                || 'ADD COLUMN IF NOT EXISTS demissional_waiver_notes TEXT, '
                || 'ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ',
                target_schema);

            EXECUTE format(
                $sql$
                UPDATE %I.offboarding
                SET process_status = 'COMPLETED',
                    completed_at = COALESCE(completed_at, updated_at, created_at),
                    last_work_day = COALESCE(last_work_day, dismissal_date),
                    accountant_package_status = CASE
                        WHEN accountant_package_status = 'PENDING' THEN 'READY'
                        ELSE accountant_package_status
                    END
                WHERE status <> 'DELETED'
                $sql$,
                target_schema);
        END IF;
    END LOOP;
END
$sync_v132$;

SELECT public.gommo_audit_sync_table('esocial_table19_dismissal_reason');
SELECT public.gommo_audit_sync_table('offboarding');
