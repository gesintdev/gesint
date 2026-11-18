ALTER TABLE public.medical_clinic
    ADD COLUMN IF NOT EXISTS zip_code character varying(10),
    ADD COLUMN IF NOT EXISTS street character varying(200),
    ADD COLUMN IF NOT EXISTS number character varying(20),
    ADD COLUMN IF NOT EXISTS complement character varying(100),
    ADD COLUMN IF NOT EXISTS district character varying(100),
    ADD COLUMN IF NOT EXISTS city_id uuid,
    ADD COLUMN IF NOT EXISTS state_id uuid;

UPDATE public.medical_clinic
SET street = btrim(address)
WHERE street IS NULL
  AND address IS NOT NULL
  AND btrim(address) <> '';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_medical_clinic_city'
          AND connamespace = 'public'::regnamespace
    ) THEN
        ALTER TABLE public.medical_clinic
            ADD CONSTRAINT fk_medical_clinic_city FOREIGN KEY (city_id) REFERENCES public.city (id);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_medical_clinic_state'
          AND connamespace = 'public'::regnamespace
    ) THEN
        ALTER TABLE public.medical_clinic
            ADD CONSTRAINT fk_medical_clinic_state FOREIGN KEY (state_id) REFERENCES public.state (id);
    END IF;
END
$$;

DO $$
DECLARE
    tenant_schema TEXT;
BEGIN
    FOR tenant_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gesint_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.medical_clinic', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        EXECUTE format(
            'ALTER TABLE %I.medical_clinic
                ADD COLUMN IF NOT EXISTS zip_code character varying(10),
                ADD COLUMN IF NOT EXISTS street character varying(200),
                ADD COLUMN IF NOT EXISTS number character varying(20),
                ADD COLUMN IF NOT EXISTS complement character varying(100),
                ADD COLUMN IF NOT EXISTS district character varying(100),
                ADD COLUMN IF NOT EXISTS city_id uuid,
                ADD COLUMN IF NOT EXISTS state_id uuid',
            tenant_schema
        );
        EXECUTE format(
            'UPDATE %I.medical_clinic
                SET street = btrim(address)
              WHERE street IS NULL
                AND address IS NOT NULL
                AND btrim(address) <> ''''',
            tenant_schema
        );
        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE c.conname = 'fk_medical_clinic_city'
              AND n.nspname = tenant_schema
        ) THEN
            EXECUTE format(
                'ALTER TABLE %I.medical_clinic
                    ADD CONSTRAINT fk_medical_clinic_city FOREIGN KEY (city_id) REFERENCES public.city (id)',
                tenant_schema
            );
        END IF;
        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE c.conname = 'fk_medical_clinic_state'
              AND n.nspname = tenant_schema
        ) THEN
            EXECUTE format(
                'ALTER TABLE %I.medical_clinic
                    ADD CONSTRAINT fk_medical_clinic_state FOREIGN KEY (state_id) REFERENCES public.state (id)',
                tenant_schema
            );
        END IF;
    END LOOP;
END
$$;

SELECT public.gesint_audit_sync_table('medical_clinic');
