CREATE TABLE public.data_import_job (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    code integer NOT NULL,
    entity_type character varying(40) NOT NULL,
    import_mode character varying(20) NOT NULL,
    job_status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    source_file_name character varying(500),
    total_rows integer DEFAULT 0 NOT NULL,
    processed_rows integer DEFAULT 0 NOT NULL,
    success_count integer DEFAULT 0 NOT NULL,
    error_count integer DEFAULT 0 NOT NULL,
    errors_json jsonb,
    started_at timestamp with time zone,
    finished_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    CONSTRAINT data_import_job_pkey PRIMARY KEY (id),
    CONSTRAINT chk_data_import_job_entity_type CHECK (
        entity_type IN ('DEPARTMENT', 'JOB_POSITION', 'ADMISSION')
    ),
    CONSTRAINT chk_data_import_job_import_mode CHECK (import_mode IN ('INSERT', 'UPDATE')),
    CONSTRAINT chk_data_import_job_job_status CHECK (
        job_status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')
    )
);

CREATE UNIQUE INDEX uk_data_import_job_code ON public.data_import_job USING btree (code);

CREATE INDEX idx_data_import_job_entity_status
    ON public.data_import_job USING btree (entity_type, job_status)
    WHERE status <> 'DELETED'::gesint_types.status_enum;

DO $$
DECLARE
    tenant_schema TEXT;
BEGIN
    FOR tenant_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gesint_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.permission', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        IF to_regclass(format('%I.data_import_job', tenant_schema)) IS NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.data_import_job (LIKE public.data_import_job INCLUDING ALL)',
                tenant_schema
            );
        END IF;
    END LOOP;
END
$$;

SELECT public.gesint_audit_sync_table('data_import_job');
