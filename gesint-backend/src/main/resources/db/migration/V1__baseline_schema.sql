-- Gesint Client baseline schema (squashed from V1-V141).
-- Greenfield only. Includes public + gesint_types DDL, functions, indexes, audit tables.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Name: gesint_types; Type: SCHEMA; Schema: -; Owner: -

CREATE SCHEMA IF NOT EXISTS gesint_types;


-- Name: SCHEMA gesint_types; Type: COMMENT; Schema: -; Owner: -

COMMENT ON SCHEMA gesint_types IS 'Enums compartilhados (sem tabelas). Usado no search_path multi-tenant para casts Hibernate fail-closed.';


-- Name: public; Type: SCHEMA; Schema: -; Owner: -

CREATE SCHEMA IF NOT EXISTS public;


-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -

COMMENT ON SCHEMA public IS 'standard public schema';


-- Name: admission_status_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.admission_status_enum AS ENUM (
    'DRAFT',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


-- Name: admission_step_key_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.admission_step_key_enum AS ENUM (
    'PRE_ADMISSAO',
    'DOCUMENTACAO',
    'EXAME',
    'CONTRATO',
    'REGISTRO',
    'ESOCIAL',
    'INTEGRACAO'
);


-- Name: admission_step_status_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.admission_step_status_enum AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'BLOCKED',
    'DONE',
    'SKIPPED'
);


-- Name: attendance_occurrence_origin_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.attendance_occurrence_origin_enum AS ENUM (
    'MANUAL',
    'LEAVE_REQUEST',
    'MOBILE'
);


-- Name: attendance_occurrence_type_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.attendance_occurrence_type_enum AS ENUM (
    'NORMAL_WORK',
    'MEDICAL_CERTIFICATE',
    'LEAVE_ABSENCE',
    'UNJUSTIFIED_ABSENCE',
    'LATE_ARRIVAL',
    'VACATION',
    'LICENSE',
    'TIME_ADJUSTMENT'
);


-- Name: complementary_exam_result_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.complementary_exam_result_enum AS ENUM (
    'NORMAL',
    'ALTERED',
    'NOT_PERFORMED'
);


-- Name: contract_type_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.contract_type_enum AS ENUM (
    'CLT',
    'PJ',
    'INTERMITTENT',
    'APPRENTICE',
    'INTERN'
);


-- Name: data_scope_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.data_scope_enum AS ENUM (
    'ALL',
    'DEPARTMENT',
    'TEAM',
    'ASSIGNED',
    'SELF'
);


-- Name: digital_certificate_environment_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.digital_certificate_environment_enum AS ENUM (
    'HOMOLOGATION',
    'PRODUCTION'
);


-- Name: digital_certificate_purpose_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.digital_certificate_purpose_enum AS ENUM (
    'ESOCIAL',
    'GENERAL'
);


-- Name: digital_certificate_type_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.digital_certificate_type_enum AS ENUM (
    'A1'
);


-- Name: dismissal_type_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.dismissal_type_enum AS ENUM (
    'WITHOUT_CAUSE',
    'WITH_CAUSE',
    'RESIGNATION',
    'AGREEMENT',
    'END_OF_CONTRACT',
    'OTHER'
);


-- Name: document_data_class_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.document_data_class_enum AS ENUM (
    'COMUM',
    'PESSOAL',
    'SENSIVEL',
    'FINANCEIRO'
);


-- Name: esocial_event_status_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.esocial_event_status_enum AS ENUM (
    'NAO_GERADO',
    'GERADO',
    'TRANSMITIDO',
    'ACEITO',
    'REJEITADO'
);


-- Name: esocial_event_type_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.esocial_event_type_enum AS ENUM (
    'S_2200',
    'S_2206',
    'S_2230',
    'S_2299'
);


-- Name: esocial_transmission_status_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.esocial_transmission_status_enum AS ENUM (
    'PENDING',
    'GENERATED',
    'TRANSMITTED',
    'REJECTED'
);


-- Name: gender_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.gender_enum AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER',
    'NOT_INFORMED'
);


-- Name: job_position_competency_expected_level_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.job_position_competency_expected_level_enum AS ENUM (
    'LEVEL_1',
    'LEVEL_2',
    'LEVEL_3',
    'LEVEL_4'
);


-- Name: job_position_competency_usage_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.job_position_competency_usage_enum AS ENUM (
    'SELECTION',
    'EXPERIENCE',
    'PERFORMANCE',
    'INTERVIEW',
    'TECHNICAL_TEST',
    'PDI'
);


-- Name: job_position_salary_level_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.job_position_salary_level_enum AS ENUM (
    'I',
    'II',
    'III'
);


-- Name: leave_absence_status_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.leave_absence_status_enum AS ENUM (
    'PENDING',
    'VALIDATED',
    'REFERRED_INSS',
    'APPROVED_INSS',
    'FINALIZED',
    'CANCELLED'
);


-- Name: leave_type_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.leave_type_enum AS ENUM (
    'VACATION',
    'MEDICAL',
    'MATERNITY',
    'PATERNITY',
    'UNPAID',
    'OTHER',
    'MEDICAL_CERTIFICATE',
    'SICK_LEAVE_INSS',
    'OCCUPATIONAL_ACCIDENT',
    'BEREAVEMENT',
    'MARRIAGE',
    'BLOOD_DONATION',
    'ELECTORAL_SERVICE',
    'MILITARY_SERVICE',
    'JURY_DUTY',
    'UNION_REPRESENTATION',
    'UNPAID_LEAVE',
    'SUSPENSION',
    'UNJUSTIFIED_ABSENCE'
);


-- Name: marital_status_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.marital_status_enum AS ENUM (
    'SINGLE',
    'MARRIED',
    'DIVORCED',
    'WIDOWED',
    'OTHER'
);


-- Name: occupational_exam_lifecycle_status_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.occupational_exam_lifecycle_status_enum AS ENUM (
    'PREVISTO',
    'CONVOCADO',
    'REALIZADO',
    'REGISTRADO',
    'TRANSMITIDO',
    'ARQUIVADO',
    'VENCIDO_INADIMPLENTE'
);


-- Name: occupational_exam_result_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.occupational_exam_result_enum AS ENUM (
    'FIT',
    'UNFIT'
);


-- Name: occupational_exam_source_trigger_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.occupational_exam_source_trigger_enum AS ENUM (
    'MATRIX_SCHEDULE',
    'ADMISSION',
    'LEAVE_RETURN',
    'POSITION_CHANGE',
    'TERMINATION',
    'MANUAL'
);


-- Name: occupational_exam_type_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.occupational_exam_type_enum AS ENUM (
    'ADMISSIONAL',
    'PERIODICO',
    'RETORNO_AO_TRABALHO',
    'MUDANCA_DE_RISCO_OCUPACIONAL',
    'DEMISSIONAL'
);


-- Name: occupational_physician_role_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.occupational_physician_role_enum AS ENUM (
    'EXAMINER',
    'PCMSO_COORDINATOR'
);


-- Name: payment_batch_status_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.payment_batch_status_enum AS ENUM (
    'PROCESSING',
    'PROCESSED',
    'PARTIALLY_SENT',
    'SENT'
);


-- Name: payment_batch_type_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.payment_batch_type_enum AS ENUM (
    'SALARY'
);


-- Name: payment_slip_status_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.payment_slip_status_enum AS ENUM (
    'PROCESSED',
    'DIVERGENT',
    'SENT',
    'NOT_FOUND'
);


-- Name: payroll_event_type_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.payroll_event_type_enum AS ENUM (
    'EARNING',
    'DEDUCTION',
    'INFORMATIVE'
);


-- Name: payroll_status_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.payroll_status_enum AS ENUM (
    'DRAFT',
    'PROCESSING',
    'CLOSED',
    'CANCELLED',
    'OPEN',
    'PROCESSED',
    'REVIEWED'
);


-- Name: performance_rating_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.performance_rating_enum AS ENUM (
    'NEEDS_IMPROVEMENT',
    'MEETS',
    'EXCEEDS',
    'OUTSTANDING'
);


-- Name: recess_financial_mode_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.recess_financial_mode_enum AS ENUM (
    'FULLY_PAID',
    'UNPAID',
    'PROPORTIONAL',
    'CUSTOM'
);


-- Name: recess_period_status_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.recess_period_status_enum AS ENUM (
    'ACCRUING',
    'AVAILABLE',
    'EXHAUSTED',
    'EXPIRED',
    'CANCELLED'
);


-- Name: role_type_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.role_type_enum AS ENUM (
    'GLOBAL_ADMIN',
    'ADMIN',
    'INTERNAL',
    'CUSTOM'
);


-- Name: status_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'DELETED'
);


-- Name: system_scope_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.system_scope_enum AS ENUM (
    'DP',
    'RH',
    'CONTABILIDADE',
    'CFG'
);


-- Name: tax_obligation_type_enum; Type: TYPE; Schema: gesint_types; Owner: -

CREATE TYPE gesint_types.tax_obligation_type_enum AS ENUM (
    'IRRF',
    'INSS',
    'FGTS',
    'OTHER'
);


-- Name: unaccent(text); Type: FUNCTION; Schema: gesint_types; Owner: -

CREATE FUNCTION gesint_types.unaccent(value text) RETURNS text
    LANGUAGE sql IMMUTABLE PARALLEL SAFE
    AS $$
    SELECT public.unaccent('public.unaccent'::regdictionary, value)
$$;


-- Name: gesint_admin_profile_modules(gesint_types.system_scope_enum); Type: FUNCTION; Schema: public; Owner: -

CREATE FUNCTION public.gesint_admin_profile_modules(p_system gesint_types.system_scope_enum) RETURNS text[]
    LANGUAGE sql IMMUTABLE
    AS $$
    SELECT CASE p_system
        WHEN 'CFG' THEN ARRAY[
            'role', 'actingprofile', 'user', 'workschedule', 'digitalcertificate', 'documenttype',
            'admission', 'exitinterview', 'developmentplanconfig', 'attendance', 'notification']
        WHEN 'DP' THEN ARRAY[
            'company', 'department', 'jobposition', 'workschedule', 'payment', 'collaborator',
            'admission', 'offboarding', 'occupationalexam', 'notification', 'agenda',
            'attendance', 'leave', 'storage']
        WHEN 'CONTABILIDADE' THEN ARRAY[
            'payroll', 'payrollevent', 'payslip', 'benefit', 'benefitenrollment', 'tax',
            'notification', 'agenda', 'storage']
        WHEN 'RH' THEN ARRAY[
            'collaborator', 'admission', 'exitinterview', 'contract', 'leave', 'performance',
            'jobvacancy', 'candidate', 'jobvacancyapplication', 'developmentplan',
            'notification', 'agenda', 'storage']
        ELSE ARRAY[]::text[]
    END;
$$;


-- Name: gesint_audit_copy_columns(regclass, text, text); Type: FUNCTION; Schema: public; Owner: -

CREATE FUNCTION public.gesint_audit_copy_columns(p_template regclass, p_target_schema text, p_target_table text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    target_rel regclass := to_regclass(format('%I.%I', p_target_schema, p_target_table));
    col record;
BEGIN
    FOR col IN
        SELECT a.attname, format_type(a.atttypid, a.atttypmod) AS col_type
        FROM pg_attribute a
        WHERE a.attrelid = p_template
          AND a.attnum > 0
          AND NOT a.attisdropped
          AND NOT EXISTS (
              SELECT 1
              FROM pg_attribute t
              WHERE t.attrelid = target_rel
                AND t.attname = a.attname
                AND NOT t.attisdropped)
        ORDER BY a.attnum
    LOOP
        EXECUTE format('ALTER TABLE %I.%I ADD COLUMN %I %s',
                p_target_schema, p_target_table, col.attname, col.col_type);
    END LOOP;

    FOR col IN
        SELECT a.attname, format_type(a.atttypid, a.atttypmod) AS col_type
        FROM pg_attribute a
        JOIN pg_attribute t
          ON t.attrelid = target_rel
         AND t.attname = a.attname
         AND NOT t.attisdropped
        WHERE a.attrelid = p_template
          AND a.attnum > 0
          AND NOT a.attisdropped
          AND (a.atttypid, a.atttypmod) IS DISTINCT FROM (t.atttypid, t.atttypmod)
    LOOP
        EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN %I TYPE %s USING %I::text::%s',
                p_target_schema, p_target_table, col.attname, col.col_type, col.attname, col.col_type);
    END LOOP;
END
$$;


-- Name: gesint_audit_log_trail_columns(text); Type: FUNCTION; Schema: public; Owner: -

CREATE FUNCTION public.gesint_audit_log_trail_columns(p_schema text) RETURNS void
    LANGUAGE plpgsql
    AS $_$
BEGIN
    IF to_regclass(format('%I.audit_log', p_schema)) IS NULL THEN
        RETURN;
    END IF;

    EXECUTE format(
        $sql$
        ALTER TABLE %I.audit_log
            ALTER COLUMN entity_id DROP NOT NULL,
            ALTER COLUMN action TYPE VARCHAR(40),
            ADD COLUMN IF NOT EXISTS category VARCHAR(30),
            ADD COLUMN IF NOT EXISTS record_label VARCHAR(200),
            ADD COLUMN IF NOT EXISTS detail VARCHAR(500),
            ADD COLUMN IF NOT EXISTS reason TEXT
        $sql$,
        p_schema);

    EXECUTE format(
        'UPDATE %I.audit_log SET category = ''RECORD'' WHERE category IS NULL',
        p_schema);
    EXECUTE format('ALTER TABLE %I.audit_log ALTER COLUMN category SET NOT NULL', p_schema);

    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_audit_log_occurred_at ON %I.audit_log (occurred_at DESC)',
        p_schema);
    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_audit_log_category_occurred_at ON %I.audit_log (category, occurred_at DESC)',
        p_schema);
    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_audit_log_user ON %I.audit_log (user_id)',
        p_schema);
END
$_$;


-- Name: gesint_audit_sync_table(text); Type: FUNCTION; Schema: public; Owner: -

CREATE FUNCTION public.gesint_audit_sync_table(p_table text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    aud_table   text := p_table || '_aud';
    base_rel    regclass := to_regclass(format('public.%I', p_table));
    aud_rel     regclass;
    key_columns text;
    col         record;
    tenant      text;
BEGIN
    IF base_rel IS NULL THEN
        RAISE EXCEPTION 'gesint_audit_sync_table: tabela public.% nao existe', p_table;
    END IF;

    IF to_regclass(format('public.%I', aud_table)) IS NULL THEN
        EXECUTE format('CREATE TABLE public.%I (LIKE public.%I)', aud_table, p_table);
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN rev BIGINT NOT NULL, ADD COLUMN revtype SMALLINT',
                aud_table);
    END IF;
    aud_rel := to_regclass(format('public.%I', aud_table));

    PERFORM public.gesint_audit_copy_columns(base_rel, 'public', aud_table);

    FOR col IN
        SELECT a.attname
        FROM pg_attribute a
        WHERE a.attrelid = aud_rel
          AND a.attnum > 0
          AND NOT a.attisdropped
          AND a.attnotnull
          AND a.attname <> 'rev'
          AND NOT EXISTS (
              SELECT 1
              FROM pg_index i
              WHERE i.indrelid = aud_rel
                AND i.indisprimary
                AND a.attnum = ANY (i.indkey))
    LOOP
        EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I DROP NOT NULL', aud_table, col.attname);
    END LOOP;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = aud_rel AND contype = 'p') THEN
        IF EXISTS (
            SELECT 1 FROM pg_attribute
            WHERE attrelid = base_rel AND attname = 'id' AND NOT attisdropped) THEN
            key_columns := 'id';
        ELSE
            SELECT string_agg(quote_ident(a.attname), ', ' ORDER BY k.ord)
              INTO key_columns
              FROM pg_index i
              CROSS JOIN LATERAL unnest(i.indkey) WITH ORDINALITY AS k(attnum, ord)
              JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = k.attnum
             WHERE i.indrelid = base_rel
               AND i.indisprimary;
        END IF;
        IF key_columns IS NULL THEN
            RAISE EXCEPTION 'gesint_audit_sync_table: public.% sem coluna id nem chave primaria', p_table;
        END IF;
        EXECUTE format('ALTER TABLE public.%I ADD PRIMARY KEY (%s, rev)', aud_table, key_columns);
    END IF;

    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (rev)', 'idx_' || aud_table || '_rev', aud_table);

    FOR tenant IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gesint_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND (to_regclass(format('%I.app_user', n.nspname)) IS NOT NULL
               OR to_regclass(format('%I.permission', n.nspname)) IS NOT NULL)
        ORDER BY 1
    LOOP
        IF to_regclass(format('%I.revinfo', tenant)) IS NULL THEN
            EXECUTE format('CREATE TABLE %I.revinfo (LIKE public.revinfo INCLUDING ALL)', tenant);
        END IF;

        IF to_regclass(format('%I.%I', tenant, aud_table)) IS NULL THEN
            EXECUTE format('CREATE TABLE %I.%I (LIKE public.%I INCLUDING ALL)', tenant, aud_table, aud_table);
        ELSE
            PERFORM public.gesint_audit_copy_columns(aud_rel, tenant, aud_table);
        END IF;
    END LOOP;
END
$$;


-- Name: gesint_seed_auditor_profile(text); Type: FUNCTION; Schema: public; Owner: -

CREATE FUNCTION public.gesint_seed_auditor_profile(p_schema text) RETURNS void
    LANGUAGE plpgsql
    AS $_$
BEGIN
    IF to_regclass(format('%I.role', p_schema)) IS NULL
       OR to_regclass(format('%I.permission', p_schema)) IS NULL
       OR to_regclass(format('%I.role_permission', p_schema)) IS NULL THEN
        RETURN;
    END IF;

    EXECUTE format(
        $sql$
        INSERT INTO %I.permission (id, code, authority, module, description)
        SELECT p.id, p.code, p.authority, p.module, p.description
        FROM public.permission p
        WHERE p.authority = 'audit:read'
        ON CONFLICT DO NOTHING
        $sql$,
        p_schema);

    EXECUTE format(
        $sql$
        INSERT INTO %I.role_permission (role_id, permission_id)
        SELECT '00000000-0000-0000-0000-000000000001'::uuid, p.id
        FROM %I.permission p
        WHERE p.authority = 'audit:read'
          AND EXISTS (SELECT 1 FROM %I.role r WHERE r.id = '00000000-0000-0000-0000-000000000001')
        ON CONFLICT DO NOTHING
        $sql$,
        p_schema, p_schema, p_schema);

    EXECUTE format(
        $sql$
        INSERT INTO %I.role (id, code, name, description, system, status, is_system, role_type, created_at)
        SELECT
            '56000000-0000-0000-0000-000000000100'::uuid,
            COALESCE((SELECT MAX(code) FROM %I.role), 0) + 1,
            'Auditor',
            'Consulta a trilha de auditoria e a configuracao de acesso, sem editar.',
            'CFG',
            'ACTIVE',
            false,
            'CUSTOM',
            now()
        ON CONFLICT DO NOTHING
        $sql$,
        p_schema, p_schema);

    EXECUTE format(
        $sql$
        INSERT INTO %I.role_permission (role_id, permission_id)
        SELECT r.id, p.id
        FROM %I.role r
        CROSS JOIN %I.permission p
        WHERE r.id = '56000000-0000-0000-0000-000000000100'
          AND p.authority IN ('audit:read', 'role:read', 'actingprofile:read', 'user:read')
        ON CONFLICT DO NOTHING
        $sql$,
        p_schema, p_schema, p_schema);
END
$_$;


-- Name: gesint_sync_admin_profile_permissions(); Type: FUNCTION; Schema: public; Owner: -

CREATE FUNCTION public.gesint_sync_admin_profile_permissions() RETURNS void
    LANGUAGE sql
    AS $$
    -- No-op: Administrador por sistema nao depende de role_permission.
    SELECT NULL;
$$;


-- Name: immutable_unaccent(text); Type: FUNCTION; Schema: public; Owner: -

CREATE FUNCTION public.immutable_unaccent(value text) RETURNS text
    LANGUAGE sql IMMUTABLE PARALLEL SAFE
    AS $$
    SELECT public.unaccent('public.unaccent', value)
$$;


-- Name: next_collaborator_access_code(); Type: FUNCTION; Schema: public; Owner: -

CREATE FUNCTION public.next_collaborator_access_code() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    base_code text;
    check_digit int;
    sum_digits int;
    digit int;
    doubled int;
    should_double boolean;
    i int;
BEGIN
    base_code := lpad((floor(random() * 100000000))::bigint::text, 8, '0');
    sum_digits := 0;
    should_double := true;
    FOR i IN REVERSE 8..1 LOOP
        digit := substr(base_code, i, 1)::int;
        IF should_double THEN
            doubled := digit * 2;
            IF doubled > 9 THEN
                doubled := doubled - 9;
            END IF;
            sum_digits := sum_digits + doubled;
        ELSE
            sum_digits := sum_digits + digit;
        END IF;
        should_double := NOT should_double;
    END LOOP;
    check_digit := (10 - (sum_digits % 10)) % 10;
    RETURN base_code || check_digit::text;
END
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

-- Name: acting_profile; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.acting_profile (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    name character varying(80) NOT NULL,
    description character varying(500),
    system gesint_types.system_scope_enum NOT NULL,
    data_scope gesint_types.data_scope_enum DEFAULT 'ALL'::gesint_types.data_scope_enum NOT NULL,
    scope_ref uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: acting_profile_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.acting_profile_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    name character varying(80),
    description character varying(500),
    system gesint_types.system_scope_enum,
    data_scope gesint_types.data_scope_enum,
    scope_ref uuid,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: admission_process; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.admission_process (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    collaborator_id uuid,
    admission_status gesint_types.admission_status_enum DEFAULT 'IN_PROGRESS'::gesint_types.admission_status_enum NOT NULL,
    started_at date,
    completed_at date,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    full_name character varying(200),
    social_name character varying(200),
    cpf character varying(14),
    rg character varying(20),
    birth_date date,
    gender gesint_types.gender_enum,
    marital_status gesint_types.marital_status_enum,
    mother_name character varying(200),
    father_name character varying(200),
    nationality character varying(60) DEFAULT 'Brasileiro'::character varying,
    pis_pasep character varying(20),
    email character varying(200),
    phone character varying(20),
    zip_code character varying(10),
    street character varying(200),
    number character varying(20),
    complement character varying(100),
    district character varying(100),
    expected_start_date date,
    company_id uuid,
    department_id uuid,
    job_position_id uuid,
    contract_type gesint_types.contract_type_enum DEFAULT 'CLT'::gesint_types.contract_type_enum NOT NULL,
    base_salary numeric(14,2),
    photo_object_id uuid,
    code integer NOT NULL,
    contract_start_date date,
    contract_end_date date,
    workload_schedule character varying(32),
    emergency_contacts jsonb DEFAULT '[]'::jsonb NOT NULL,
    provider_cnpj character varying(14),
    provider_legal_name character varying(200),
    provider_trade_name character varying(200),
    rg_issuer character varying(20),
    rg_state_code character varying(2),
    recess_enabled boolean DEFAULT false NOT NULL,
    recess_total_days_per_cycle integer,
    recess_cycle_months integer,
    recess_eligibility_after_months integer,
    recess_financial_mode gesint_types.recess_financial_mode_enum,
    recess_paid_percentage numeric(5,2),
    recess_allow_split boolean DEFAULT false NOT NULL,
    recess_max_split_periods integer,
    recess_minimum_split_days integer,
    recess_advance_notice_days integer DEFAULT 0 NOT NULL,
    recess_notes text,
    state_id uuid,
    city_id uuid,
    work_schedule_id uuid,
    blocked_reason text,
    race_color character varying(30),
    education_level character varying(30),
    birth_city_id uuid,
    birth_country character varying(60),
    disability_info jsonb,
    worker_category character varying(10),
    activity_nature character varying(20),
    establishment_id uuid,
    union_cnpj character varying(14),
    bank_account_esocial jsonb,
    manually_approved_at timestamp with time zone,
    manually_approved_by uuid,
    source_application_id uuid,
    source_candidate_id uuid,
    experience_period character varying(32),
    experience_extension_used boolean DEFAULT false NOT NULL,
    experience_milestone_days integer,
    experience_due_date date,
    experience_status character varying(32) DEFAULT 'NONE'::character varying NOT NULL,
    bank_code character varying(10),
    bank_agency character varying(20),
    bank_account_digit character varying(5),
    bank_account_type character varying(20),
    pix_key character varying(120),
    pre_admission_token character varying(64),
    pre_admission_token_expires_at timestamp with time zone,
    pre_admission_link_sent_at timestamp with time zone,
    pre_admission_completed_at timestamp with time zone,
    pcd_self_declared boolean,
    pcd_self_declared_at timestamp with time zone,
    bank_account character varying(30)
);


-- Name: COLUMN admission_process.photo_object_id; Type: COMMENT; Schema: public; Owner: -

COMMENT ON COLUMN public.admission_process.photo_object_id IS 'Referência ao storage_object (foto do colaborador no processo)';


-- Name: admission_process_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.admission_process_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    collaborator_id uuid,
    admission_status gesint_types.admission_status_enum,
    started_at date,
    completed_at date,
    notes text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    full_name character varying(200),
    social_name character varying(200),
    cpf character varying(14),
    rg character varying(20),
    birth_date date,
    gender gesint_types.gender_enum,
    marital_status gesint_types.marital_status_enum,
    mother_name character varying(200),
    father_name character varying(200),
    nationality character varying(60),
    pis_pasep character varying(20),
    email character varying(200),
    phone character varying(20),
    zip_code character varying(10),
    street character varying(200),
    number character varying(20),
    complement character varying(100),
    district character varying(100),
    expected_start_date date,
    company_id uuid,
    department_id uuid,
    job_position_id uuid,
    contract_type gesint_types.contract_type_enum,
    base_salary numeric(14,2),
    photo_object_id uuid,
    code integer,
    contract_start_date date,
    contract_end_date date,
    workload_schedule character varying(32),
    emergency_contacts jsonb,
    provider_cnpj character varying(14),
    provider_legal_name character varying(200),
    provider_trade_name character varying(200),
    rg_issuer character varying(20),
    rg_state_code character varying(2),
    recess_enabled boolean,
    recess_total_days_per_cycle integer,
    recess_cycle_months integer,
    recess_eligibility_after_months integer,
    recess_financial_mode gesint_types.recess_financial_mode_enum,
    recess_paid_percentage numeric(5,2),
    recess_allow_split boolean,
    recess_max_split_periods integer,
    recess_minimum_split_days integer,
    recess_advance_notice_days integer,
    recess_notes text,
    state_id uuid,
    city_id uuid,
    work_schedule_id uuid,
    blocked_reason text,
    race_color character varying(30),
    education_level character varying(30),
    birth_city_id uuid,
    birth_country character varying(60),
    disability_info jsonb,
    worker_category character varying(10),
    activity_nature character varying(20),
    establishment_id uuid,
    union_cnpj character varying(14),
    bank_account character varying(30),
    manually_approved_at timestamp with time zone,
    manually_approved_by uuid,
    rev bigint NOT NULL,
    revtype smallint,
    source_application_id uuid,
    source_candidate_id uuid,
    experience_period character varying(32),
    experience_extension_used boolean,
    experience_milestone_days integer,
    experience_due_date date,
    experience_status character varying(32),
    bank_code character varying(10),
    bank_agency character varying(20),
    bank_account_digit character varying(5),
    bank_account_type character varying(20),
    pix_key character varying(120),
    pre_admission_token character varying(64),
    pre_admission_token_expires_at timestamp with time zone,
    pre_admission_link_sent_at timestamp with time zone,
    pre_admission_completed_at timestamp with time zone,
    pcd_self_declared boolean,
    pcd_self_declared_at timestamp with time zone,
    bank_account_esocial jsonb
);


-- Name: admission_process_kanban_column; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.admission_process_kanban_column (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    column_key character varying(80) NOT NULL,
    name character varying(120) NOT NULL,
    color character varying(7),
    display_order integer DEFAULT 0 NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    system_column boolean DEFAULT false NOT NULL,
    sla_enabled boolean DEFAULT true NOT NULL,
    sla_business_days integer DEFAULT 5 NOT NULL,
    interview_column boolean DEFAULT false NOT NULL,
    column_action character varying(40) DEFAULT 'NONE'::character varying NOT NULL
);


-- Name: admission_process_kanban_column_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.admission_process_kanban_column_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    column_key character varying(80),
    name character varying(120),
    color character varying(7),
    display_order integer,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint,
    system_column boolean,
    sla_enabled boolean,
    sla_business_days integer,
    interview_column boolean,
    column_action character varying(40)
);


-- Name: admission_step; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.admission_step (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    admission_id uuid NOT NULL,
    step_key gesint_types.admission_step_key_enum NOT NULL,
    step_status gesint_types.admission_step_status_enum DEFAULT 'PENDING'::gesint_types.admission_step_status_enum NOT NULL,
    display_order integer NOT NULL,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    completed_by uuid,
    due_date date,
    blocked_reason text,
    skip_justification text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid,
    CONSTRAINT ck_admission_step_skip_justified CHECK (((step_status <> 'SKIPPED'::gesint_types.admission_step_status_enum) OR (skip_justification IS NOT NULL)))
);


-- Name: admission_step_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.admission_step_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    admission_id uuid,
    step_key gesint_types.admission_step_key_enum,
    step_status gesint_types.admission_step_status_enum,
    display_order integer,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    completed_by uuid,
    due_date date,
    blocked_reason text,
    skip_justification text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: agenda_event; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.agenda_event (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    owner_user_id uuid NOT NULL,
    title character varying(200) NOT NULL,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    location character varying(255),
    description text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid,
    CONSTRAINT ck_agenda_event_range CHECK ((ends_at >= starts_at))
);


-- Name: agenda_event_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.agenda_event_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    owner_user_id uuid,
    title character varying(200),
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    location character varying(255),
    description text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: app_user; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.app_user (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    collaborator_id uuid,
    username character varying(100) NOT NULL,
    email character varying(200) NOT NULL,
    password_hash character varying(255),
    last_login timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    name character varying(255),
    access_token_hash character varying(64),
    first_access_completed boolean DEFAULT false NOT NULL
);


-- Name: app_user_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.app_user_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    collaborator_id uuid,
    username character varying(100),
    email character varying(200),
    password_hash character varying(255),
    last_login timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    name character varying(255),
    access_token_hash character varying(64),
    first_access_completed boolean,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: attendance_record; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.attendance_record (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    collaborator_id uuid NOT NULL,
    work_date date NOT NULL,
    clock_in time without time zone,
    clock_out time without time zone,
    break_minutes integer DEFAULT 0,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    occurrence_type character varying(40) DEFAULT 'NORMAL_WORK'::gesint_types.attendance_occurrence_type_enum NOT NULL,
    occurrence_origin character varying(40) DEFAULT 'MANUAL'::gesint_types.attendance_occurrence_origin_enum NOT NULL,
    reference_id uuid,
    expected_hours numeric(5,2),
    worked_hours numeric(5,2),
    impacts_hour_bank boolean DEFAULT true NOT NULL,
    impacts_payroll boolean DEFAULT true NOT NULL,
    break_start time without time zone,
    break_end time without time zone,
    photo_object_id uuid,
    latitude numeric(10,7),
    longitude numeric(10,7),
    location_accuracy_meters numeric(10,2),
    company_id uuid
);


-- Name: attendance_record_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.attendance_record_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    collaborator_id uuid,
    work_date date,
    clock_in time without time zone,
    clock_out time without time zone,
    break_minutes integer,
    notes text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    occurrence_type character varying(40),
    occurrence_origin character varying(40),
    reference_id uuid,
    expected_hours numeric(5,2),
    worked_hours numeric(5,2),
    impacts_hour_bank boolean,
    impacts_payroll boolean,
    break_start time without time zone,
    break_end time without time zone,
    photo_object_id uuid,
    latitude numeric(10,7),
    longitude numeric(10,7),
    location_accuracy_meters numeric(10,2),
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: attendance_request; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.attendance_request (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    collaborator_id uuid NOT NULL,
    work_date date NOT NULL,
    attendance_record_id uuid,
    original_clock_in time without time zone,
    original_clock_out time without time zone,
    original_break_start time without time zone,
    original_break_end time without time zone,
    original_break_minutes integer,
    original_notes text,
    clock_in time without time zone,
    clock_out time without time zone,
    break_start time without time zone,
    break_end time without time zone,
    break_minutes integer,
    expected_hours numeric(5,2),
    worked_hours numeric(5,2),
    notes text,
    request_type character varying(40) NOT NULL,
    source character varying(40),
    client_request_id character varying(80),
    submitted_at timestamp with time zone,
    request_status character varying(40) NOT NULL,
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    review_reason text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    compensation_type character varying(40),
    company_id uuid
);


-- Name: attendance_request_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.attendance_request_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    collaborator_id uuid,
    work_date date,
    attendance_record_id uuid,
    original_clock_in time without time zone,
    original_clock_out time without time zone,
    original_break_start time without time zone,
    original_break_end time without time zone,
    original_break_minutes integer,
    original_notes text,
    clock_in time without time zone,
    clock_out time without time zone,
    break_start time without time zone,
    break_end time without time zone,
    break_minutes integer,
    expected_hours numeric(5,2),
    worked_hours numeric(5,2),
    notes text,
    request_type character varying(40),
    source character varying(40),
    client_request_id character varying(80),
    submitted_at timestamp with time zone,
    request_status character varying(40),
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    review_reason text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    compensation_type character varying(40),
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: audit_log; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_name character varying(100) NOT NULL,
    entity_id uuid,
    action character varying(40) NOT NULL,
    old_data jsonb,
    new_data jsonb,
    user_id uuid,
    ip_address inet,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    company_id uuid,
    category character varying(30) NOT NULL,
    record_label character varying(200),
    detail character varying(500),
    reason text
);


-- Name: benefit_enrollment; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.benefit_enrollment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    collaborator_id uuid NOT NULL,
    benefit_plan_id uuid NOT NULL,
    start_date date NOT NULL,
    end_date date,
    monthly_value numeric(14,2),
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    company_id uuid
);


-- Name: benefit_enrollment_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.benefit_enrollment_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    collaborator_id uuid,
    benefit_plan_id uuid,
    start_date date,
    end_date date,
    monthly_value numeric(14,2),
    notes text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: benefit_plan; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.benefit_plan (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    name character varying(120) NOT NULL,
    benefit_type character varying(60) NOT NULL,
    monthly_value numeric(14,2),
    description text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    start_date date,
    end_date date,
    code integer NOT NULL
);


-- Name: benefit_plan_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.benefit_plan_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    name character varying(120),
    benefit_type character varying(60),
    monthly_value numeric(14,2),
    description text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    start_date date,
    end_date date,
    code integer,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: candidate; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.candidate (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    full_name character varying(200) NOT NULL,
    cpf character varying(14),
    email character varying(200),
    phone character varying(20),
    birth_date date,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    city character varying(120),
    state_code character varying(2),
    linkedin_url character varying(300),
    portfolio_url character varying(300),
    company_id uuid
);


-- Name: candidate_account; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.candidate_account (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    candidate_id uuid NOT NULL,
    email character varying(200) NOT NULL,
    password_hash character varying(100),
    google_sub character varying(128),
    full_name character varying(200) NOT NULL,
    phone character varying(20),
    email_verified boolean DEFAULT false NOT NULL,
    last_login_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: candidate_account_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.candidate_account_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    candidate_id uuid,
    email character varying(200),
    password_hash character varying(100),
    google_sub character varying(128),
    full_name character varying(200),
    phone character varying(20),
    email_verified boolean,
    last_login_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: candidate_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.candidate_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    full_name character varying(200),
    cpf character varying(14),
    email character varying(200),
    phone character varying(20),
    birth_date date,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    city character varying(120),
    state_code character varying(2),
    linkedin_url character varying(300),
    portfolio_url character varying(300),
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: candidate_experience; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.candidate_experience (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    candidate_id uuid NOT NULL,
    company_name character varying(200) NOT NULL,
    job_title character varying(200) NOT NULL,
    start_date date NOT NULL,
    end_date date,
    current_job boolean DEFAULT false NOT NULL,
    description text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: candidate_experience_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.candidate_experience_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    candidate_id uuid,
    company_name character varying(200),
    job_title character varying(200),
    start_date date,
    end_date date,
    current_job boolean,
    description text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: careers_page; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.careers_page (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    display_name character varying(200),
    logo_object_id uuid,
    primary_color character varying(7),
    accent_color character varying(7),
    font_style character varying(16) DEFAULT 'MODERN'::character varying NOT NULL,
    corner_style character varying(16) DEFAULT 'ROUNDED'::character varying NOT NULL,
    show_salary boolean DEFAULT true NOT NULL,
    seo_title character varying(70),
    seo_description character varying(160),
    social_links jsonb DEFAULT '{}'::jsonb NOT NULL,
    privacy_notice text,
    privacy_notice_version integer DEFAULT 1 NOT NULL,
    talent_pool_months integer DEFAULT 12 NOT NULL,
    draft_revision integer DEFAULT 1 NOT NULL,
    published_revision integer,
    published_snapshot jsonb,
    published_at timestamp with time zone,
    published_by uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: careers_page_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.careers_page_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    display_name character varying(200),
    logo_object_id uuid,
    primary_color character varying(7),
    accent_color character varying(7),
    font_style character varying(16),
    corner_style character varying(16),
    show_salary boolean,
    seo_title character varying(70),
    seo_description character varying(160),
    social_links jsonb,
    privacy_notice text,
    privacy_notice_version integer,
    talent_pool_months integer,
    draft_revision integer,
    published_revision integer,
    published_snapshot jsonb,
    published_at timestamp with time zone,
    published_by uuid,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: careers_page_block; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.careers_page_block (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    page_id uuid NOT NULL,
    block_type character varying(32) NOT NULL,
    title character varying(200),
    subtitle character varying(400),
    content jsonb DEFAULT '{}'::jsonb NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    visible boolean DEFAULT true NOT NULL,
    system_block boolean DEFAULT false NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: careers_page_block_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.careers_page_block_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    page_id uuid,
    block_type character varying(32),
    title character varying(200),
    subtitle character varying(400),
    content jsonb,
    display_order integer,
    visible boolean,
    system_block boolean,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: cbo_occupation; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.cbo_occupation (
    id uuid NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    cbo_code character varying(6) NOT NULL,
    name character varying(255) NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: city; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.city (
    id uuid NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    ibge_code integer NOT NULL,
    name character varying(150) NOT NULL,
    state_id uuid NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: collaborator; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.collaborator (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    full_name character varying(200) NOT NULL,
    social_name character varying(200),
    cpf character varying(14) NOT NULL,
    rg character varying(20),
    birth_date date,
    gender gesint_types.gender_enum,
    marital_status gesint_types.marital_status_enum,
    mother_name character varying(200),
    father_name character varying(200),
    nationality character varying(60) DEFAULT 'Brasileiro'::character varying,
    pis_pasep character varying(20),
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    photo_object_id uuid,
    code integer NOT NULL,
    rg_issuer character varying(20),
    rg_state_code character varying(2),
    company_id uuid,
    access_code character varying(9),
    manager_collaborator_id uuid
);


-- Name: COLUMN collaborator.photo_object_id; Type: COMMENT; Schema: public; Owner: -

COMMENT ON COLUMN public.collaborator.photo_object_id IS 'Referência ao storage_object (foto de perfil do colaborador)';


-- Name: COLUMN collaborator.access_code; Type: COMMENT; Schema: public; Owner: -

COMMENT ON COLUMN public.collaborator.access_code IS 'Codigo unico do colaborador para app mobile e registro de ponto web; enviado por e-mail futuramente';


-- Name: collaborator_address; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.collaborator_address (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    collaborator_id uuid NOT NULL,
    zip_code character varying(10),
    street character varying(200),
    number character varying(20),
    complement character varying(100),
    district character varying(100),
    is_primary boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    state_id uuid,
    city_id uuid,
    company_id uuid
);


-- Name: collaborator_address_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.collaborator_address_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    collaborator_id uuid,
    zip_code character varying(10),
    street character varying(200),
    number character varying(20),
    complement character varying(100),
    district character varying(100),
    is_primary boolean,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    state_id uuid,
    city_id uuid,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: collaborator_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.collaborator_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    full_name character varying(200),
    social_name character varying(200),
    cpf character varying(14),
    rg character varying(20),
    birth_date date,
    gender gesint_types.gender_enum,
    marital_status gesint_types.marital_status_enum,
    mother_name character varying(200),
    father_name character varying(200),
    nationality character varying(60),
    pis_pasep character varying(20),
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    photo_object_id uuid,
    code integer,
    rg_issuer character varying(20),
    rg_state_code character varying(2),
    company_id uuid,
    access_code character varying(9),
    rev bigint NOT NULL,
    revtype smallint,
    manager_collaborator_id uuid
);


-- Name: collaborator_contact; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.collaborator_contact (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    collaborator_id uuid NOT NULL,
    email character varying(200),
    phone character varying(20),
    is_primary boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    company_id uuid
);


-- Name: collaborator_contact_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.collaborator_contact_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    collaborator_id uuid,
    email character varying(200),
    phone character varying(20),
    is_primary boolean,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: company; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.company (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    legal_name character varying(255) NOT NULL,
    trade_name character varying(255),
    cnpj character varying(18) NOT NULL,
    state_registration character varying(32),
    municipal_registration character varying(32),
    email character varying(200),
    phone character varying(20),
    street character varying(200),
    number character varying(20),
    complement character varying(100),
    district character varying(100),
    city character varying(100),
    state_code character varying(2),
    zip_code character varying(10),
    tax_regime character varying(60),
    accountant_name character varying(200),
    accountant_email character varying(200),
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    parent_id uuid,
    is_headquarters boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


-- Name: company_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.company_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    legal_name character varying(255),
    trade_name character varying(255),
    cnpj character varying(18),
    state_registration character varying(32),
    municipal_registration character varying(32),
    email character varying(200),
    phone character varying(20),
    street character varying(200),
    number character varying(20),
    complement character varying(100),
    district character varying(100),
    city character varying(100),
    state_code character varying(2),
    zip_code character varying(10),
    tax_regime character varying(60),
    accountant_name character varying(200),
    accountant_email character varying(200),
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    parent_id uuid,
    is_headquarters boolean,
    sort_order integer,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: competency; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.competency (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    type character varying(32) NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    interview_guide_question text
);


-- Name: competency_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.competency_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    name character varying(200),
    description text,
    type character varying(32),
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint,
    interview_guide_question text
);


-- Name: complementary_exam; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.complementary_exam (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    occupational_exam_id uuid NOT NULL,
    procedure_code character varying(10) NOT NULL,
    performed_date date,
    result gesint_types.complementary_exam_result_enum DEFAULT 'NOT_PERFORMED'::gesint_types.complementary_exam_result_enum NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid
);


-- Name: complementary_exam_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.complementary_exam_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    occupational_exam_id uuid,
    procedure_code character varying(10),
    performed_date date,
    result gesint_types.complementary_exam_result_enum,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: contract_recess_period; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.contract_recess_period (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    policy_id uuid NOT NULL,
    collaborator_id uuid NOT NULL,
    cycle_start date NOT NULL,
    cycle_end date NOT NULL,
    entitled_days integer NOT NULL,
    used_days integer DEFAULT 0 NOT NULL,
    reserved_days integer DEFAULT 0 NOT NULL,
    period_status gesint_types.recess_period_status_enum NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid,
    CONSTRAINT ck_recess_period_balance CHECK (((entitled_days >= 0) AND (used_days >= 0) AND (reserved_days >= 0) AND ((used_days + reserved_days) <= entitled_days)))
);


-- Name: contract_recess_period_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.contract_recess_period_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    policy_id uuid,
    collaborator_id uuid,
    cycle_start date,
    cycle_end date,
    entitled_days integer,
    used_days integer,
    reserved_days integer,
    period_status gesint_types.recess_period_status_enum,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: contract_recess_policy; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.contract_recess_policy (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    employment_contract_id uuid NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    total_days_per_cycle integer,
    cycle_months integer,
    eligibility_after_months integer,
    financial_mode gesint_types.recess_financial_mode_enum,
    paid_percentage numeric(5,2),
    allow_split boolean DEFAULT false NOT NULL,
    max_split_periods integer,
    minimum_split_days integer,
    advance_notice_days integer DEFAULT 0 NOT NULL,
    effective_from date NOT NULL,
    effective_until date,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid,
    CONSTRAINT ck_recess_policy_cycle CHECK (((enabled = false) OR (cycle_months > 0))),
    CONSTRAINT ck_recess_policy_days CHECK (((enabled = false) OR (total_days_per_cycle > 0))),
    CONSTRAINT ck_recess_policy_percentage CHECK (((paid_percentage IS NULL) OR ((paid_percentage >= (0)::numeric) AND (paid_percentage <= (100)::numeric)))),
    CONSTRAINT ck_recess_policy_wait CHECK (((eligibility_after_months IS NULL) OR (eligibility_after_months >= 0)))
);


-- Name: contract_recess_policy_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.contract_recess_policy_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    employment_contract_id uuid,
    enabled boolean,
    total_days_per_cycle integer,
    cycle_months integer,
    eligibility_after_months integer,
    financial_mode gesint_types.recess_financial_mode_enum,
    paid_percentage numeric(5,2),
    allow_split boolean,
    max_split_periods integer,
    minimum_split_days integer,
    advance_notice_days integer,
    effective_from date,
    effective_until date,
    notes text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: department; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.department (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    company_id uuid,
    parent_id uuid,
    name character varying(120) NOT NULL,
    cost_center character varying(40),
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    description text,
    monthly_budget numeric(15,2),
    location character varying(200),
    phone character varying(30),
    fax character varying(30),
    phone_extension character varying(20),
    email character varying(120),
    responsible_collaborator_ids jsonb DEFAULT '[]'::jsonb NOT NULL
);


-- Name: department_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.department_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    company_id uuid,
    parent_id uuid,
    name character varying(120),
    cost_center character varying(40),
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    description text,
    monthly_budget numeric(15,2),
    location character varying(200),
    phone character varying(30),
    fax character varying(30),
    phone_extension character varying(20),
    email character varying(120),
    responsible_collaborator_ids jsonb,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: development_action_template; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.development_action_template (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    competency_id uuid NOT NULL,
    competency_name character varying(200),
    min_gap integer NOT NULL,
    title character varying(200) NOT NULL,
    suggested_description text,
    action_type character varying(32) NOT NULL,
    suggested_deadline_days integer,
    evidence_required boolean DEFAULT false NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: development_action_template_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.development_action_template_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    competency_id uuid,
    competency_name character varying(200),
    min_gap integer,
    title character varying(200),
    suggested_description text,
    action_type character varying(32),
    suggested_deadline_days integer,
    evidence_required boolean,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: development_plan; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.development_plan (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    collaborator_id uuid NOT NULL,
    collaborator_name character varying(200),
    registration_number character varying(60),
    job_position_id uuid,
    job_position_name character varying(200),
    target_job_position_id uuid,
    target_job_position_name character varying(200),
    department_id uuid,
    department_name character varying(200),
    manager_id uuid,
    manager_name character varying(200),
    track_id uuid,
    track_name character varying(200),
    origin_id uuid,
    origin_name character varying(200),
    start_date date,
    end_date date,
    checkin_frequency character varying(24),
    checkin_frequency_days integer,
    plan_status character varying(32) DEFAULT 'DRAFT'::character varying NOT NULL,
    notes text,
    progress integer DEFAULT 0 NOT NULL,
    last_checkin_at date,
    approved_at timestamp with time zone,
    approved_by uuid,
    completed_at timestamp with time zone,
    canceled_at timestamp with time zone,
    cancel_reason text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid
);


-- Name: development_plan_action; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.development_plan_action (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    goal_id uuid NOT NULL,
    title character varying(240) NOT NULL,
    description text,
    action_type character varying(32),
    assignee character varying(200),
    start_date date,
    end_date date,
    workload_hours integer,
    estimated_cost numeric(12,2),
    evidence_required boolean DEFAULT false NOT NULL,
    status character varying(24),
    progress integer,
    notes text,
    company_id uuid
);


-- Name: development_plan_action_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.development_plan_action_aud (
    id uuid NOT NULL,
    goal_id uuid,
    title character varying(240),
    description text,
    action_type character varying(32),
    assignee character varying(200),
    start_date date,
    end_date date,
    workload_hours integer,
    estimated_cost numeric(12,2),
    evidence_required boolean,
    status character varying(24),
    progress integer,
    notes text,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: development_plan_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.development_plan_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    collaborator_id uuid,
    collaborator_name character varying(200),
    registration_number character varying(60),
    job_position_id uuid,
    job_position_name character varying(200),
    target_job_position_id uuid,
    target_job_position_name character varying(200),
    department_id uuid,
    department_name character varying(200),
    manager_id uuid,
    manager_name character varying(200),
    track_id uuid,
    track_name character varying(200),
    origin_id uuid,
    origin_name character varying(200),
    start_date date,
    end_date date,
    checkin_frequency character varying(24),
    checkin_frequency_days integer,
    plan_status character varying(32),
    notes text,
    progress integer,
    last_checkin_at date,
    approved_at timestamp with time zone,
    approved_by uuid,
    completed_at timestamp with time zone,
    canceled_at timestamp with time zone,
    cancel_reason text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: development_plan_checkin; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.development_plan_checkin (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plan_id uuid NOT NULL,
    date date NOT NULL,
    participants text,
    summary text,
    perceived_progress integer,
    blockers text,
    next_steps text,
    collaborator_rating integer,
    manager_rating integer,
    company_id uuid
);


-- Name: development_plan_checkin_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.development_plan_checkin_aud (
    id uuid NOT NULL,
    plan_id uuid,
    date date,
    participants text,
    summary text,
    perceived_progress integer,
    blockers text,
    next_steps text,
    collaborator_rating integer,
    manager_rating integer,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: development_plan_competency; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.development_plan_competency (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plan_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    competency_name character varying(200),
    current_level_id uuid,
    current_level_order integer,
    expected_level_id uuid,
    expected_level_order integer,
    gap integer,
    priority character varying(24),
    notes text,
    company_id uuid
);


-- Name: development_plan_competency_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.development_plan_competency_aud (
    id uuid NOT NULL,
    plan_id uuid,
    competency_id uuid,
    competency_name character varying(200),
    current_level_id uuid,
    current_level_order integer,
    expected_level_id uuid,
    expected_level_order integer,
    gap integer,
    priority character varying(24),
    notes text,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: development_plan_evidence; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.development_plan_evidence (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plan_id uuid NOT NULL,
    evidence_type_id uuid,
    evidence_type_name character varying(200),
    description text,
    file character varying(400),
    link character varying(600),
    goal_id uuid,
    action_id uuid,
    date date,
    responsible_user_id uuid,
    responsible_user_name character varying(200),
    company_id uuid
);


-- Name: development_plan_evidence_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.development_plan_evidence_aud (
    id uuid NOT NULL,
    plan_id uuid,
    evidence_type_id uuid,
    evidence_type_name character varying(200),
    description text,
    file character varying(400),
    link character varying(600),
    goal_id uuid,
    action_id uuid,
    date date,
    responsible_user_id uuid,
    responsible_user_name character varying(200),
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: development_plan_goal; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.development_plan_goal (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plan_id uuid NOT NULL,
    title character varying(240) NOT NULL,
    description text,
    competency_id uuid,
    competency_name character varying(200),
    type character varying(40),
    expected_result text,
    success_indicator text,
    deadline date,
    weight integer,
    status character varying(24),
    progress integer,
    company_id uuid
);


-- Name: development_plan_goal_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.development_plan_goal_aud (
    id uuid NOT NULL,
    plan_id uuid,
    title character varying(240),
    description text,
    competency_id uuid,
    competency_name character varying(200),
    type character varying(40),
    expected_result text,
    success_indicator text,
    deadline date,
    weight integer,
    status character varying(24),
    progress integer,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: development_plan_origin; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.development_plan_origin (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: development_plan_origin_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.development_plan_origin_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    name character varying(200),
    description text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: development_track; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.development_track (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: development_track_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.development_track_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    name character varying(200),
    description text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: development_track_competency; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.development_track_competency (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    track_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    competency_name character varying(200),
    expected_level_id uuid,
    expected_level_order integer,
    required boolean DEFAULT false NOT NULL,
    weight integer
);


-- Name: development_track_competency_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.development_track_competency_aud (
    id uuid NOT NULL,
    track_id uuid,
    competency_id uuid,
    competency_name character varying(200),
    expected_level_id uuid,
    expected_level_order integer,
    required boolean,
    weight integer,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: digital_certificate; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.digital_certificate (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    alias character varying(120) NOT NULL,
    certificate_type gesint_types.digital_certificate_type_enum DEFAULT 'A1'::gesint_types.digital_certificate_type_enum NOT NULL,
    purpose gesint_types.digital_certificate_purpose_enum DEFAULT 'ESOCIAL'::gesint_types.digital_certificate_purpose_enum NOT NULL,
    environment gesint_types.digital_certificate_environment_enum DEFAULT 'HOMOLOGATION'::gesint_types.digital_certificate_environment_enum NOT NULL,
    owner_document character varying(20),
    subject_name character varying(255),
    issuer_name character varying(255),
    serial_number character varying(100),
    thumbprint character varying(128),
    valid_from timestamp with time zone,
    valid_until timestamp with time zone,
    is_default boolean DEFAULT false NOT NULL,
    pkcs12_encrypted bytea NOT NULL,
    password_encrypted bytea NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid
);


-- Name: digital_certificate_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.digital_certificate_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    alias character varying(120),
    certificate_type gesint_types.digital_certificate_type_enum,
    purpose gesint_types.digital_certificate_purpose_enum,
    environment gesint_types.digital_certificate_environment_enum,
    owner_document character varying(20),
    subject_name character varying(255),
    issuer_name character varying(255),
    serial_number character varying(100),
    thumbprint character varying(128),
    valid_from timestamp with time zone,
    valid_until timestamp with time zone,
    is_default boolean,
    pkcs12_encrypted bytea,
    password_encrypted bytea,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: document_type; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.document_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    type_code character varying(64) NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    data_class gesint_types.document_data_class_enum DEFAULT 'COMUM'::gesint_types.document_data_class_enum NOT NULL,
    contexts jsonb DEFAULT '[]'::jsonb NOT NULL,
    system_managed boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: document_type_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.document_type_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    type_code character varying(64),
    name character varying(200),
    description text,
    data_class gesint_types.document_data_class_enum,
    contexts jsonb,
    system_managed boolean,
    sort_order integer,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: employment_contract; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.employment_contract (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    collaborator_id uuid NOT NULL,
    company_id uuid,
    job_position_id uuid,
    contract_type gesint_types.contract_type_enum DEFAULT 'CLT'::gesint_types.contract_type_enum NOT NULL,
    start_date date NOT NULL,
    end_date date,
    base_salary numeric(14,2),
    workload_hours numeric(5,2),
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    experience_period character varying(32),
    experience_extension_used boolean DEFAULT false NOT NULL,
    experience_milestone_days integer,
    experience_due_date date,
    experience_status character varying(32) DEFAULT 'NONE'::character varying NOT NULL
);


-- Name: employment_contract_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.employment_contract_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    collaborator_id uuid,
    company_id uuid,
    job_position_id uuid,
    contract_type gesint_types.contract_type_enum,
    start_date date,
    end_date date,
    base_salary numeric(14,2),
    workload_hours numeric(5,2),
    notes text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    rev bigint NOT NULL,
    revtype smallint,
    experience_period character varying(32),
    experience_extension_used boolean,
    experience_milestone_days integer,
    experience_due_date date,
    experience_status character varying(32)
);


-- Name: esocial_event; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.esocial_event (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    admission_id uuid,
    collaborator_id uuid,
    event_type gesint_types.esocial_event_type_enum NOT NULL,
    event_status gesint_types.esocial_event_status_enum DEFAULT 'NAO_GERADO'::gesint_types.esocial_event_status_enum NOT NULL,
    due_date date,
    transmitted_at timestamp with time zone,
    receipt_number character varying(60),
    errors jsonb,
    payload jsonb,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid
);


-- Name: esocial_event_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.esocial_event_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    admission_id uuid,
    collaborator_id uuid,
    event_type gesint_types.esocial_event_type_enum,
    event_status gesint_types.esocial_event_status_enum,
    due_date date,
    transmitted_at timestamp with time zone,
    receipt_number character varying(60),
    errors jsonb,
    payload jsonb,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: esocial_health_event; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.esocial_health_event (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    occupational_exam_id uuid NOT NULL,
    event_type character varying(10) DEFAULT 'S-2220'::character varying NOT NULL,
    layout_version character varying(10) DEFAULT 'S-1.3'::character varying NOT NULL,
    payload_json jsonb,
    protocol_number character varying(60),
    receipt_number character varying(60),
    transmission_status gesint_types.esocial_transmission_status_enum DEFAULT 'PENDING'::gesint_types.esocial_transmission_status_enum NOT NULL,
    transmission_deadline date,
    errors text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid
);


-- Name: esocial_health_event_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.esocial_health_event_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    occupational_exam_id uuid,
    event_type character varying(10),
    layout_version character varying(10),
    payload_json jsonb,
    protocol_number character varying(60),
    receipt_number character varying(60),
    transmission_status gesint_types.esocial_transmission_status_enum,
    transmission_deadline date,
    errors text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: esocial_table19_dismissal_reason; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.esocial_table19_dismissal_reason (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    reason_code character varying(10) NOT NULL,
    description character varying(240) NOT NULL,
    dismissal_type character varying(40) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: esocial_table19_dismissal_reason_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.esocial_table19_dismissal_reason_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    reason_code character varying(10),
    description character varying(240),
    dismissal_type character varying(40),
    active boolean,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: esocial_table27_procedure; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.esocial_table27_procedure (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    procedure_code character varying(10) NOT NULL,
    description character varying(200) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: esocial_table27_procedure_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.esocial_table27_procedure_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    procedure_code character varying(10),
    description character varying(200),
    active boolean,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: evidence_type; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.evidence_type (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    requires_file boolean DEFAULT false NOT NULL,
    allows_link boolean DEFAULT false NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: evidence_type_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.evidence_type_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    name character varying(200),
    description text,
    requires_file boolean,
    allows_link boolean,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: exam_requirement; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.exam_requirement (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    job_position_id uuid NOT NULL,
    exam_type gesint_types.occupational_exam_type_enum NOT NULL,
    complementary_procedure_codes jsonb,
    periodicity_months integer,
    risk_basis text,
    version_number integer DEFAULT 1 NOT NULL,
    valid_from date NOT NULL,
    valid_until date,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    name character varying(200),
    company_id uuid
);


-- Name: exam_requirement_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.exam_requirement_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    job_position_id uuid,
    exam_type gesint_types.occupational_exam_type_enum,
    complementary_procedure_codes jsonb,
    periodicity_months integer,
    risk_basis text,
    version_number integer,
    valid_from date,
    valid_until date,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    name character varying(200),
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: exit_interview; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.exit_interview (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    collaborator_id uuid NOT NULL,
    interview_date date NOT NULL,
    departure_reason character varying(255),
    feedback text,
    would_recommend boolean,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    interview_status character varying(32) DEFAULT 'DRAFT'::character varying NOT NULL,
    relationship_type character varying(16) DEFAULT 'CLT'::character varying NOT NULL,
    collaborator_name character varying(200),
    registration_number character varying(60),
    job_position_name character varying(160),
    department_name character varying(160),
    company_name character varying(200),
    manager_name character varying(200),
    admission_or_contract_start_date date,
    termination_or_contract_end_date date,
    tenure_days integer,
    termination_type character varying(64),
    interviewer_name character varying(200),
    main_reason character varying(64),
    secondary_reasons jsonb DEFAULT '[]'::jsonb NOT NULL,
    detailed_reason text,
    ratings jsonb DEFAULT '[]'::jsonb NOT NULL,
    open_answers jsonb DEFAULT '[]'::jsonb NOT NULL,
    would_return character varying(16),
    company_would_rehire character varying(16),
    rehire_notes text,
    return_checklist jsonb DEFAULT '[]'::jsonb NOT NULL,
    template_key character varying(100),
    template_version integer,
    template_payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    completed_at timestamp with time zone,
    canceled_at timestamp with time zone,
    cancel_reason text,
    department_id uuid,
    job_position_id uuid,
    company_id uuid
);


-- Name: exit_interview_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.exit_interview_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    collaborator_id uuid,
    interview_date date,
    departure_reason character varying(255),
    feedback text,
    would_recommend boolean,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    interview_status character varying(32),
    relationship_type character varying(16),
    collaborator_name character varying(200),
    registration_number character varying(60),
    job_position_name character varying(160),
    department_name character varying(160),
    company_name character varying(200),
    manager_name character varying(200),
    admission_or_contract_start_date date,
    termination_or_contract_end_date date,
    tenure_days integer,
    termination_type character varying(64),
    interviewer_name character varying(200),
    main_reason character varying(64),
    secondary_reasons jsonb,
    detailed_reason text,
    ratings jsonb,
    open_answers jsonb,
    would_return character varying(16),
    company_would_rehire character varying(16),
    rehire_notes text,
    return_checklist jsonb,
    template_key character varying(100),
    template_version integer,
    template_payload jsonb,
    completed_at timestamp with time zone,
    canceled_at timestamp with time zone,
    cancel_reason text,
    department_id uuid,
    job_position_id uuid,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: exit_interview_return_checklist_item; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.exit_interview_return_checklist_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    item_key character varying(80) NOT NULL,
    description character varying(160) NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: exit_interview_return_checklist_item_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.exit_interview_return_checklist_item_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    item_key character varying(80),
    description character varying(160),
    display_order integer,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: experience_evaluation; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.experience_evaluation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    company_id uuid,
    collaborator_id uuid NOT NULL,
    admission_process_id uuid NOT NULL,
    job_position_id uuid,
    collaborator_name character varying(200),
    job_position_name character varying(200),
    admission_date date,
    experience_period character varying(32) NOT NULL,
    experience_extension_used boolean DEFAULT false NOT NULL,
    experience_milestone_days integer NOT NULL,
    experience_due_date date NOT NULL,
    period_status character varying(32) DEFAULT 'IN_PERIOD'::character varying NOT NULL,
    evaluation_status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    evaluator_user_id uuid,
    evaluator_name character varying(200),
    submitted_at timestamp with time zone,
    average_score numeric(4,1),
    selection_average numeric(4,1),
    decision character varying(32),
    decision_reason character varying(255),
    decision_notes text,
    decided_by uuid,
    decided_by_name character varying(200),
    decided_at timestamp with time zone,
    offboarding_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    CONSTRAINT ck_experience_evaluation_decision CHECK (((decision IS NULL) OR ((decision)::text = ANY ((ARRAY['EFFECTIVE'::character varying, 'EXTEND'::character varying, 'END'::character varying, 'AUTO_EFFECTIVE'::character varying])::text[])))),
    CONSTRAINT ck_experience_evaluation_eval_status CHECK (((evaluation_status)::text = ANY ((ARRAY['DRAFT'::character varying, 'SUBMITTED'::character varying])::text[]))),
    CONSTRAINT ck_experience_evaluation_period CHECK (((experience_period)::text = ANY ((ARRAY['NONE'::character varying, 'DAYS_30_60'::character varying, 'DAYS_45_45'::character varying, 'DAYS_90'::character varying])::text[]))),
    CONSTRAINT ck_experience_evaluation_period_status CHECK (((period_status)::text = ANY ((ARRAY['IN_PERIOD'::character varying, 'PENDING_DECISION'::character varying, 'EFFECTIVE'::character varying, 'EXTENDED'::character varying, 'ENDED'::character varying])::text[])))
);


-- Name: experience_evaluation_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.experience_evaluation_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    company_id uuid,
    collaborator_id uuid,
    admission_process_id uuid,
    job_position_id uuid,
    collaborator_name character varying(200),
    job_position_name character varying(200),
    admission_date date,
    experience_period character varying(32),
    experience_extension_used boolean,
    experience_milestone_days integer,
    experience_due_date date,
    period_status character varying(32),
    evaluation_status character varying(20),
    evaluator_user_id uuid,
    evaluator_name character varying(200),
    submitted_at timestamp with time zone,
    average_score numeric(4,1),
    selection_average numeric(4,1),
    decision character varying(32),
    decision_reason character varying(255),
    decision_notes text,
    decided_by uuid,
    decided_by_name character varying(200),
    decided_at timestamp with time zone,
    offboarding_id uuid,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: experience_evaluation_score; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.experience_evaluation_score (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    company_id uuid,
    evaluation_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    score integer NOT NULL,
    justification text DEFAULT ''::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    CONSTRAINT ck_experience_score_range CHECK (((score >= 1) AND (score <= 4)))
);


-- Name: experience_evaluation_score_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.experience_evaluation_score_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    company_id uuid,
    evaluation_id uuid,
    competency_id uuid,
    score integer,
    justification text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: job_application_interview_evaluation; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.job_application_interview_evaluation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    company_id uuid,
    job_vacancy_application_id uuid NOT NULL,
    column_key character varying(80) NOT NULL,
    evaluator_user_id uuid NOT NULL,
    evaluator_name character varying(200),
    evaluation_status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    submitted_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    recommendation character varying(40),
    CONSTRAINT ck_interview_evaluation_status CHECK (((evaluation_status)::text = ANY ((ARRAY['DRAFT'::character varying, 'SUBMITTED'::character varying])::text[])))
);


-- Name: job_application_interview_evaluation_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.job_application_interview_evaluation_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    company_id uuid,
    job_vacancy_application_id uuid,
    column_key character varying(80),
    evaluator_user_id uuid,
    evaluator_name character varying(200),
    evaluation_status character varying(20),
    submitted_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint,
    recommendation character varying(40)
);


-- Name: job_application_interview_score; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.job_application_interview_score (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    company_id uuid,
    evaluation_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    score integer NOT NULL,
    justification text DEFAULT ''::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    CONSTRAINT ck_interview_score_range CHECK (((score >= 1) AND (score <= 5)))
);


-- Name: job_application_interview_score_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.job_application_interview_score_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    company_id uuid,
    evaluation_id uuid,
    competency_id uuid,
    score integer,
    justification text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: job_position; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.job_position (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    department_id uuid,
    title character varying(120) NOT NULL,
    cbo_code character varying(10),
    description text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    nature character varying(32),
    company_id uuid
);


-- Name: job_position_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.job_position_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    department_id uuid,
    title character varying(120),
    cbo_code character varying(10),
    description text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    nature character varying(32),
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: job_position_competency; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.job_position_competency (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    company_id uuid,
    job_position_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    expected_level gesint_types.job_position_competency_expected_level_enum NOT NULL,
    used_in jsonb DEFAULT '[]'::jsonb NOT NULL,
    version_number integer DEFAULT 1 NOT NULL,
    valid_from date NOT NULL,
    valid_until date,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: job_position_competency_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.job_position_competency_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    company_id uuid,
    job_position_id uuid,
    competency_id uuid,
    expected_level gesint_types.job_position_competency_expected_level_enum,
    used_in jsonb,
    version_number integer,
    valid_from date,
    valid_until date,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: job_position_salary_table; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.job_position_salary_table (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    company_id uuid,
    job_position_id uuid NOT NULL,
    name character varying(120),
    version_number integer DEFAULT 1 NOT NULL,
    valid_from date NOT NULL,
    valid_until date,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: job_position_salary_table_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.job_position_salary_table_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    company_id uuid,
    job_position_id uuid,
    name character varying(120),
    version_number integer,
    valid_from date,
    valid_until date,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: job_position_salary_table_item; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.job_position_salary_table_item (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    salary_table_id uuid NOT NULL,
    level gesint_types.job_position_salary_level_enum NOT NULL,
    min_salary numeric(14,2) NOT NULL,
    reference_salary numeric(14,2) NOT NULL,
    max_salary numeric(14,2) NOT NULL
);


-- Name: job_position_salary_table_item_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.job_position_salary_table_item_aud (
    id uuid NOT NULL,
    salary_table_id uuid,
    level gesint_types.job_position_salary_level_enum,
    min_salary numeric(14,2),
    reference_salary numeric(14,2),
    max_salary numeric(14,2),
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: job_requisition; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.job_requisition (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    company_id uuid,
    job_position_id uuid NOT NULL,
    job_position_title character varying(200),
    salary_level gesint_types.job_position_salary_level_enum,
    contract_type character varying(32),
    experience_period character varying(32),
    positions_count integer DEFAULT 1 NOT NULL,
    desired_start_date date,
    reason character varying(32) NOT NULL,
    offboarding_id uuid,
    replaced_collaborator_id uuid,
    replaced_collaborator_name character varying(200),
    replaced_dismissal_date date,
    replaced_dismissal_type character varying(32),
    proposed_salary numeric(14,2),
    band_min_salary numeric(14,2),
    band_reference_salary numeric(14,2),
    band_max_salary numeric(14,2),
    out_of_band boolean DEFAULT false NOT NULL,
    justification text,
    requisition_status character varying(32) DEFAULT 'DRAFT'::character varying NOT NULL,
    submitted_at timestamp with time zone,
    manager_approved_by uuid,
    manager_approved_by_name character varying(200),
    manager_approved_at timestamp with time zone,
    hr_approved_by uuid,
    hr_approved_by_name character varying(200),
    hr_approved_at timestamp with time zone,
    director_approved_by uuid,
    director_approved_by_name character varying(200),
    director_approved_at timestamp with time zone,
    rejected_by uuid,
    rejected_by_name character varying(200),
    rejected_at timestamp with time zone,
    rejected_stage character varying(32),
    rejection_reason text,
    canceled_at timestamp with time zone,
    job_vacancy_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: job_requisition_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.job_requisition_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    company_id uuid,
    job_position_id uuid,
    job_position_title character varying(200),
    salary_level gesint_types.job_position_salary_level_enum,
    contract_type character varying(32),
    experience_period character varying(32),
    positions_count integer,
    desired_start_date date,
    reason character varying(32),
    offboarding_id uuid,
    replaced_collaborator_id uuid,
    replaced_collaborator_name character varying(200),
    replaced_dismissal_date date,
    replaced_dismissal_type character varying(32),
    proposed_salary numeric(14,2),
    band_min_salary numeric(14,2),
    band_reference_salary numeric(14,2),
    band_max_salary numeric(14,2),
    out_of_band boolean,
    justification text,
    requisition_status character varying(32),
    submitted_at timestamp with time zone,
    manager_approved_by uuid,
    manager_approved_by_name character varying(200),
    manager_approved_at timestamp with time zone,
    hr_approved_by uuid,
    hr_approved_by_name character varying(200),
    hr_approved_at timestamp with time zone,
    director_approved_by uuid,
    director_approved_by_name character varying(200),
    director_approved_at timestamp with time zone,
    rejected_by uuid,
    rejected_by_name character varying(200),
    rejected_at timestamp with time zone,
    rejected_stage character varying(32),
    rejection_reason text,
    canceled_at timestamp with time zone,
    job_vacancy_id uuid,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: job_vacancy; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.job_vacancy (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    job_position_id uuid,
    job_title character varying(200) NOT NULL,
    positions_count integer DEFAULT 1 NOT NULL,
    description text,
    activities text,
    assignments text,
    seniority_level character varying(32),
    expected_completion_date date,
    target_boards jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    salary numeric(14,2),
    slug character varying(120),
    is_public boolean DEFAULT false NOT NULL,
    published_at timestamp with time zone,
    department character varying(200),
    location character varying(200),
    work_modality character varying(32),
    contract_type character varying(32),
    work_schedule character varying(80),
    salary_max numeric(14,2),
    requirements text,
    benefits text,
    company_id uuid,
    requirement_items jsonb DEFAULT '[]'::jsonb NOT NULL,
    recruiter_collaborator_id uuid,
    requesting_manager_collaborator_id uuid,
    interviewer_collaborator_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
    candidate_return_sla_business_days integer DEFAULT 5 NOT NULL,
    affirmative_pcd boolean DEFAULT false NOT NULL,
    publish_google_jobs boolean DEFAULT true NOT NULL
);


-- Name: job_vacancy_application; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.job_vacancy_application (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    job_vacancy_id uuid NOT NULL,
    candidate_id uuid NOT NULL,
    application_status character varying(32) DEFAULT 'APPLIED'::character varying NOT NULL,
    applied_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    kanban_column_key character varying(80),
    stage_comments jsonb DEFAULT '{}'::jsonb NOT NULL,
    cover_letter text,
    referral_source character varying(80),
    salary_expectation numeric(14,2),
    ai_score numeric(5,2),
    ai_status character varying(32),
    ai_analyzed_at timestamp with time zone,
    ai_analysis jsonb,
    company_id uuid,
    privacy_consent_at timestamp with time zone,
    privacy_consent_version character varying(40),
    talent_pool_consent_at timestamp with time zone,
    talent_pool_consent_version character varying(40),
    talent_pool_consent_until date,
    applicant_snapshot jsonb,
    rejection_reason character varying(48),
    rejection_requirement character varying(300),
    rejection_note text,
    rejected_at timestamp with time zone,
    rejected_by uuid,
    rejected_by_name character varying(200),
    rejection_feedback_status character varying(16),
    rejection_feedback_at timestamp with time zone,
    rejection_feedback_detail character varying(500),
    kanban_column_entered_at timestamp with time zone,
    kanban_sla_last_reminder_date date,
    kanban_sla_candidate_notified_at timestamp with time zone,
    admission_process_id uuid,
    candidate_acceptance character varying(32),
    acceptance_date date,
    acceptance_channel character varying(32),
    offer_sent_at timestamp with time zone,
    offer_contract_type character varying(32),
    offer_base_salary numeric(14,2),
    offer_expected_start_date date,
    offer_experience_period character varying(32),
    offer_work_schedule_id uuid,
    offer_decline_reason character varying(500)
);


-- Name: job_vacancy_application_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.job_vacancy_application_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    job_vacancy_id uuid,
    candidate_id uuid,
    application_status character varying(32),
    applied_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    kanban_column_key character varying(80),
    stage_comments jsonb,
    cover_letter text,
    referral_source character varying(80),
    salary_expectation numeric(14,2),
    ai_score numeric(5,2),
    ai_status character varying(32),
    ai_analyzed_at timestamp with time zone,
    ai_analysis jsonb,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint,
    privacy_consent_at timestamp with time zone,
    privacy_consent_version character varying(40),
    talent_pool_consent_at timestamp with time zone,
    talent_pool_consent_version character varying(40),
    talent_pool_consent_until date,
    applicant_snapshot jsonb,
    rejection_reason character varying(48),
    rejection_requirement character varying(300),
    rejection_note text,
    rejected_at timestamp with time zone,
    rejected_by uuid,
    rejected_by_name character varying(200),
    rejection_feedback_status character varying(16),
    rejection_feedback_at timestamp with time zone,
    rejection_feedback_detail character varying(500),
    kanban_column_entered_at timestamp with time zone,
    kanban_sla_last_reminder_date date,
    kanban_sla_candidate_notified_at timestamp with time zone,
    admission_process_id uuid,
    candidate_acceptance character varying(32),
    acceptance_date date,
    acceptance_channel character varying(32),
    offer_sent_at timestamp with time zone,
    offer_contract_type character varying(32),
    offer_base_salary numeric(14,2),
    offer_expected_start_date date,
    offer_experience_period character varying(32),
    offer_work_schedule_id uuid,
    offer_decline_reason character varying(500)
);


-- Name: job_vacancy_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.job_vacancy_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    job_position_id uuid,
    job_title character varying(200),
    positions_count integer,
    description text,
    activities text,
    assignments text,
    seniority_level character varying(32),
    expected_completion_date date,
    target_boards jsonb,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    salary numeric(14,2),
    slug character varying(120),
    is_public boolean,
    published_at timestamp with time zone,
    department character varying(200),
    location character varying(200),
    work_modality character varying(32),
    contract_type character varying(32),
    work_schedule character varying(80),
    salary_max numeric(14,2),
    requirements text,
    benefits text,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint,
    requirement_items jsonb,
    recruiter_collaborator_id uuid,
    requesting_manager_collaborator_id uuid,
    interviewer_collaborator_ids jsonb,
    candidate_return_sla_business_days integer,
    affirmative_pcd boolean,
    publish_google_jobs boolean
);


-- Name: job_vacancy_competency; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.job_vacancy_competency (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    company_id uuid,
    job_vacancy_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: job_vacancy_competency_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.job_vacancy_competency_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    company_id uuid,
    job_vacancy_id uuid,
    competency_id uuid,
    display_order integer,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: leave_request; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.leave_request (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    collaborator_id uuid NOT NULL,
    leave_type gesint_types.leave_type_enum DEFAULT 'VACATION'::gesint_types.leave_type_enum NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    approved boolean DEFAULT false NOT NULL,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    pecuniary_allowance_days integer DEFAULT 0 NOT NULL,
    unjustified_absences integer,
    vacation_days_entitled integer,
    acquisition_period_start date,
    acquisition_period_end date,
    split_group_id uuid,
    split_sequence integer,
    base_salary_snapshot numeric(14,2),
    justified_absences integer,
    review_status character varying(20),
    review_reason text,
    recess_period_id uuid,
    recess_financial_mode gesint_types.recess_financial_mode_enum,
    recess_paid_percentage numeric(5,2),
    absence_status character varying(30),
    duration_days integer,
    cid character varying(20),
    physician_name character varying(180),
    physician_crm character varying(40),
    certificate_source character varying(80),
    requires_inss boolean DEFAULT false NOT NULL,
    inss_referral_date date,
    return_date date,
    work_accident_stability boolean DEFAULT false NOT NULL,
    related_certificate_days integer,
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    company_id uuid
);


-- Name: leave_request_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.leave_request_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    collaborator_id uuid,
    leave_type gesint_types.leave_type_enum,
    start_date date,
    end_date date,
    approved boolean,
    notes text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    pecuniary_allowance_days integer,
    unjustified_absences integer,
    vacation_days_entitled integer,
    acquisition_period_start date,
    acquisition_period_end date,
    split_group_id uuid,
    split_sequence integer,
    base_salary_snapshot numeric(14,2),
    justified_absences integer,
    review_status character varying(20),
    review_reason text,
    recess_period_id uuid,
    recess_financial_mode gesint_types.recess_financial_mode_enum,
    recess_paid_percentage numeric(5,2),
    absence_status character varying(30),
    duration_days integer,
    cid character varying(20),
    physician_name character varying(180),
    physician_crm character varying(40),
    certificate_source character varying(80),
    requires_inss boolean,
    inss_referral_date date,
    return_date date,
    work_accident_stability boolean,
    related_certificate_days integer,
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: medical_clinic; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.medical_clinic (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    corporate_name character varying(200) NOT NULL,
    cnpj character varying(20) NOT NULL,
    address character varying(255),
    phone character varying(30),
    email character varying(150),
    exams_offered text,
    accreditation_valid_until date,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: medical_clinic_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.medical_clinic_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    corporate_name character varying(200),
    cnpj character varying(20),
    address character varying(255),
    phone character varying(30),
    email character varying(150),
    exams_offered text,
    accreditation_valid_until date,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: occupational_exam; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.occupational_exam (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    collaborator_id uuid NOT NULL,
    job_position_id uuid NOT NULL,
    exam_type gesint_types.occupational_exam_type_enum NOT NULL,
    lifecycle_status gesint_types.occupational_exam_lifecycle_status_enum DEFAULT 'PREVISTO'::gesint_types.occupational_exam_lifecycle_status_enum NOT NULL,
    clinic_id uuid,
    examiner_physician_id uuid,
    coordinator_physician_id uuid,
    scheduled_date date,
    clinical_exam_date date,
    aso_issue_date date,
    due_date date,
    result gesint_types.occupational_exam_result_enum,
    cid character varying(20),
    clinical_observations text,
    source_trigger gesint_types.occupational_exam_source_trigger_enum DEFAULT 'MANUAL'::gesint_types.occupational_exam_source_trigger_enum NOT NULL,
    related_leave_request_id uuid,
    exam_requirement_version_id uuid,
    dismissal_waiver_applied boolean DEFAULT false NOT NULL,
    dismissal_waiver_reason text,
    retention_until date,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid
);


-- Name: occupational_exam_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.occupational_exam_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    collaborator_id uuid,
    job_position_id uuid,
    exam_type gesint_types.occupational_exam_type_enum,
    lifecycle_status gesint_types.occupational_exam_lifecycle_status_enum,
    clinic_id uuid,
    examiner_physician_id uuid,
    coordinator_physician_id uuid,
    scheduled_date date,
    clinical_exam_date date,
    aso_issue_date date,
    due_date date,
    result gesint_types.occupational_exam_result_enum,
    cid character varying(20),
    clinical_observations text,
    source_trigger gesint_types.occupational_exam_source_trigger_enum,
    related_leave_request_id uuid,
    exam_requirement_version_id uuid,
    dismissal_waiver_applied boolean,
    dismissal_waiver_reason text,
    retention_until date,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: occupational_physician; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.occupational_physician (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    full_name character varying(180) NOT NULL,
    crm character varying(20) NOT NULL,
    crm_state character varying(2) NOT NULL,
    role gesint_types.occupational_physician_role_enum NOT NULL,
    phone character varying(30),
    email character varying(150),
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: occupational_physician_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.occupational_physician_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    full_name character varying(180),
    crm character varying(20),
    crm_state character varying(2),
    role gesint_types.occupational_physician_role_enum,
    phone character varying(30),
    email character varying(150),
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: occupational_physician_clinic; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.occupational_physician_clinic (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    physician_id uuid NOT NULL,
    clinic_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


-- Name: occupational_physician_clinic_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.occupational_physician_clinic_aud (
    id uuid NOT NULL,
    physician_id uuid,
    clinic_id uuid,
    created_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: offboarding; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.offboarding (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    collaborator_id uuid NOT NULL,
    dismissal_date date NOT NULL,
    dismissal_type gesint_types.dismissal_type_enum DEFAULT 'WITHOUT_CAUSE'::gesint_types.dismissal_type_enum NOT NULL,
    dismissal_notes text,
    homologation_notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    company_id uuid,
    process_status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    esocial_dismissal_reason_code character varying(10),
    esocial_dismissal_reason_label character varying(240),
    last_work_day date,
    notice_type character varying(40),
    notice_days integer,
    notice_start_date date,
    notice_end_date date,
    workload_reduction_applicable boolean DEFAULT false NOT NULL,
    exit_checklist jsonb DEFAULT '[]'::jsonb NOT NULL,
    exit_interview_id uuid,
    accountant_package_status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    accountant_package_sent_at timestamp with time zone,
    accountant_package_detail text,
    demissional_waiver_registered boolean DEFAULT false NOT NULL,
    demissional_waiver_notes text,
    completed_at timestamp with time zone
);


-- Name: offboarding_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.offboarding_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    collaborator_id uuid,
    dismissal_date date,
    dismissal_type gesint_types.dismissal_type_enum,
    dismissal_notes text,
    homologation_notes text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint,
    process_status character varying(20),
    esocial_dismissal_reason_code character varying(10),
    esocial_dismissal_reason_label character varying(240),
    last_work_day date,
    notice_type character varying(40),
    notice_days integer,
    notice_start_date date,
    notice_end_date date,
    workload_reduction_applicable boolean,
    exit_checklist jsonb,
    exit_interview_id uuid,
    accountant_package_status character varying(20),
    accountant_package_sent_at timestamp with time zone,
    accountant_package_detail text,
    demissional_waiver_registered boolean,
    demissional_waiver_notes text,
    completed_at timestamp with time zone
);


-- Name: payment_batch; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.payment_batch (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    payment_period_id uuid NOT NULL,
    batch_type gesint_types.payment_batch_type_enum DEFAULT 'SALARY'::gesint_types.payment_batch_type_enum NOT NULL,
    description character varying(500),
    source_object_id uuid NOT NULL,
    batch_status gesint_types.payment_batch_status_enum DEFAULT 'PROCESSING'::gesint_types.payment_batch_status_enum NOT NULL,
    item_count integer DEFAULT 0 NOT NULL,
    divergent_count integer DEFAULT 0 NOT NULL,
    sent_count integer DEFAULT 0 NOT NULL,
    processed_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    processing_page integer,
    total_pages integer,
    source_file_name character varying(500),
    company_id uuid
);


-- Name: COLUMN payment_batch.code; Type: COMMENT; Schema: public; Owner: -

COMMENT ON COLUMN public.payment_batch.code IS 'Sequential integer code for payment batch';


-- Name: payment_batch_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.payment_batch_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    payment_period_id uuid,
    batch_type gesint_types.payment_batch_type_enum,
    description character varying(500),
    source_object_id uuid,
    batch_status gesint_types.payment_batch_status_enum,
    item_count integer,
    divergent_count integer,
    sent_count integer,
    processed_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    processing_page integer,
    total_pages integer,
    source_file_name character varying(500),
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: payment_period; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.payment_period (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    reference_date date NOT NULL,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    company_id uuid
);


-- Name: COLUMN payment_period.code; Type: COMMENT; Schema: public; Owner: -

COMMENT ON COLUMN public.payment_period.code IS 'Sequential integer code for payment period';


-- Name: payment_period_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.payment_period_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    reference_date date,
    notes text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: payment_slip; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.payment_slip (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    payment_batch_id uuid NOT NULL,
    collaborator_id uuid,
    extracted_name character varying(200) NOT NULL,
    slip_object_id uuid,
    slip_status gesint_types.payment_slip_status_enum DEFAULT 'PROCESSED'::gesint_types.payment_slip_status_enum NOT NULL,
    page_number integer NOT NULL,
    processed_at timestamp with time zone,
    sent_at timestamp with time zone,
    email_sent_at timestamp with time zone,
    whatsapp_sent_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    company_id uuid
);


-- Name: COLUMN payment_slip.code; Type: COMMENT; Schema: public; Owner: -

COMMENT ON COLUMN public.payment_slip.code IS 'Sequential integer code for payment slip';


-- Name: payment_slip_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.payment_slip_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    payment_batch_id uuid,
    collaborator_id uuid,
    extracted_name character varying(200),
    slip_object_id uuid,
    slip_status gesint_types.payment_slip_status_enum,
    page_number integer,
    processed_at timestamp with time zone,
    sent_at timestamp with time zone,
    email_sent_at timestamp with time zone,
    whatsapp_sent_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: payroll_event; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.payroll_event (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    event_code character varying(30) NOT NULL,
    description character varying(200) NOT NULL,
    event_type gesint_types.payroll_event_type_enum DEFAULT 'EARNING'::gesint_types.payroll_event_type_enum NOT NULL,
    incides_inss boolean DEFAULT false NOT NULL,
    incides_fgts boolean DEFAULT false NOT NULL,
    incides_irrf boolean DEFAULT false NOT NULL,
    formula text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL
);


-- Name: COLUMN payroll_event.code; Type: COMMENT; Schema: public; Owner: -

COMMENT ON COLUMN public.payroll_event.code IS 'Sequential integer code for payroll event';


-- Name: payroll_event_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.payroll_event_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    event_code character varying(30),
    description character varying(200),
    event_type gesint_types.payroll_event_type_enum,
    incides_inss boolean,
    incides_fgts boolean,
    incides_irrf boolean,
    formula text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: payroll_run; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.payroll_run (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    payroll_status gesint_types.payroll_status_enum DEFAULT 'OPEN'::gesint_types.payroll_status_enum NOT NULL,
    processed_at timestamp with time zone,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    opened_at timestamp with time zone,
    closed_at timestamp with time zone,
    reference_date date NOT NULL,
    company_id uuid
);


-- Name: COLUMN payroll_run.reference_date; Type: COMMENT; Schema: public; Owner: -

COMMENT ON COLUMN public.payroll_run.reference_date IS 'Payroll competence date (first day of month)';


-- Name: payroll_run_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.payroll_run_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    payroll_status gesint_types.payroll_status_enum,
    processed_at timestamp with time zone,
    notes text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    opened_at timestamp with time zone,
    closed_at timestamp with time zone,
    reference_date date,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: payslip; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.payslip (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    payroll_run_id uuid NOT NULL,
    collaborator_id uuid NOT NULL,
    gross_amount numeric(14,2) DEFAULT 0 NOT NULL,
    deductions_amount numeric(14,2) DEFAULT 0 NOT NULL,
    net_amount numeric(14,2) DEFAULT 0 NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    base_salary numeric(14,2),
    generated_at timestamp with time zone,
    company_id uuid
);


-- Name: payslip_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.payslip_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    payroll_run_id uuid,
    collaborator_id uuid,
    gross_amount numeric(14,2),
    deductions_amount numeric(14,2),
    net_amount numeric(14,2),
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    base_salary numeric(14,2),
    generated_at timestamp with time zone,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: payslip_entry; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.payslip_entry (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    payslip_id uuid NOT NULL,
    payroll_event_id uuid NOT NULL,
    quantity numeric(14,4) DEFAULT 1 NOT NULL,
    unit_value numeric(14,2) DEFAULT 0 NOT NULL,
    total_value numeric(14,2) DEFAULT 0 NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    company_id uuid
);


-- Name: COLUMN payslip_entry.code; Type: COMMENT; Schema: public; Owner: -

COMMENT ON COLUMN public.payslip_entry.code IS 'Sequential integer code for payslip entry';


-- Name: payslip_entry_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.payslip_entry_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    payslip_id uuid,
    payroll_event_id uuid,
    quantity numeric(14,4),
    unit_value numeric(14,2),
    total_value numeric(14,2),
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: performance_review; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.performance_review (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    collaborator_id uuid NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    rating gesint_types.performance_rating_enum,
    goals_summary text,
    feedback text,
    reviewer_name character varying(200),
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    company_id uuid
);


-- Name: performance_review_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.performance_review_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    collaborator_id uuid,
    period_start date,
    period_end date,
    rating gesint_types.performance_rating_enum,
    goals_summary text,
    feedback text,
    reviewer_name character varying(200),
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: permission; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.permission (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    authority character varying(100) NOT NULL,
    module character varying(50) NOT NULL,
    description text,
    code integer NOT NULL
);


-- Name: COLUMN permission.authority; Type: COMMENT; Schema: public; Owner: -

COMMENT ON COLUMN public.permission.authority IS 'Chave RBAC (ex.: department:read)';


-- Name: COLUMN permission.code; Type: COMMENT; Schema: public; Owner: -

COMMENT ON COLUMN public.permission.code IS 'Código sequencial inteiro da permissão';


-- Name: proficiency_level; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.proficiency_level (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    level_order integer NOT NULL,
    weight integer NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: proficiency_level_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.proficiency_level_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    name character varying(200),
    description text,
    level_order integer,
    weight integer,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: refresh_token; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.refresh_token (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    code integer NOT NULL
);


-- Name: refresh_token_blacklist; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.refresh_token_blacklist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    token_hash character varying(255) NOT NULL,
    revoked_at timestamp with time zone DEFAULT now() NOT NULL,
    code integer NOT NULL
);


-- Name: revinfo; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.revinfo (
    rev bigint NOT NULL,
    changed_at timestamp with time zone NOT NULL,
    changed_by uuid
);


-- Name: revinfo_rev_seq; Type: SEQUENCE; Schema: public; Owner: -

ALTER TABLE public.revinfo ALTER COLUMN rev ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.revinfo_rev_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: role; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.role (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    code integer NOT NULL,
    system gesint_types.system_scope_enum DEFAULT 'RH'::gesint_types.system_scope_enum NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    is_system boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    role_type gesint_types.role_type_enum DEFAULT 'CUSTOM'::gesint_types.role_type_enum NOT NULL,
    created_by uuid,
    updated_by uuid
);


-- Name: role_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.role_aud (
    id uuid NOT NULL,
    name character varying(50),
    description text,
    code integer,
    system gesint_types.system_scope_enum,
    status gesint_types.status_enum,
    is_system boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    role_type gesint_types.role_type_enum,
    created_by uuid,
    updated_by uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: role_permission; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.role_permission (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


-- Name: role_permission_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.role_permission_aud (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: search_document; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.search_document (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    document_type character varying(40) NOT NULL,
    entity_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    subtitle character varying(255),
    search_text text NOT NULL,
    href character varying(255) NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    company_id uuid
);


-- Name: state; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.state (
    id uuid NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    ibge_code integer NOT NULL,
    abbreviation character varying(2) NOT NULL,
    name character varying(100) NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: storage_object; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.storage_object (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    bucket character varying(63) DEFAULT 'gesint-local'::character varying NOT NULL,
    object_key character varying(1024) NOT NULL,
    version_id character varying(36) DEFAULT 'null'::character varying NOT NULL,
    is_latest boolean DEFAULT true NOT NULL,
    content_type character varying(255),
    content_length bigint DEFAULT 0 NOT NULL,
    etag character varying(64),
    storage_class character varying(32) DEFAULT 'STANDARD'::character varying NOT NULL,
    server_side_encryption character varying(32),
    local_file_path character varying(2048),
    sha256_hex character varying(64),
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    company_id uuid
);


-- Name: storage_object_link; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.storage_object_link (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    storage_object_id uuid NOT NULL,
    entity_type character varying(64) NOT NULL,
    entity_id uuid NOT NULL,
    link_role character varying(32) DEFAULT 'attachment'::character varying NOT NULL,
    display_name character varying(255),
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    document_type character varying(64),
    company_id uuid
);


-- Name: system_notification; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.system_notification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    notification_type character varying(80) NOT NULL,
    title character varying(180) NOT NULL,
    message text NOT NULL,
    reference_type character varying(80),
    reference_id uuid,
    reference_due_date date,
    read_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    recipient_user_id uuid,
    company_id uuid
);


-- Name: system_setting; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.system_setting (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    setting_key character varying(120) NOT NULL,
    setting_value text NOT NULL,
    description text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: system_setting_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.system_setting_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    setting_key character varying(120),
    setting_value text,
    description text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: tax_obligation; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.tax_obligation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    collaborator_id uuid NOT NULL,
    obligation_type gesint_types.tax_obligation_type_enum DEFAULT 'IRRF'::gesint_types.tax_obligation_type_enum NOT NULL,
    reference_code character varying(60),
    start_date date NOT NULL,
    end_date date,
    base_amount numeric(14,2),
    rate_percent numeric(5,2),
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    company_id uuid
);


-- Name: tax_obligation_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.tax_obligation_aud (
    id uuid NOT NULL,
    status gesint_types.status_enum,
    collaborator_id uuid,
    obligation_type gesint_types.tax_obligation_type_enum,
    reference_code character varying(60),
    start_date date,
    end_date date,
    base_amount numeric(14,2),
    rate_percent numeric(5,2),
    notes text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: user_acting_profile; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.user_acting_profile (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    acting_profile_id uuid NOT NULL,
    company_id uuid,
    data_scope character varying(32),
    scope_ref uuid
);


-- Name: user_acting_profile_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.user_acting_profile_aud (
    id uuid NOT NULL,
    user_id uuid,
    acting_profile_id uuid,
    company_id uuid,
    rev bigint NOT NULL,
    revtype smallint,
    data_scope character varying(32),
    scope_ref uuid
);


-- Name: user_role; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.user_role (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    company_id uuid,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


-- Name: user_role_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.user_role_aud (
    user_id uuid,
    role_id uuid,
    company_id uuid,
    id uuid NOT NULL,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: work_schedule; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.work_schedule (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    name character varying(120) NOT NULL,
    description text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: work_schedule_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.work_schedule_aud (
    id uuid NOT NULL,
    code integer,
    status gesint_types.status_enum,
    name character varying(120),
    description text,
    created_by uuid,
    created_at timestamp with time zone,
    updated_by uuid,
    updated_at timestamp with time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: work_schedule_day; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.work_schedule_day (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    work_schedule_id uuid NOT NULL,
    day_of_week character varying(16) NOT NULL,
    period1_start time without time zone,
    period1_end time without time zone,
    period2_start time without time zone,
    period2_end time without time zone
);


-- Name: work_schedule_day_aud; Type: TABLE; Schema: public; Owner: -

CREATE TABLE public.work_schedule_day_aud (
    id uuid NOT NULL,
    work_schedule_id uuid,
    day_of_week character varying(16),
    period1_start time without time zone,
    period1_end time without time zone,
    period2_start time without time zone,
    period2_end time without time zone,
    rev bigint NOT NULL,
    revtype smallint
);


-- Name: acting_profile_aud acting_profile_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.acting_profile_aud
    ADD CONSTRAINT acting_profile_aud_pkey PRIMARY KEY (id, rev);


-- Name: acting_profile acting_profile_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.acting_profile
    ADD CONSTRAINT acting_profile_code_key UNIQUE (code);


-- Name: acting_profile acting_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.acting_profile
    ADD CONSTRAINT acting_profile_pkey PRIMARY KEY (id);


-- Name: admission_process_aud admission_process_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.admission_process_aud
    ADD CONSTRAINT admission_process_aud_pkey PRIMARY KEY (id, rev);


-- Name: admission_process_kanban_column_aud admission_process_kanban_column_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.admission_process_kanban_column_aud
    ADD CONSTRAINT admission_process_kanban_column_aud_pkey PRIMARY KEY (id, rev);


-- Name: admission_process_kanban_column admission_process_kanban_column_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.admission_process_kanban_column
    ADD CONSTRAINT admission_process_kanban_column_code_key UNIQUE (code);


-- Name: admission_process_kanban_column admission_process_kanban_column_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.admission_process_kanban_column
    ADD CONSTRAINT admission_process_kanban_column_pkey PRIMARY KEY (id);


-- Name: admission_process admission_process_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.admission_process
    ADD CONSTRAINT admission_process_pkey PRIMARY KEY (id);


-- Name: admission_step_aud admission_step_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.admission_step_aud
    ADD CONSTRAINT admission_step_aud_pkey PRIMARY KEY (id, rev);


-- Name: admission_step admission_step_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.admission_step
    ADD CONSTRAINT admission_step_code_key UNIQUE (code);


-- Name: admission_step admission_step_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.admission_step
    ADD CONSTRAINT admission_step_pkey PRIMARY KEY (id);


-- Name: agenda_event_aud agenda_event_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.agenda_event_aud
    ADD CONSTRAINT agenda_event_aud_pkey PRIMARY KEY (id, rev);


-- Name: agenda_event agenda_event_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.agenda_event
    ADD CONSTRAINT agenda_event_code_key UNIQUE (code);


-- Name: agenda_event agenda_event_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.agenda_event
    ADD CONSTRAINT agenda_event_pkey PRIMARY KEY (id);


-- Name: app_user_aud app_user_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.app_user_aud
    ADD CONSTRAINT app_user_aud_pkey PRIMARY KEY (id, rev);


-- Name: app_user app_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_pkey PRIMARY KEY (id);


-- Name: attendance_record_aud attendance_record_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.attendance_record_aud
    ADD CONSTRAINT attendance_record_aud_pkey PRIMARY KEY (id, rev);


-- Name: attendance_record attendance_record_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.attendance_record
    ADD CONSTRAINT attendance_record_pkey PRIMARY KEY (id);


-- Name: attendance_request_aud attendance_request_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.attendance_request_aud
    ADD CONSTRAINT attendance_request_aud_pkey PRIMARY KEY (id, rev);


-- Name: attendance_request attendance_request_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.attendance_request
    ADD CONSTRAINT attendance_request_pkey PRIMARY KEY (id);


-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


-- Name: benefit_enrollment_aud benefit_enrollment_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.benefit_enrollment_aud
    ADD CONSTRAINT benefit_enrollment_aud_pkey PRIMARY KEY (id, rev);


-- Name: benefit_enrollment benefit_enrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.benefit_enrollment
    ADD CONSTRAINT benefit_enrollment_pkey PRIMARY KEY (id);


-- Name: benefit_plan_aud benefit_plan_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.benefit_plan_aud
    ADD CONSTRAINT benefit_plan_aud_pkey PRIMARY KEY (id, rev);


-- Name: benefit_plan benefit_plan_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.benefit_plan
    ADD CONSTRAINT benefit_plan_pkey PRIMARY KEY (id);


-- Name: candidate_account_aud candidate_account_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.candidate_account_aud
    ADD CONSTRAINT candidate_account_aud_pkey PRIMARY KEY (id, rev);


-- Name: candidate_account candidate_account_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.candidate_account
    ADD CONSTRAINT candidate_account_code_key UNIQUE (code);


-- Name: candidate_account candidate_account_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.candidate_account
    ADD CONSTRAINT candidate_account_pkey PRIMARY KEY (id);


-- Name: candidate_aud candidate_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.candidate_aud
    ADD CONSTRAINT candidate_aud_pkey PRIMARY KEY (id, rev);


-- Name: candidate candidate_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.candidate
    ADD CONSTRAINT candidate_code_key UNIQUE (code);


-- Name: candidate_experience_aud candidate_experience_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.candidate_experience_aud
    ADD CONSTRAINT candidate_experience_aud_pkey PRIMARY KEY (id, rev);


-- Name: candidate_experience candidate_experience_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.candidate_experience
    ADD CONSTRAINT candidate_experience_code_key UNIQUE (code);


-- Name: candidate_experience candidate_experience_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.candidate_experience
    ADD CONSTRAINT candidate_experience_pkey PRIMARY KEY (id);


-- Name: candidate candidate_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.candidate
    ADD CONSTRAINT candidate_pkey PRIMARY KEY (id);


-- Name: careers_page_aud careers_page_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.careers_page_aud
    ADD CONSTRAINT careers_page_aud_pkey PRIMARY KEY (id, rev);


-- Name: careers_page_block_aud careers_page_block_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.careers_page_block_aud
    ADD CONSTRAINT careers_page_block_aud_pkey PRIMARY KEY (id, rev);


-- Name: careers_page_block careers_page_block_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.careers_page_block
    ADD CONSTRAINT careers_page_block_code_key UNIQUE (code);


-- Name: careers_page_block careers_page_block_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.careers_page_block
    ADD CONSTRAINT careers_page_block_pkey PRIMARY KEY (id);


-- Name: careers_page careers_page_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.careers_page
    ADD CONSTRAINT careers_page_code_key UNIQUE (code);


-- Name: careers_page careers_page_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.careers_page
    ADD CONSTRAINT careers_page_pkey PRIMARY KEY (id);


-- Name: cbo_occupation cbo_occupation_cbo_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.cbo_occupation
    ADD CONSTRAINT cbo_occupation_cbo_code_key UNIQUE (cbo_code);


-- Name: cbo_occupation cbo_occupation_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.cbo_occupation
    ADD CONSTRAINT cbo_occupation_code_key UNIQUE (code);


-- Name: cbo_occupation cbo_occupation_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.cbo_occupation
    ADD CONSTRAINT cbo_occupation_pkey PRIMARY KEY (id);


-- Name: city city_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.city
    ADD CONSTRAINT city_code_key UNIQUE (code);


-- Name: city city_ibge_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.city
    ADD CONSTRAINT city_ibge_code_key UNIQUE (ibge_code);


-- Name: city city_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.city
    ADD CONSTRAINT city_pkey PRIMARY KEY (id);


-- Name: collaborator_address_aud collaborator_address_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.collaborator_address_aud
    ADD CONSTRAINT collaborator_address_aud_pkey PRIMARY KEY (id, rev);


-- Name: collaborator_address collaborator_address_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.collaborator_address
    ADD CONSTRAINT collaborator_address_pkey PRIMARY KEY (id);


-- Name: collaborator_aud collaborator_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.collaborator_aud
    ADD CONSTRAINT collaborator_aud_pkey PRIMARY KEY (id, rev);


-- Name: collaborator_contact_aud collaborator_contact_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.collaborator_contact_aud
    ADD CONSTRAINT collaborator_contact_aud_pkey PRIMARY KEY (id, rev);


-- Name: collaborator_contact collaborator_contact_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.collaborator_contact
    ADD CONSTRAINT collaborator_contact_pkey PRIMARY KEY (id);


-- Name: company_aud company_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.company_aud
    ADD CONSTRAINT company_aud_pkey PRIMARY KEY (id, rev);


-- Name: company company_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_pkey PRIMARY KEY (id);


-- Name: competency_aud competency_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.competency_aud
    ADD CONSTRAINT competency_aud_pkey PRIMARY KEY (id, rev);


-- Name: competency competency_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.competency
    ADD CONSTRAINT competency_code_key UNIQUE (code);


-- Name: competency competency_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.competency
    ADD CONSTRAINT competency_pkey PRIMARY KEY (id);


-- Name: complementary_exam_aud complementary_exam_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.complementary_exam_aud
    ADD CONSTRAINT complementary_exam_aud_pkey PRIMARY KEY (id, rev);


-- Name: complementary_exam complementary_exam_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.complementary_exam
    ADD CONSTRAINT complementary_exam_code_key UNIQUE (code);


-- Name: complementary_exam complementary_exam_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.complementary_exam
    ADD CONSTRAINT complementary_exam_pkey PRIMARY KEY (id);


-- Name: contract_recess_period_aud contract_recess_period_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.contract_recess_period_aud
    ADD CONSTRAINT contract_recess_period_aud_pkey PRIMARY KEY (id, rev);


-- Name: contract_recess_period contract_recess_period_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.contract_recess_period
    ADD CONSTRAINT contract_recess_period_code_key UNIQUE (code);


-- Name: contract_recess_period contract_recess_period_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.contract_recess_period
    ADD CONSTRAINT contract_recess_period_pkey PRIMARY KEY (id);


-- Name: contract_recess_policy_aud contract_recess_policy_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.contract_recess_policy_aud
    ADD CONSTRAINT contract_recess_policy_aud_pkey PRIMARY KEY (id, rev);


-- Name: contract_recess_policy contract_recess_policy_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.contract_recess_policy
    ADD CONSTRAINT contract_recess_policy_code_key UNIQUE (code);


-- Name: contract_recess_policy contract_recess_policy_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.contract_recess_policy
    ADD CONSTRAINT contract_recess_policy_pkey PRIMARY KEY (id);


-- Name: department_aud department_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.department_aud
    ADD CONSTRAINT department_aud_pkey PRIMARY KEY (id, rev);


-- Name: department department_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.department
    ADD CONSTRAINT department_pkey PRIMARY KEY (id);


-- Name: development_action_template_aud development_action_template_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_action_template_aud
    ADD CONSTRAINT development_action_template_aud_pkey PRIMARY KEY (id, rev);


-- Name: development_action_template development_action_template_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_action_template
    ADD CONSTRAINT development_action_template_code_key UNIQUE (code);


-- Name: development_action_template development_action_template_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_action_template
    ADD CONSTRAINT development_action_template_pkey PRIMARY KEY (id);


-- Name: development_plan_action_aud development_plan_action_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan_action_aud
    ADD CONSTRAINT development_plan_action_aud_pkey PRIMARY KEY (id, rev);


-- Name: development_plan_action development_plan_action_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan_action
    ADD CONSTRAINT development_plan_action_pkey PRIMARY KEY (id);


-- Name: development_plan_aud development_plan_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan_aud
    ADD CONSTRAINT development_plan_aud_pkey PRIMARY KEY (id, rev);


-- Name: development_plan_checkin_aud development_plan_checkin_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan_checkin_aud
    ADD CONSTRAINT development_plan_checkin_aud_pkey PRIMARY KEY (id, rev);


-- Name: development_plan_checkin development_plan_checkin_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan_checkin
    ADD CONSTRAINT development_plan_checkin_pkey PRIMARY KEY (id);


-- Name: development_plan development_plan_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan
    ADD CONSTRAINT development_plan_code_key UNIQUE (code);


-- Name: development_plan_competency_aud development_plan_competency_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan_competency_aud
    ADD CONSTRAINT development_plan_competency_aud_pkey PRIMARY KEY (id, rev);


-- Name: development_plan_competency development_plan_competency_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan_competency
    ADD CONSTRAINT development_plan_competency_pkey PRIMARY KEY (id);


-- Name: development_plan_evidence_aud development_plan_evidence_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan_evidence_aud
    ADD CONSTRAINT development_plan_evidence_aud_pkey PRIMARY KEY (id, rev);


-- Name: development_plan_evidence development_plan_evidence_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan_evidence
    ADD CONSTRAINT development_plan_evidence_pkey PRIMARY KEY (id);


-- Name: development_plan_goal_aud development_plan_goal_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan_goal_aud
    ADD CONSTRAINT development_plan_goal_aud_pkey PRIMARY KEY (id, rev);


-- Name: development_plan_goal development_plan_goal_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan_goal
    ADD CONSTRAINT development_plan_goal_pkey PRIMARY KEY (id);


-- Name: development_plan_origin_aud development_plan_origin_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan_origin_aud
    ADD CONSTRAINT development_plan_origin_aud_pkey PRIMARY KEY (id, rev);


-- Name: development_plan_origin development_plan_origin_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan_origin
    ADD CONSTRAINT development_plan_origin_code_key UNIQUE (code);


-- Name: development_plan_origin development_plan_origin_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan_origin
    ADD CONSTRAINT development_plan_origin_pkey PRIMARY KEY (id);


-- Name: development_plan development_plan_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan
    ADD CONSTRAINT development_plan_pkey PRIMARY KEY (id);


-- Name: development_track_aud development_track_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_track_aud
    ADD CONSTRAINT development_track_aud_pkey PRIMARY KEY (id, rev);


-- Name: development_track development_track_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_track
    ADD CONSTRAINT development_track_code_key UNIQUE (code);


-- Name: development_track_competency_aud development_track_competency_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_track_competency_aud
    ADD CONSTRAINT development_track_competency_aud_pkey PRIMARY KEY (id, rev);


-- Name: development_track_competency development_track_competency_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_track_competency
    ADD CONSTRAINT development_track_competency_pkey PRIMARY KEY (id);


-- Name: development_track development_track_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_track
    ADD CONSTRAINT development_track_pkey PRIMARY KEY (id);


-- Name: digital_certificate_aud digital_certificate_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.digital_certificate_aud
    ADD CONSTRAINT digital_certificate_aud_pkey PRIMARY KEY (id, rev);


-- Name: digital_certificate digital_certificate_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.digital_certificate
    ADD CONSTRAINT digital_certificate_code_key UNIQUE (code);


-- Name: digital_certificate digital_certificate_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.digital_certificate
    ADD CONSTRAINT digital_certificate_pkey PRIMARY KEY (id);


-- Name: document_type_aud document_type_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.document_type_aud
    ADD CONSTRAINT document_type_aud_pkey PRIMARY KEY (id, rev);


-- Name: document_type document_type_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.document_type
    ADD CONSTRAINT document_type_code_key UNIQUE (code);


-- Name: document_type document_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.document_type
    ADD CONSTRAINT document_type_pkey PRIMARY KEY (id);


-- Name: employment_contract_aud employment_contract_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.employment_contract_aud
    ADD CONSTRAINT employment_contract_aud_pkey PRIMARY KEY (id, rev);


-- Name: employment_contract employment_contract_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.employment_contract
    ADD CONSTRAINT employment_contract_pkey PRIMARY KEY (id);


-- Name: esocial_event_aud esocial_event_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.esocial_event_aud
    ADD CONSTRAINT esocial_event_aud_pkey PRIMARY KEY (id, rev);


-- Name: esocial_event esocial_event_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.esocial_event
    ADD CONSTRAINT esocial_event_code_key UNIQUE (code);


-- Name: esocial_event esocial_event_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.esocial_event
    ADD CONSTRAINT esocial_event_pkey PRIMARY KEY (id);


-- Name: esocial_health_event_aud esocial_health_event_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.esocial_health_event_aud
    ADD CONSTRAINT esocial_health_event_aud_pkey PRIMARY KEY (id, rev);


-- Name: esocial_health_event esocial_health_event_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.esocial_health_event
    ADD CONSTRAINT esocial_health_event_code_key UNIQUE (code);


-- Name: esocial_health_event esocial_health_event_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.esocial_health_event
    ADD CONSTRAINT esocial_health_event_pkey PRIMARY KEY (id);


-- Name: esocial_table19_dismissal_reason_aud esocial_table19_dismissal_reason_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.esocial_table19_dismissal_reason_aud
    ADD CONSTRAINT esocial_table19_dismissal_reason_aud_pkey PRIMARY KEY (id, rev);


-- Name: esocial_table19_dismissal_reason esocial_table19_dismissal_reason_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.esocial_table19_dismissal_reason
    ADD CONSTRAINT esocial_table19_dismissal_reason_code_key UNIQUE (code);


-- Name: esocial_table19_dismissal_reason esocial_table19_dismissal_reason_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.esocial_table19_dismissal_reason
    ADD CONSTRAINT esocial_table19_dismissal_reason_pkey PRIMARY KEY (id);


-- Name: esocial_table19_dismissal_reason esocial_table19_dismissal_reason_reason_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.esocial_table19_dismissal_reason
    ADD CONSTRAINT esocial_table19_dismissal_reason_reason_code_key UNIQUE (reason_code);


-- Name: esocial_table27_procedure_aud esocial_table27_procedure_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.esocial_table27_procedure_aud
    ADD CONSTRAINT esocial_table27_procedure_aud_pkey PRIMARY KEY (id, rev);


-- Name: esocial_table27_procedure esocial_table27_procedure_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.esocial_table27_procedure
    ADD CONSTRAINT esocial_table27_procedure_code_key UNIQUE (code);


-- Name: esocial_table27_procedure esocial_table27_procedure_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.esocial_table27_procedure
    ADD CONSTRAINT esocial_table27_procedure_pkey PRIMARY KEY (id);


-- Name: esocial_table27_procedure esocial_table27_procedure_procedure_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.esocial_table27_procedure
    ADD CONSTRAINT esocial_table27_procedure_procedure_code_key UNIQUE (procedure_code);


-- Name: evidence_type_aud evidence_type_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.evidence_type_aud
    ADD CONSTRAINT evidence_type_aud_pkey PRIMARY KEY (id, rev);


-- Name: evidence_type evidence_type_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.evidence_type
    ADD CONSTRAINT evidence_type_code_key UNIQUE (code);


-- Name: evidence_type evidence_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.evidence_type
    ADD CONSTRAINT evidence_type_pkey PRIMARY KEY (id);


-- Name: exam_requirement_aud exam_requirement_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.exam_requirement_aud
    ADD CONSTRAINT exam_requirement_aud_pkey PRIMARY KEY (id, rev);


-- Name: exam_requirement exam_requirement_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.exam_requirement
    ADD CONSTRAINT exam_requirement_code_key UNIQUE (code);


-- Name: exam_requirement exam_requirement_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.exam_requirement
    ADD CONSTRAINT exam_requirement_pkey PRIMARY KEY (id);


-- Name: exit_interview_aud exit_interview_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.exit_interview_aud
    ADD CONSTRAINT exit_interview_aud_pkey PRIMARY KEY (id, rev);


-- Name: exit_interview exit_interview_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.exit_interview
    ADD CONSTRAINT exit_interview_pkey PRIMARY KEY (id);


-- Name: exit_interview_return_checklist_item_aud exit_interview_return_checklist_item_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.exit_interview_return_checklist_item_aud
    ADD CONSTRAINT exit_interview_return_checklist_item_aud_pkey PRIMARY KEY (id, rev);


-- Name: exit_interview_return_checklist_item exit_interview_return_checklist_item_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.exit_interview_return_checklist_item
    ADD CONSTRAINT exit_interview_return_checklist_item_code_key UNIQUE (code);


-- Name: exit_interview_return_checklist_item exit_interview_return_checklist_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.exit_interview_return_checklist_item
    ADD CONSTRAINT exit_interview_return_checklist_item_pkey PRIMARY KEY (id);


-- Name: experience_evaluation_aud experience_evaluation_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.experience_evaluation_aud
    ADD CONSTRAINT experience_evaluation_aud_pkey PRIMARY KEY (id, rev);


-- Name: experience_evaluation experience_evaluation_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.experience_evaluation
    ADD CONSTRAINT experience_evaluation_pkey PRIMARY KEY (id);


-- Name: experience_evaluation_score_aud experience_evaluation_score_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.experience_evaluation_score_aud
    ADD CONSTRAINT experience_evaluation_score_aud_pkey PRIMARY KEY (id, rev);


-- Name: experience_evaluation_score experience_evaluation_score_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.experience_evaluation_score
    ADD CONSTRAINT experience_evaluation_score_pkey PRIMARY KEY (id);


-- Name: job_application_interview_evaluation_aud job_application_interview_evaluation_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_application_interview_evaluation_aud
    ADD CONSTRAINT job_application_interview_evaluation_aud_pkey PRIMARY KEY (id, rev);


-- Name: job_application_interview_evaluation job_application_interview_evaluation_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_application_interview_evaluation
    ADD CONSTRAINT job_application_interview_evaluation_pkey PRIMARY KEY (id);


-- Name: job_application_interview_score_aud job_application_interview_score_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_application_interview_score_aud
    ADD CONSTRAINT job_application_interview_score_aud_pkey PRIMARY KEY (id, rev);


-- Name: job_application_interview_score job_application_interview_score_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_application_interview_score
    ADD CONSTRAINT job_application_interview_score_pkey PRIMARY KEY (id);


-- Name: job_position_aud job_position_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_position_aud
    ADD CONSTRAINT job_position_aud_pkey PRIMARY KEY (id, rev);


-- Name: job_position_competency_aud job_position_competency_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_position_competency_aud
    ADD CONSTRAINT job_position_competency_aud_pkey PRIMARY KEY (id, rev);


-- Name: job_position_competency job_position_competency_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_position_competency
    ADD CONSTRAINT job_position_competency_pkey PRIMARY KEY (id);


-- Name: job_position job_position_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_position
    ADD CONSTRAINT job_position_pkey PRIMARY KEY (id);


-- Name: job_position_salary_table_aud job_position_salary_table_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_position_salary_table_aud
    ADD CONSTRAINT job_position_salary_table_aud_pkey PRIMARY KEY (id, rev);


-- Name: job_position_salary_table_item_aud job_position_salary_table_item_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_position_salary_table_item_aud
    ADD CONSTRAINT job_position_salary_table_item_aud_pkey PRIMARY KEY (id, rev);


-- Name: job_position_salary_table_item job_position_salary_table_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_position_salary_table_item
    ADD CONSTRAINT job_position_salary_table_item_pkey PRIMARY KEY (id);


-- Name: job_position_salary_table job_position_salary_table_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_position_salary_table
    ADD CONSTRAINT job_position_salary_table_pkey PRIMARY KEY (id);


-- Name: job_requisition_aud job_requisition_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_requisition_aud
    ADD CONSTRAINT job_requisition_aud_pkey PRIMARY KEY (id, rev);


-- Name: job_requisition job_requisition_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_requisition
    ADD CONSTRAINT job_requisition_pkey PRIMARY KEY (id);


-- Name: job_vacancy_application_aud job_vacancy_application_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_vacancy_application_aud
    ADD CONSTRAINT job_vacancy_application_aud_pkey PRIMARY KEY (id, rev);


-- Name: job_vacancy_application job_vacancy_application_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_vacancy_application
    ADD CONSTRAINT job_vacancy_application_code_key UNIQUE (code);


-- Name: job_vacancy_application job_vacancy_application_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_vacancy_application
    ADD CONSTRAINT job_vacancy_application_pkey PRIMARY KEY (id);


-- Name: job_vacancy_aud job_vacancy_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_vacancy_aud
    ADD CONSTRAINT job_vacancy_aud_pkey PRIMARY KEY (id, rev);


-- Name: job_vacancy job_vacancy_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_vacancy
    ADD CONSTRAINT job_vacancy_code_key UNIQUE (code);


-- Name: job_vacancy_competency_aud job_vacancy_competency_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_vacancy_competency_aud
    ADD CONSTRAINT job_vacancy_competency_aud_pkey PRIMARY KEY (id, rev);


-- Name: job_vacancy_competency job_vacancy_competency_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_vacancy_competency
    ADD CONSTRAINT job_vacancy_competency_pkey PRIMARY KEY (id);


-- Name: job_vacancy job_vacancy_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_vacancy
    ADD CONSTRAINT job_vacancy_pkey PRIMARY KEY (id);


-- Name: leave_request_aud leave_request_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.leave_request_aud
    ADD CONSTRAINT leave_request_aud_pkey PRIMARY KEY (id, rev);


-- Name: leave_request leave_request_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.leave_request
    ADD CONSTRAINT leave_request_pkey PRIMARY KEY (id);


-- Name: medical_clinic_aud medical_clinic_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.medical_clinic_aud
    ADD CONSTRAINT medical_clinic_aud_pkey PRIMARY KEY (id, rev);


-- Name: medical_clinic medical_clinic_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.medical_clinic
    ADD CONSTRAINT medical_clinic_code_key UNIQUE (code);


-- Name: medical_clinic medical_clinic_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.medical_clinic
    ADD CONSTRAINT medical_clinic_pkey PRIMARY KEY (id);


-- Name: occupational_exam_aud occupational_exam_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.occupational_exam_aud
    ADD CONSTRAINT occupational_exam_aud_pkey PRIMARY KEY (id, rev);


-- Name: occupational_exam occupational_exam_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.occupational_exam
    ADD CONSTRAINT occupational_exam_code_key UNIQUE (code);


-- Name: occupational_exam occupational_exam_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.occupational_exam
    ADD CONSTRAINT occupational_exam_pkey PRIMARY KEY (id);


-- Name: occupational_physician_aud occupational_physician_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.occupational_physician_aud
    ADD CONSTRAINT occupational_physician_aud_pkey PRIMARY KEY (id, rev);


-- Name: occupational_physician_clinic_aud occupational_physician_clinic_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.occupational_physician_clinic_aud
    ADD CONSTRAINT occupational_physician_clinic_aud_pkey PRIMARY KEY (id, rev);


-- Name: occupational_physician_clinic occupational_physician_clinic_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.occupational_physician_clinic
    ADD CONSTRAINT occupational_physician_clinic_pkey PRIMARY KEY (id);


-- Name: occupational_physician occupational_physician_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.occupational_physician
    ADD CONSTRAINT occupational_physician_code_key UNIQUE (code);


-- Name: occupational_physician occupational_physician_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.occupational_physician
    ADD CONSTRAINT occupational_physician_pkey PRIMARY KEY (id);


-- Name: offboarding_aud offboarding_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.offboarding_aud
    ADD CONSTRAINT offboarding_aud_pkey PRIMARY KEY (id, rev);


-- Name: offboarding offboarding_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.offboarding
    ADD CONSTRAINT offboarding_pkey PRIMARY KEY (id);


-- Name: payment_batch_aud payment_batch_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payment_batch_aud
    ADD CONSTRAINT payment_batch_aud_pkey PRIMARY KEY (id, rev);


-- Name: payment_batch payment_batch_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payment_batch
    ADD CONSTRAINT payment_batch_pkey PRIMARY KEY (id);


-- Name: payment_period_aud payment_period_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payment_period_aud
    ADD CONSTRAINT payment_period_aud_pkey PRIMARY KEY (id, rev);


-- Name: payment_period payment_period_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payment_period
    ADD CONSTRAINT payment_period_pkey PRIMARY KEY (id);


-- Name: payment_slip_aud payment_slip_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payment_slip_aud
    ADD CONSTRAINT payment_slip_aud_pkey PRIMARY KEY (id, rev);


-- Name: payment_slip payment_slip_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payment_slip
    ADD CONSTRAINT payment_slip_pkey PRIMARY KEY (id);


-- Name: payroll_event_aud payroll_event_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payroll_event_aud
    ADD CONSTRAINT payroll_event_aud_pkey PRIMARY KEY (id, rev);


-- Name: payroll_event payroll_event_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payroll_event
    ADD CONSTRAINT payroll_event_pkey PRIMARY KEY (id);


-- Name: payroll_run_aud payroll_run_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payroll_run_aud
    ADD CONSTRAINT payroll_run_aud_pkey PRIMARY KEY (id, rev);


-- Name: payroll_run payroll_run_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payroll_run
    ADD CONSTRAINT payroll_run_pkey PRIMARY KEY (id);


-- Name: payslip_aud payslip_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payslip_aud
    ADD CONSTRAINT payslip_aud_pkey PRIMARY KEY (id, rev);


-- Name: payslip_entry_aud payslip_entry_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payslip_entry_aud
    ADD CONSTRAINT payslip_entry_aud_pkey PRIMARY KEY (id, rev);


-- Name: payslip_entry payslip_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payslip_entry
    ADD CONSTRAINT payslip_entry_pkey PRIMARY KEY (id);


-- Name: payslip payslip_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payslip
    ADD CONSTRAINT payslip_pkey PRIMARY KEY (id);


-- Name: performance_review_aud performance_review_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.performance_review_aud
    ADD CONSTRAINT performance_review_aud_pkey PRIMARY KEY (id, rev);


-- Name: performance_review performance_review_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.performance_review
    ADD CONSTRAINT performance_review_pkey PRIMARY KEY (id);


-- Name: permission permission_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.permission
    ADD CONSTRAINT permission_code_key UNIQUE (authority);


-- Name: permission permission_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.permission
    ADD CONSTRAINT permission_pkey PRIMARY KEY (id);


-- Name: collaborator person_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.collaborator
    ADD CONSTRAINT person_pkey PRIMARY KEY (id);


-- Name: proficiency_level_aud proficiency_level_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.proficiency_level_aud
    ADD CONSTRAINT proficiency_level_aud_pkey PRIMARY KEY (id, rev);


-- Name: proficiency_level proficiency_level_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.proficiency_level
    ADD CONSTRAINT proficiency_level_code_key UNIQUE (code);


-- Name: proficiency_level proficiency_level_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.proficiency_level
    ADD CONSTRAINT proficiency_level_pkey PRIMARY KEY (id);


-- Name: refresh_token_blacklist refresh_token_blacklist_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.refresh_token_blacklist
    ADD CONSTRAINT refresh_token_blacklist_pkey PRIMARY KEY (id);


-- Name: refresh_token_blacklist refresh_token_blacklist_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.refresh_token_blacklist
    ADD CONSTRAINT refresh_token_blacklist_token_hash_key UNIQUE (token_hash);


-- Name: refresh_token refresh_token_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT refresh_token_pkey PRIMARY KEY (id);


-- Name: refresh_token refresh_token_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT refresh_token_token_hash_key UNIQUE (token_hash);


-- Name: revinfo revinfo_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.revinfo
    ADD CONSTRAINT revinfo_pkey PRIMARY KEY (rev);


-- Name: role_aud role_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.role_aud
    ADD CONSTRAINT role_aud_pkey PRIMARY KEY (id, rev);


-- Name: role_permission_aud role_permission_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.role_permission_aud
    ADD CONSTRAINT role_permission_aud_pkey PRIMARY KEY (role_id, permission_id, rev);


-- Name: role_permission role_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_pkey PRIMARY KEY (role_id, permission_id);


-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);


-- Name: search_document search_document_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.search_document
    ADD CONSTRAINT search_document_code_key UNIQUE (code);


-- Name: search_document search_document_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.search_document
    ADD CONSTRAINT search_document_pkey PRIMARY KEY (id);


-- Name: state state_abbreviation_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.state
    ADD CONSTRAINT state_abbreviation_key UNIQUE (abbreviation);


-- Name: state state_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.state
    ADD CONSTRAINT state_code_key UNIQUE (code);


-- Name: state state_ibge_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.state
    ADD CONSTRAINT state_ibge_code_key UNIQUE (ibge_code);


-- Name: state state_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.state
    ADD CONSTRAINT state_pkey PRIMARY KEY (id);


-- Name: storage_object_link storage_object_link_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.storage_object_link
    ADD CONSTRAINT storage_object_link_pkey PRIMARY KEY (id);


-- Name: storage_object storage_object_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.storage_object
    ADD CONSTRAINT storage_object_pkey PRIMARY KEY (id);


-- Name: system_notification system_notification_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.system_notification
    ADD CONSTRAINT system_notification_code_key UNIQUE (code);


-- Name: system_notification system_notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.system_notification
    ADD CONSTRAINT system_notification_pkey PRIMARY KEY (id);


-- Name: system_setting_aud system_setting_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.system_setting_aud
    ADD CONSTRAINT system_setting_aud_pkey PRIMARY KEY (id, rev);


-- Name: system_setting system_setting_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.system_setting
    ADD CONSTRAINT system_setting_code_key UNIQUE (code);


-- Name: system_setting system_setting_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.system_setting
    ADD CONSTRAINT system_setting_pkey PRIMARY KEY (id);


-- Name: tax_obligation_aud tax_obligation_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.tax_obligation_aud
    ADD CONSTRAINT tax_obligation_aud_pkey PRIMARY KEY (id, rev);


-- Name: tax_obligation tax_obligation_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.tax_obligation
    ADD CONSTRAINT tax_obligation_pkey PRIMARY KEY (id);


-- Name: contract_recess_period uk_recess_period_policy_cycle; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.contract_recess_period
    ADD CONSTRAINT uk_recess_period_policy_cycle UNIQUE (policy_id, cycle_start);


-- Name: occupational_physician_clinic uq_occupational_physician_clinic; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.occupational_physician_clinic
    ADD CONSTRAINT uq_occupational_physician_clinic UNIQUE (physician_id, clinic_id);


-- Name: work_schedule_day uq_work_schedule_day; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.work_schedule_day
    ADD CONSTRAINT uq_work_schedule_day UNIQUE (work_schedule_id, day_of_week);


-- Name: user_acting_profile_aud user_acting_profile_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.user_acting_profile_aud
    ADD CONSTRAINT user_acting_profile_aud_pkey PRIMARY KEY (id, rev);


-- Name: user_acting_profile user_acting_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.user_acting_profile
    ADD CONSTRAINT user_acting_profile_pkey PRIMARY KEY (id);


-- Name: user_role_aud user_role_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.user_role_aud
    ADD CONSTRAINT user_role_aud_pkey PRIMARY KEY (id, rev);


-- Name: user_role user_role_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_pkey PRIMARY KEY (id);


-- Name: work_schedule_aud work_schedule_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.work_schedule_aud
    ADD CONSTRAINT work_schedule_aud_pkey PRIMARY KEY (id, rev);


-- Name: work_schedule work_schedule_code_key; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.work_schedule
    ADD CONSTRAINT work_schedule_code_key UNIQUE (code);


-- Name: work_schedule_day_aud work_schedule_day_aud_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.work_schedule_day_aud
    ADD CONSTRAINT work_schedule_day_aud_pkey PRIMARY KEY (id, rev);


-- Name: work_schedule_day work_schedule_day_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.work_schedule_day
    ADD CONSTRAINT work_schedule_day_pkey PRIMARY KEY (id);


-- Name: work_schedule work_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.work_schedule
    ADD CONSTRAINT work_schedule_pkey PRIMARY KEY (id);


-- Name: idx_acting_profile_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_acting_profile_aud_rev ON public.acting_profile_aud USING btree (rev);


-- Name: idx_acting_profile_system; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_acting_profile_system ON public.acting_profile USING btree (system) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_admission_collaborator; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_admission_collaborator ON public.admission_process USING btree (collaborator_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_admission_cpf; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_admission_cpf ON public.admission_process USING btree (cpf) WHERE ((status <> 'DELETED'::gesint_types.status_enum) AND (cpf IS NOT NULL));


-- Name: idx_admission_process_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_admission_process_aud_rev ON public.admission_process_aud USING btree (rev);


-- Name: idx_admission_process_kanban_column_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_admission_process_kanban_column_aud_rev ON public.admission_process_kanban_column_aud USING btree (rev);


-- Name: idx_admission_process_kanban_column_order; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_admission_process_kanban_column_order ON public.admission_process_kanban_column USING btree (display_order, name) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_admission_process_work_schedule; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_admission_process_work_schedule ON public.admission_process USING btree (work_schedule_id) WHERE ((work_schedule_id IS NOT NULL) AND (status <> 'DELETED'::gesint_types.status_enum));


-- Name: idx_admission_step_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_admission_step_aud_rev ON public.admission_step_aud USING btree (rev);


-- Name: idx_admission_step_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_admission_step_company ON public.admission_step USING btree (company_id);


-- Name: idx_admission_step_due_date; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_admission_step_due_date ON public.admission_step USING btree (due_date) WHERE ((status <> 'DELETED'::gesint_types.status_enum) AND (due_date IS NOT NULL));


-- Name: idx_admission_step_status; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_admission_step_status ON public.admission_step USING btree (step_status) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_agenda_event_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_agenda_event_aud_rev ON public.agenda_event_aud USING btree (rev);


-- Name: idx_agenda_event_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_agenda_event_company ON public.agenda_event USING btree (company_id);


-- Name: idx_agenda_event_owner_starts; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_agenda_event_owner_starts ON public.agenda_event USING btree (owner_user_id, starts_at) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_agenda_event_status; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_agenda_event_status ON public.agenda_event USING btree (status) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_app_user_access_token_hash; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_app_user_access_token_hash ON public.app_user USING btree (access_token_hash) WHERE ((access_token_hash IS NOT NULL) AND (status <> 'DELETED'::gesint_types.status_enum));


-- Name: idx_app_user_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_app_user_aud_rev ON public.app_user_aud USING btree (rev);


-- Name: idx_app_user_email; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX idx_app_user_email ON public.app_user USING btree (email) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_app_user_username; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX idx_app_user_username ON public.app_user USING btree (username) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_attendance_collaborator_date; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX idx_attendance_collaborator_date ON public.attendance_record USING btree (collaborator_id, work_date) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_attendance_record_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_attendance_record_aud_rev ON public.attendance_record_aud USING btree (rev);


-- Name: idx_attendance_record_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_attendance_record_company ON public.attendance_record USING btree (company_id);


-- Name: idx_attendance_reference; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_attendance_reference ON public.attendance_record USING btree (occurrence_origin, reference_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_attendance_request_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_attendance_request_aud_rev ON public.attendance_request_aud USING btree (rev);


-- Name: idx_attendance_request_collaborator_date; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_attendance_request_collaborator_date ON public.attendance_request USING btree (collaborator_id, work_date) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_attendance_request_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_attendance_request_company ON public.attendance_request USING btree (company_id);


-- Name: idx_attendance_request_record; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_attendance_request_record ON public.attendance_request USING btree (attendance_record_id) WHERE ((status <> 'DELETED'::gesint_types.status_enum) AND (attendance_record_id IS NOT NULL));


-- Name: idx_attendance_request_source_client; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX idx_attendance_request_source_client ON public.attendance_request USING btree (source, client_request_id) WHERE ((status <> 'DELETED'::gesint_types.status_enum) AND (client_request_id IS NOT NULL));


-- Name: idx_attendance_request_status_submitted; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_attendance_request_status_submitted ON public.attendance_request USING btree (request_status, submitted_at DESC) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_audit_log_category_occurred_at; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_audit_log_category_occurred_at ON public.audit_log USING btree (category, occurred_at DESC);


-- Name: idx_audit_log_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_audit_log_company ON public.audit_log USING btree (company_id);


-- Name: idx_audit_log_entity; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_audit_log_entity ON public.audit_log USING btree (entity_name, entity_id);


-- Name: idx_audit_log_occurred_at; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_audit_log_occurred_at ON public.audit_log USING btree (occurred_at DESC);


-- Name: idx_audit_log_user; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_audit_log_user ON public.audit_log USING btree (user_id);


-- Name: idx_benefit_enrollment_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_benefit_enrollment_aud_rev ON public.benefit_enrollment_aud USING btree (rev);


-- Name: idx_benefit_enrollment_collaborator; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_benefit_enrollment_collaborator ON public.benefit_enrollment USING btree (collaborator_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_benefit_enrollment_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_benefit_enrollment_company ON public.benefit_enrollment USING btree (company_id);


-- Name: idx_benefit_plan_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_benefit_plan_aud_rev ON public.benefit_plan_aud USING btree (rev);


-- Name: idx_candidate_account_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_candidate_account_aud_rev ON public.candidate_account_aud USING btree (rev);


-- Name: idx_candidate_account_candidate; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_candidate_account_candidate ON public.candidate_account USING btree (candidate_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_candidate_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_candidate_aud_rev ON public.candidate_aud USING btree (rev);


-- Name: idx_candidate_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_candidate_company ON public.candidate USING btree (company_id);


-- Name: idx_candidate_experience_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_candidate_experience_aud_rev ON public.candidate_experience_aud USING btree (rev);


-- Name: idx_candidate_experience_candidate; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_candidate_experience_candidate ON public.candidate_experience USING btree (candidate_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_candidate_full_name; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_candidate_full_name ON public.candidate USING btree (full_name) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_careers_page_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_careers_page_aud_rev ON public.careers_page_aud USING btree (rev);


-- Name: idx_careers_page_block_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_careers_page_block_aud_rev ON public.careers_page_block_aud USING btree (rev);


-- Name: idx_careers_page_block_page; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_careers_page_block_page ON public.careers_page_block USING btree (page_id, display_order) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_cbo_occupation_cbo_code; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_cbo_occupation_cbo_code ON public.cbo_occupation USING btree (cbo_code);


-- Name: idx_cbo_occupation_name; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_cbo_occupation_name ON public.cbo_occupation USING btree (name);


-- Name: idx_city_state_name; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_city_state_name ON public.city USING btree (state_id, name);


-- Name: idx_collaborator_address_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_collaborator_address_aud_rev ON public.collaborator_address_aud USING btree (rev);


-- Name: idx_collaborator_address_collaborator; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_collaborator_address_collaborator ON public.collaborator_address USING btree (collaborator_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_collaborator_address_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_collaborator_address_company ON public.collaborator_address USING btree (company_id);


-- Name: idx_collaborator_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_collaborator_aud_rev ON public.collaborator_aud USING btree (rev);


-- Name: idx_collaborator_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_collaborator_company ON public.collaborator USING btree (company_id);


-- Name: idx_collaborator_contact_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_collaborator_contact_aud_rev ON public.collaborator_contact_aud USING btree (rev);


-- Name: idx_collaborator_contact_collaborator; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_collaborator_contact_collaborator ON public.collaborator_contact USING btree (collaborator_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_collaborator_contact_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_collaborator_contact_company ON public.collaborator_contact USING btree (company_id);


-- Name: idx_collaborator_cpf; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX idx_collaborator_cpf ON public.collaborator USING btree (cpf) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_collaborator_full_name; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_collaborator_full_name ON public.collaborator USING btree (full_name);


-- Name: idx_collaborator_status; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_collaborator_status ON public.collaborator USING btree (status);


-- Name: idx_company_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_company_aud_rev ON public.company_aud USING btree (rev);


-- Name: idx_company_cnpj; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX idx_company_cnpj ON public.company USING btree (cnpj) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_company_parent; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_company_parent ON public.company USING btree (parent_id);


-- Name: idx_competency_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_competency_aud_rev ON public.competency_aud USING btree (rev);


-- Name: idx_complementary_exam_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_complementary_exam_aud_rev ON public.complementary_exam_aud USING btree (rev);


-- Name: idx_complementary_exam_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_complementary_exam_company ON public.complementary_exam USING btree (company_id);


-- Name: idx_complementary_exam_occupational; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_complementary_exam_occupational ON public.complementary_exam USING btree (occupational_exam_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_contract_collaborator; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_contract_collaborator ON public.employment_contract USING btree (collaborator_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_contract_recess_period_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_contract_recess_period_aud_rev ON public.contract_recess_period_aud USING btree (rev);


-- Name: idx_contract_recess_period_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_contract_recess_period_company ON public.contract_recess_period USING btree (company_id);


-- Name: idx_contract_recess_policy_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_contract_recess_policy_aud_rev ON public.contract_recess_policy_aud USING btree (rev);


-- Name: idx_contract_recess_policy_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_contract_recess_policy_company ON public.contract_recess_policy USING btree (company_id);


-- Name: idx_department_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_department_aud_rev ON public.department_aud USING btree (rev);


-- Name: idx_department_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_department_company ON public.department USING btree (company_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_development_action_template_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_action_template_aud_rev ON public.development_action_template_aud USING btree (rev);


-- Name: idx_development_action_template_competency; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_action_template_competency ON public.development_action_template USING btree (competency_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_development_plan_action_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_action_aud_rev ON public.development_plan_action_aud USING btree (rev);


-- Name: idx_development_plan_action_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_action_company ON public.development_plan_action USING btree (company_id);


-- Name: idx_development_plan_action_goal; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_action_goal ON public.development_plan_action USING btree (goal_id);


-- Name: idx_development_plan_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_aud_rev ON public.development_plan_aud USING btree (rev);


-- Name: idx_development_plan_checkin_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_checkin_aud_rev ON public.development_plan_checkin_aud USING btree (rev);


-- Name: idx_development_plan_checkin_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_checkin_company ON public.development_plan_checkin USING btree (company_id);


-- Name: idx_development_plan_checkin_plan_date; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_checkin_plan_date ON public.development_plan_checkin USING btree (plan_id, date DESC);


-- Name: idx_development_plan_collaborator; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_collaborator ON public.development_plan USING btree (collaborator_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_development_plan_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_company ON public.development_plan USING btree (company_id);


-- Name: idx_development_plan_competency_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_competency_aud_rev ON public.development_plan_competency_aud USING btree (rev);


-- Name: idx_development_plan_competency_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_competency_company ON public.development_plan_competency USING btree (company_id);


-- Name: idx_development_plan_competency_plan; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_competency_plan ON public.development_plan_competency USING btree (plan_id);


-- Name: idx_development_plan_department; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_department ON public.development_plan USING btree (department_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_development_plan_evidence_action; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_evidence_action ON public.development_plan_evidence USING btree (action_id);


-- Name: idx_development_plan_evidence_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_evidence_aud_rev ON public.development_plan_evidence_aud USING btree (rev);


-- Name: idx_development_plan_evidence_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_evidence_company ON public.development_plan_evidence USING btree (company_id);


-- Name: idx_development_plan_evidence_plan; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_evidence_plan ON public.development_plan_evidence USING btree (plan_id);


-- Name: idx_development_plan_goal_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_goal_aud_rev ON public.development_plan_goal_aud USING btree (rev);


-- Name: idx_development_plan_goal_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_goal_company ON public.development_plan_goal USING btree (company_id);


-- Name: idx_development_plan_goal_plan; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_goal_plan ON public.development_plan_goal USING btree (plan_id);


-- Name: idx_development_plan_manager; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_manager ON public.development_plan USING btree (manager_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_development_plan_origin_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_origin_aud_rev ON public.development_plan_origin_aud USING btree (rev);


-- Name: idx_development_plan_status; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_plan_status ON public.development_plan USING btree (plan_status) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_development_track_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_track_aud_rev ON public.development_track_aud USING btree (rev);


-- Name: idx_development_track_competency_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_track_competency_aud_rev ON public.development_track_competency_aud USING btree (rev);


-- Name: idx_development_track_competency_track; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_development_track_competency_track ON public.development_track_competency USING btree (track_id);


-- Name: idx_digital_certificate_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_digital_certificate_aud_rev ON public.digital_certificate_aud USING btree (rev);


-- Name: idx_digital_certificate_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_digital_certificate_company ON public.digital_certificate USING btree (company_id);


-- Name: idx_digital_certificate_default; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_digital_certificate_default ON public.digital_certificate USING btree (is_default) WHERE ((status <> 'DELETED'::gesint_types.status_enum) AND (is_default = true));


-- Name: idx_digital_certificate_valid_until; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_digital_certificate_valid_until ON public.digital_certificate USING btree (valid_until) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_document_type_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_document_type_aud_rev ON public.document_type_aud USING btree (rev);


-- Name: idx_document_type_contexts; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_document_type_contexts ON public.document_type USING gin (contexts);


-- Name: idx_employment_contract_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_employment_contract_aud_rev ON public.employment_contract_aud USING btree (rev);


-- Name: idx_esocial_event_admission_type; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_esocial_event_admission_type ON public.esocial_event USING btree (admission_id, event_type) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_esocial_event_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_esocial_event_aud_rev ON public.esocial_event_aud USING btree (rev);


-- Name: idx_esocial_event_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_esocial_event_company ON public.esocial_event USING btree (company_id);


-- Name: idx_esocial_event_due_date; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_esocial_event_due_date ON public.esocial_event USING btree (due_date) WHERE ((status <> 'DELETED'::gesint_types.status_enum) AND (due_date IS NOT NULL));


-- Name: idx_esocial_health_event_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_esocial_health_event_aud_rev ON public.esocial_health_event_aud USING btree (rev);


-- Name: idx_esocial_health_event_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_esocial_health_event_company ON public.esocial_health_event USING btree (company_id);


-- Name: idx_esocial_health_event_exam; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_esocial_health_event_exam ON public.esocial_health_event USING btree (occupational_exam_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_esocial_health_event_status_deadline; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_esocial_health_event_status_deadline ON public.esocial_health_event USING btree (transmission_status, transmission_deadline) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_esocial_table19_dismissal_reason_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_esocial_table19_dismissal_reason_aud_rev ON public.esocial_table19_dismissal_reason_aud USING btree (rev);


-- Name: idx_esocial_table27_procedure_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_esocial_table27_procedure_aud_rev ON public.esocial_table27_procedure_aud USING btree (rev);


-- Name: idx_evidence_type_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_evidence_type_aud_rev ON public.evidence_type_aud USING btree (rev);


-- Name: idx_exam_requirement_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_exam_requirement_aud_rev ON public.exam_requirement_aud USING btree (rev);


-- Name: idx_exam_requirement_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_exam_requirement_company ON public.exam_requirement USING btree (company_id);


-- Name: idx_exam_requirement_position_type_from; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_exam_requirement_position_type_from ON public.exam_requirement USING btree (job_position_id, exam_type, valid_from) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_exit_interview_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_exit_interview_aud_rev ON public.exit_interview_aud USING btree (rev);


-- Name: idx_exit_interview_collaborator; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_exit_interview_collaborator ON public.exit_interview USING btree (collaborator_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_exit_interview_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_exit_interview_company ON public.exit_interview USING btree (company_id);


-- Name: idx_exit_interview_department; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_exit_interview_department ON public.exit_interview USING btree (department_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_exit_interview_interview_date; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_exit_interview_interview_date ON public.exit_interview USING btree (interview_date) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_exit_interview_interview_status; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_exit_interview_interview_status ON public.exit_interview USING btree (interview_status) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_exit_interview_job_position; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_exit_interview_job_position ON public.exit_interview USING btree (job_position_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_exit_interview_main_reason; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_exit_interview_main_reason ON public.exit_interview USING btree (main_reason) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_exit_interview_relationship_type; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_exit_interview_relationship_type ON public.exit_interview USING btree (relationship_type) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_exit_interview_return_checklist_item_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_exit_interview_return_checklist_item_aud_rev ON public.exit_interview_return_checklist_item_aud USING btree (rev);


-- Name: idx_exit_interview_return_checklist_item_order; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_exit_interview_return_checklist_item_order ON public.exit_interview_return_checklist_item USING btree (display_order, description) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_exit_interview_termination_type; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_exit_interview_termination_type ON public.exit_interview USING btree (termination_type) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_experience_evaluation_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_experience_evaluation_aud_rev ON public.experience_evaluation_aud USING btree (rev);


-- Name: idx_experience_evaluation_collaborator; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_experience_evaluation_collaborator ON public.experience_evaluation USING btree (collaborator_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_experience_evaluation_period_status; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_experience_evaluation_period_status ON public.experience_evaluation USING btree (period_status, experience_due_date) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_experience_evaluation_score_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_experience_evaluation_score_aud_rev ON public.experience_evaluation_score_aud USING btree (rev);


-- Name: idx_experience_score_evaluation; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_experience_score_evaluation ON public.experience_evaluation_score USING btree (evaluation_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_interview_evaluation_application; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_interview_evaluation_application ON public.job_application_interview_evaluation USING btree (job_vacancy_application_id, column_key) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_interview_score_evaluation; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_interview_score_evaluation ON public.job_application_interview_score USING btree (evaluation_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_job_application_interview_evaluation_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_application_interview_evaluation_aud_rev ON public.job_application_interview_evaluation_aud USING btree (rev);


-- Name: idx_job_application_interview_score_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_application_interview_score_aud_rev ON public.job_application_interview_score_aud USING btree (rev);


-- Name: idx_job_position_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_position_aud_rev ON public.job_position_aud USING btree (rev);


-- Name: idx_job_position_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_position_company ON public.job_position USING btree (company_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_job_position_competency_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_position_competency_aud_rev ON public.job_position_competency_aud USING btree (rev);


-- Name: idx_job_position_competency_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_position_competency_company ON public.job_position_competency USING btree (company_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_job_position_competency_position; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_position_competency_position ON public.job_position_competency USING btree (job_position_id, competency_id, valid_from) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_job_position_department; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_position_department ON public.job_position USING btree (department_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_job_position_salary_table_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_position_salary_table_aud_rev ON public.job_position_salary_table_aud USING btree (rev);


-- Name: idx_job_position_salary_table_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_position_salary_table_company ON public.job_position_salary_table USING btree (company_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_job_position_salary_table_item_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_position_salary_table_item_aud_rev ON public.job_position_salary_table_item_aud USING btree (rev);


-- Name: idx_job_position_salary_table_item_table; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_position_salary_table_item_table ON public.job_position_salary_table_item USING btree (salary_table_id);


-- Name: idx_job_position_salary_table_position; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_position_salary_table_position ON public.job_position_salary_table USING btree (job_position_id, valid_from) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_job_requisition_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_requisition_aud_rev ON public.job_requisition_aud USING btree (rev);


-- Name: idx_job_requisition_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_requisition_company ON public.job_requisition USING btree (company_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_job_requisition_offboarding; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_requisition_offboarding ON public.job_requisition USING btree (offboarding_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_job_requisition_position; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_requisition_position ON public.job_requisition USING btree (job_position_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_job_requisition_status; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_requisition_status ON public.job_requisition USING btree (requisition_status) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_job_vacancy_application_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_vacancy_application_aud_rev ON public.job_vacancy_application_aud USING btree (rev);


-- Name: idx_job_vacancy_application_candidate; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_vacancy_application_candidate ON public.job_vacancy_application USING btree (candidate_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_job_vacancy_application_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_vacancy_application_company ON public.job_vacancy_application USING btree (company_id);


-- Name: idx_job_vacancy_application_kanban_column; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_vacancy_application_kanban_column ON public.job_vacancy_application USING btree (kanban_column_key) WHERE ((status <> 'DELETED'::gesint_types.status_enum) AND (kanban_column_key IS NOT NULL));


-- Name: idx_job_vacancy_application_vacancy; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_vacancy_application_vacancy ON public.job_vacancy_application USING btree (job_vacancy_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_job_vacancy_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_vacancy_aud_rev ON public.job_vacancy_aud USING btree (rev);


-- Name: idx_job_vacancy_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_vacancy_company ON public.job_vacancy USING btree (company_id);


-- Name: idx_job_vacancy_competency_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_vacancy_competency_aud_rev ON public.job_vacancy_competency_aud USING btree (rev);


-- Name: idx_job_vacancy_competency_vacancy; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_vacancy_competency_vacancy ON public.job_vacancy_competency USING btree (job_vacancy_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_job_vacancy_expected_completion; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_vacancy_expected_completion ON public.job_vacancy USING btree (expected_completion_date) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_job_vacancy_job_position; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_vacancy_job_position ON public.job_vacancy USING btree (job_position_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_job_vacancy_seniority; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_job_vacancy_seniority ON public.job_vacancy USING btree (seniority_level) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_leave_absence_cid; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_leave_absence_cid ON public.leave_request USING btree (collaborator_id, cid, start_date) WHERE ((status <> 'DELETED'::gesint_types.status_enum) AND (cid IS NOT NULL));


-- Name: idx_leave_absence_collaborator_period; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_leave_absence_collaborator_period ON public.leave_request USING btree (collaborator_id, start_date, end_date) WHERE ((status <> 'DELETED'::gesint_types.status_enum) AND (leave_type <> 'VACATION'::gesint_types.leave_type_enum));


-- Name: idx_leave_collaborator; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_leave_collaborator ON public.leave_request USING btree (collaborator_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_leave_request_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_leave_request_aud_rev ON public.leave_request_aud USING btree (rev);


-- Name: idx_leave_request_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_leave_request_company ON public.leave_request USING btree (company_id);


-- Name: idx_leave_request_recess_period; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_leave_request_recess_period ON public.leave_request USING btree (recess_period_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_leave_split_group; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_leave_split_group ON public.leave_request USING btree (split_group_id) WHERE ((status <> 'DELETED'::gesint_types.status_enum) AND (split_group_id IS NOT NULL));


-- Name: idx_leave_vacation_review; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_leave_vacation_review ON public.leave_request USING btree (review_status) WHERE ((status <> 'DELETED'::gesint_types.status_enum) AND (leave_type = 'VACATION'::gesint_types.leave_type_enum) AND (approved IS DISTINCT FROM true));


-- Name: idx_medical_clinic_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_medical_clinic_aud_rev ON public.medical_clinic_aud USING btree (rev);


-- Name: idx_occupational_exam_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_occupational_exam_aud_rev ON public.occupational_exam_aud USING btree (rev);


-- Name: idx_occupational_exam_collaborator_cid; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_occupational_exam_collaborator_cid ON public.occupational_exam USING btree (collaborator_id, cid) WHERE ((status <> 'DELETED'::gesint_types.status_enum) AND (cid IS NOT NULL));


-- Name: idx_occupational_exam_collaborator_type_due; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_occupational_exam_collaborator_type_due ON public.occupational_exam USING btree (collaborator_id, exam_type, due_date) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_occupational_exam_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_occupational_exam_company ON public.occupational_exam USING btree (company_id);


-- Name: idx_occupational_exam_lifecycle; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_occupational_exam_lifecycle ON public.occupational_exam USING btree (lifecycle_status) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_occupational_physician_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_occupational_physician_aud_rev ON public.occupational_physician_aud USING btree (rev);


-- Name: idx_occupational_physician_clinic_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_occupational_physician_clinic_aud_rev ON public.occupational_physician_clinic_aud USING btree (rev);


-- Name: idx_occupational_physician_clinic_clinic; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_occupational_physician_clinic_clinic ON public.occupational_physician_clinic USING btree (clinic_id);


-- Name: idx_occupational_physician_clinic_physician; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_occupational_physician_clinic_physician ON public.occupational_physician_clinic USING btree (physician_id);


-- Name: idx_offboarding_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_offboarding_aud_rev ON public.offboarding_aud USING btree (rev);


-- Name: idx_offboarding_collaborator; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_offboarding_collaborator ON public.offboarding USING btree (collaborator_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_offboarding_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_offboarding_company ON public.offboarding USING btree (company_id);


-- Name: idx_payment_batch_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_payment_batch_aud_rev ON public.payment_batch_aud USING btree (rev);


-- Name: idx_payment_batch_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_payment_batch_company ON public.payment_batch USING btree (company_id);


-- Name: idx_payment_batch_period; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_payment_batch_period ON public.payment_batch USING btree (payment_period_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_payment_period_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_payment_period_aud_rev ON public.payment_period_aud USING btree (rev);


-- Name: idx_payment_period_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_payment_period_company ON public.payment_period USING btree (company_id);


-- Name: idx_payment_slip_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_payment_slip_aud_rev ON public.payment_slip_aud USING btree (rev);


-- Name: idx_payment_slip_batch; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_payment_slip_batch ON public.payment_slip USING btree (payment_batch_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_payment_slip_collaborator; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_payment_slip_collaborator ON public.payment_slip USING btree (collaborator_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_payment_slip_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_payment_slip_company ON public.payment_slip USING btree (company_id);


-- Name: idx_payroll_event_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_payroll_event_aud_rev ON public.payroll_event_aud USING btree (rev);


-- Name: idx_payroll_event_type; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_payroll_event_type ON public.payroll_event USING btree (event_type) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_payroll_run_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_payroll_run_aud_rev ON public.payroll_run_aud USING btree (rev);


-- Name: idx_payroll_run_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_payroll_run_company ON public.payroll_run USING btree (company_id);


-- Name: idx_payslip_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_payslip_aud_rev ON public.payslip_aud USING btree (rev);


-- Name: idx_payslip_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_payslip_company ON public.payslip USING btree (company_id);


-- Name: idx_payslip_entry_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_payslip_entry_aud_rev ON public.payslip_entry_aud USING btree (rev);


-- Name: idx_payslip_entry_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_payslip_entry_company ON public.payslip_entry USING btree (company_id);


-- Name: idx_payslip_entry_event; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_payslip_entry_event ON public.payslip_entry USING btree (payroll_event_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_payslip_entry_payslip; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_payslip_entry_payslip ON public.payslip_entry USING btree (payslip_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_payslip_run; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_payslip_run ON public.payslip USING btree (payroll_run_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_performance_review_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_performance_review_aud_rev ON public.performance_review_aud USING btree (rev);


-- Name: idx_performance_review_collaborator; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_performance_review_collaborator ON public.performance_review USING btree (collaborator_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_performance_review_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_performance_review_company ON public.performance_review USING btree (company_id);


-- Name: idx_proficiency_level_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_proficiency_level_aud_rev ON public.proficiency_level_aud USING btree (rev);


-- Name: idx_proficiency_level_order; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_proficiency_level_order ON public.proficiency_level USING btree (level_order) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_public_payroll_run_reference_date; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX idx_public_payroll_run_reference_date ON public.payroll_run USING btree (reference_date) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_recess_period_collaborator; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_recess_period_collaborator ON public.contract_recess_period USING btree (collaborator_id, cycle_start DESC) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_recess_policy_contract; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_recess_policy_contract ON public.contract_recess_policy USING btree (employment_contract_id, effective_from DESC) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_refresh_token_hash; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_refresh_token_hash ON public.refresh_token USING btree (token_hash);


-- Name: idx_refresh_token_user; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_refresh_token_user ON public.refresh_token USING btree (user_id);


-- Name: idx_revinfo_changed_at; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_revinfo_changed_at ON public.revinfo USING btree (changed_at);


-- Name: idx_role_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_role_aud_rev ON public.role_aud USING btree (rev);


-- Name: idx_role_permission_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_role_permission_aud_rev ON public.role_permission_aud USING btree (rev);


-- Name: idx_role_system_status; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_role_system_status ON public.role USING btree (system, status);


-- Name: idx_role_type_system; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_role_type_system ON public.role USING btree (role_type, system);


-- Name: idx_search_document_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_search_document_company ON public.search_document USING btree (company_id);


-- Name: idx_search_document_trgm; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_search_document_trgm ON public.search_document USING gin (lower(public.immutable_unaccent(search_text)) public.gin_trgm_ops);


-- Name: idx_storage_link_entity; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_storage_link_entity ON public.storage_object_link USING btree (entity_type, entity_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_storage_object_bucket; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_storage_object_bucket ON public.storage_object USING btree (bucket) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_storage_object_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_storage_object_company ON public.storage_object USING btree (company_id);


-- Name: idx_storage_object_key_version; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX idx_storage_object_key_version ON public.storage_object USING btree (bucket, object_key, version_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_storage_object_link_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_storage_object_link_company ON public.storage_object_link USING btree (company_id);


-- Name: idx_system_notification_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_system_notification_company ON public.system_notification USING btree (company_id);


-- Name: idx_system_notification_recipient_unread; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_system_notification_recipient_unread ON public.system_notification USING btree (recipient_user_id, read_at, created_at DESC) WHERE ((status <> 'DELETED'::gesint_types.status_enum) AND (recipient_user_id IS NOT NULL));


-- Name: idx_system_notification_unread; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_system_notification_unread ON public.system_notification USING btree (read_at, created_at DESC) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_system_setting_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_system_setting_aud_rev ON public.system_setting_aud USING btree (rev);


-- Name: idx_tax_obligation_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_tax_obligation_aud_rev ON public.tax_obligation_aud USING btree (rev);


-- Name: idx_tax_obligation_collaborator; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_tax_obligation_collaborator ON public.tax_obligation USING btree (collaborator_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_tax_obligation_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_tax_obligation_company ON public.tax_obligation USING btree (company_id);


-- Name: idx_user_acting_profile_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_user_acting_profile_aud_rev ON public.user_acting_profile_aud USING btree (rev);


-- Name: idx_user_acting_profile_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_user_acting_profile_company ON public.user_acting_profile USING btree (company_id);


-- Name: idx_user_acting_profile_user; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_user_acting_profile_user ON public.user_acting_profile USING btree (user_id);


-- Name: idx_user_role_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_user_role_aud_rev ON public.user_role_aud USING btree (rev);


-- Name: idx_user_role_company; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_user_role_company ON public.user_role USING btree (company_id);


-- Name: idx_user_role_user; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_user_role_user ON public.user_role USING btree (user_id);


-- Name: idx_work_schedule_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_work_schedule_aud_rev ON public.work_schedule_aud USING btree (rev);


-- Name: idx_work_schedule_day_aud_rev; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_work_schedule_day_aud_rev ON public.work_schedule_day_aud USING btree (rev);


-- Name: idx_work_schedule_day_schedule; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_work_schedule_day_schedule ON public.work_schedule_day USING btree (work_schedule_id);


-- Name: idx_work_schedule_status; Type: INDEX; Schema: public; Owner: -

CREATE INDEX idx_work_schedule_status ON public.work_schedule USING btree (status) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_admission_process_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_admission_process_code ON public.admission_process USING btree (code);


-- Name: uk_admission_process_kanban_column_key_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_admission_process_kanban_column_key_active ON public.admission_process_kanban_column USING btree (lower((column_key)::text)) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_admission_step_admission_key; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_admission_step_admission_key ON public.admission_step USING btree (admission_id, step_key);


-- Name: uk_app_user_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_app_user_code ON public.app_user USING btree (code);


-- Name: uk_attendance_record_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_attendance_record_code ON public.attendance_record USING btree (code);


-- Name: uk_attendance_request_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_attendance_request_code ON public.attendance_request USING btree (code);


-- Name: uk_benefit_enrollment_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_benefit_enrollment_code ON public.benefit_enrollment USING btree (code);


-- Name: uk_benefit_plan_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_benefit_plan_code ON public.benefit_plan USING btree (code);


-- Name: uk_candidate_account_candidate_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_candidate_account_candidate_active ON public.candidate_account USING btree (candidate_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_candidate_account_email_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_candidate_account_email_active ON public.candidate_account USING btree (lower((email)::text)) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_candidate_account_google_sub_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_candidate_account_google_sub_active ON public.candidate_account USING btree (google_sub) WHERE ((status <> 'DELETED'::gesint_types.status_enum) AND (google_sub IS NOT NULL));


-- Name: uk_candidate_cpf_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_candidate_cpf_active ON public.candidate USING btree (cpf) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_collaborator_address_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_collaborator_address_code ON public.collaborator_address USING btree (code);


-- Name: uk_collaborator_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_collaborator_code ON public.collaborator USING btree (code);


-- Name: uk_collaborator_contact_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_collaborator_contact_code ON public.collaborator_contact USING btree (code);


-- Name: uk_company_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_company_code ON public.company USING btree (code);


-- Name: uk_company_headquarters; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_company_headquarters ON public.company USING btree (is_headquarters) WHERE (is_headquarters AND (status <> 'DELETED'::gesint_types.status_enum));


-- Name: uk_competency_name_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_competency_name_active ON public.competency USING btree (lower((name)::text)) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_department_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_department_code ON public.department USING btree (code);


-- Name: uk_development_plan_origin_name_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_development_plan_origin_name_active ON public.development_plan_origin USING btree (lower((name)::text)) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_development_track_name_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_development_track_name_active ON public.development_track USING btree (lower((name)::text)) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_document_type_type_code_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_document_type_type_code_active ON public.document_type USING btree (lower((type_code)::text)) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_employment_contract_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_employment_contract_code ON public.employment_contract USING btree (code);


-- Name: uk_evidence_type_name_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_evidence_type_name_active ON public.evidence_type USING btree (lower((name)::text)) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_exit_interview_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_exit_interview_code ON public.exit_interview USING btree (code);


-- Name: uk_exit_interview_return_checklist_item_key_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_exit_interview_return_checklist_item_key_active ON public.exit_interview_return_checklist_item USING btree (lower((item_key)::text)) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_experience_evaluation_admission; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_experience_evaluation_admission ON public.experience_evaluation USING btree (admission_process_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_experience_evaluation_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_experience_evaluation_code ON public.experience_evaluation USING btree (code);


-- Name: uk_experience_evaluation_score_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_experience_evaluation_score_code ON public.experience_evaluation_score USING btree (code);


-- Name: uk_experience_score_competency; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_experience_score_competency ON public.experience_evaluation_score USING btree (evaluation_id, competency_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_interview_evaluation_evaluator; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_interview_evaluation_evaluator ON public.job_application_interview_evaluation USING btree (job_vacancy_application_id, column_key, evaluator_user_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_interview_score_competency; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_interview_score_competency ON public.job_application_interview_score USING btree (evaluation_id, competency_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_job_application_interview_evaluation_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_job_application_interview_evaluation_code ON public.job_application_interview_evaluation USING btree (code);


-- Name: uk_job_application_interview_score_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_job_application_interview_score_code ON public.job_application_interview_score USING btree (code);


-- Name: uk_job_position_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_job_position_code ON public.job_position USING btree (code);


-- Name: uk_job_position_competency_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_job_position_competency_code ON public.job_position_competency USING btree (code);


-- Name: uk_job_position_salary_table_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_job_position_salary_table_code ON public.job_position_salary_table USING btree (code);


-- Name: uk_job_position_salary_table_item_level; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_job_position_salary_table_item_level ON public.job_position_salary_table_item USING btree (salary_table_id, level);


-- Name: uk_job_requisition_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_job_requisition_code ON public.job_requisition USING btree (code);


-- Name: uk_job_vacancy_application_pair_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_job_vacancy_application_pair_active ON public.job_vacancy_application USING btree (job_vacancy_id, candidate_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_job_vacancy_competency_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_job_vacancy_competency_code ON public.job_vacancy_competency USING btree (code);


-- Name: uk_job_vacancy_competency_pair; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_job_vacancy_competency_pair ON public.job_vacancy_competency USING btree (job_vacancy_id, competency_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_job_vacancy_slug_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_job_vacancy_slug_active ON public.job_vacancy USING btree (slug) WHERE ((slug IS NOT NULL) AND (status <> 'DELETED'::gesint_types.status_enum));


-- Name: uk_leave_request_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_leave_request_code ON public.leave_request USING btree (code);


-- Name: uk_offboarding_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_offboarding_code ON public.offboarding USING btree (code);


-- Name: uk_payment_batch_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_payment_batch_code ON public.payment_batch USING btree (code);


-- Name: uk_payment_period_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_payment_period_code ON public.payment_period USING btree (code);


-- Name: uk_payment_slip_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_payment_slip_code ON public.payment_slip USING btree (code);


-- Name: uk_payroll_event_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_payroll_event_code ON public.payroll_event USING btree (code);


-- Name: uk_payroll_event_code_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_payroll_event_code_active ON public.payroll_event USING btree (event_code) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_payroll_run_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_payroll_run_code ON public.payroll_run USING btree (code);


-- Name: uk_payslip_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_payslip_code ON public.payslip USING btree (code);


-- Name: uk_payslip_entry_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_payslip_entry_code ON public.payslip_entry USING btree (code);


-- Name: uk_performance_review_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_performance_review_code ON public.performance_review USING btree (code);


-- Name: uk_permission_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_permission_code ON public.permission USING btree (code);


-- Name: uk_proficiency_level_name_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_proficiency_level_name_active ON public.proficiency_level USING btree (lower((name)::text)) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_refresh_token_blacklist_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_refresh_token_blacklist_code ON public.refresh_token_blacklist USING btree (code);


-- Name: uk_refresh_token_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_refresh_token_code ON public.refresh_token USING btree (code);


-- Name: uk_role_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_role_code ON public.role USING btree (code);


-- Name: uk_role_name_system_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_role_name_system_active ON public.role USING btree (lower((name)::text), system) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_search_document_type_entity_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_search_document_type_entity_active ON public.search_document USING btree (document_type, entity_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_storage_object_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_storage_object_code ON public.storage_object USING btree (code);


-- Name: uk_storage_object_link_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_storage_object_link_code ON public.storage_object_link USING btree (code);


-- Name: uk_system_notification_reference_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_system_notification_reference_active ON public.system_notification USING btree (notification_type, reference_type, reference_id, reference_due_date) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_system_setting_key_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_system_setting_key_active ON public.system_setting USING btree (setting_key) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_tax_obligation_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_tax_obligation_code ON public.tax_obligation USING btree (code);


-- Name: uk_user_acting_profile_user_profile_company; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_user_acting_profile_user_profile_company ON public.user_acting_profile USING btree (user_id, acting_profile_id, COALESCE(company_id, '00000000-0000-0000-0000-000000000000'::uuid));


-- Name: uk_user_role_user_role_company; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uk_user_role_user_role_company ON public.user_role USING btree (user_id, role_id, COALESCE(company_id, '00000000-0000-0000-0000-000000000000'::uuid));


-- Name: uq_acting_profile_name_system_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uq_acting_profile_name_system_active ON public.acting_profile USING btree (lower((name)::text), system) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uq_collaborator_access_code; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uq_collaborator_access_code ON public.collaborator USING btree (access_code) WHERE ((access_code IS NOT NULL) AND (status <> 'DELETED'::gesint_types.status_enum));


-- Name: uq_digital_certificate_thumbprint_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uq_digital_certificate_thumbprint_active ON public.digital_certificate USING btree (thumbprint) WHERE ((status <> 'DELETED'::gesint_types.status_enum) AND (thumbprint IS NOT NULL));


-- Name: uq_payment_batch_period_source_file_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uq_payment_batch_period_source_file_active ON public.payment_batch USING btree (payment_period_id, lower((source_file_name)::text)) WHERE ((status <> 'DELETED'::gesint_types.status_enum) AND (source_file_name IS NOT NULL));


-- Name: uq_payment_period_reference_active; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX uq_payment_period_reference_active ON public.payment_period USING btree (reference_date) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: ux_admission_process_pre_admission_token; Type: INDEX; Schema: public; Owner: -

CREATE UNIQUE INDEX ux_admission_process_pre_admission_token ON public.admission_process USING btree (pre_admission_token) WHERE ((pre_admission_token IS NOT NULL) AND (status <> 'DELETED'::gesint_types.status_enum));


-- Name: admission_process admission_process_birth_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.admission_process
    ADD CONSTRAINT admission_process_birth_city_id_fkey FOREIGN KEY (birth_city_id) REFERENCES public.city(id);


-- Name: admission_process admission_process_collaborator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.admission_process
    ADD CONSTRAINT admission_process_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.collaborator(id);


-- Name: admission_process admission_process_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.admission_process
    ADD CONSTRAINT admission_process_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company(id);


-- Name: admission_process admission_process_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.admission_process
    ADD CONSTRAINT admission_process_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department(id);


-- Name: admission_process admission_process_job_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.admission_process
    ADD CONSTRAINT admission_process_job_position_id_fkey FOREIGN KEY (job_position_id) REFERENCES public.job_position(id);


-- Name: admission_step admission_step_admission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.admission_step
    ADD CONSTRAINT admission_step_admission_id_fkey FOREIGN KEY (admission_id) REFERENCES public.admission_process(id) ON DELETE CASCADE;


-- Name: app_user app_user_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_person_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.collaborator(id);


-- Name: attendance_record attendance_record_collaborator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.attendance_record
    ADD CONSTRAINT attendance_record_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.collaborator(id);


-- Name: attendance_request attendance_request_attendance_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.attendance_request
    ADD CONSTRAINT attendance_request_attendance_record_id_fkey FOREIGN KEY (attendance_record_id) REFERENCES public.attendance_record(id);


-- Name: attendance_request attendance_request_collaborator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.attendance_request
    ADD CONSTRAINT attendance_request_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.collaborator(id);


-- Name: benefit_enrollment benefit_enrollment_benefit_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.benefit_enrollment
    ADD CONSTRAINT benefit_enrollment_benefit_plan_id_fkey FOREIGN KEY (benefit_plan_id) REFERENCES public.benefit_plan(id);


-- Name: benefit_enrollment benefit_enrollment_collaborator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.benefit_enrollment
    ADD CONSTRAINT benefit_enrollment_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.collaborator(id);


-- Name: candidate_account candidate_account_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.candidate_account
    ADD CONSTRAINT candidate_account_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidate(id);


-- Name: candidate_experience candidate_experience_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.candidate_experience
    ADD CONSTRAINT candidate_experience_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidate(id);


-- Name: careers_page_block careers_page_block_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.careers_page_block
    ADD CONSTRAINT careers_page_block_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.careers_page(id);


-- Name: city city_state_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.city
    ADD CONSTRAINT city_state_id_fkey FOREIGN KEY (state_id) REFERENCES public.state(id);


-- Name: collaborator_address collaborator_address_collaborator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.collaborator_address
    ADD CONSTRAINT collaborator_address_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.collaborator(id);


-- Name: collaborator_contact collaborator_contact_collaborator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.collaborator_contact
    ADD CONSTRAINT collaborator_contact_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.collaborator(id);


-- Name: company company_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.company
    ADD CONSTRAINT company_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.company(id);


-- Name: complementary_exam complementary_exam_occupational_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.complementary_exam
    ADD CONSTRAINT complementary_exam_occupational_exam_id_fkey FOREIGN KEY (occupational_exam_id) REFERENCES public.occupational_exam(id) ON DELETE CASCADE;


-- Name: complementary_exam complementary_exam_procedure_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.complementary_exam
    ADD CONSTRAINT complementary_exam_procedure_code_fkey FOREIGN KEY (procedure_code) REFERENCES public.esocial_table27_procedure(procedure_code);


-- Name: contract_recess_period contract_recess_period_collaborator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.contract_recess_period
    ADD CONSTRAINT contract_recess_period_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.collaborator(id);


-- Name: contract_recess_period contract_recess_period_policy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.contract_recess_period
    ADD CONSTRAINT contract_recess_period_policy_id_fkey FOREIGN KEY (policy_id) REFERENCES public.contract_recess_policy(id);


-- Name: contract_recess_policy contract_recess_policy_employment_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.contract_recess_policy
    ADD CONSTRAINT contract_recess_policy_employment_contract_id_fkey FOREIGN KEY (employment_contract_id) REFERENCES public.employment_contract(id);


-- Name: department department_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.department
    ADD CONSTRAINT department_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company(id);


-- Name: department department_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.department
    ADD CONSTRAINT department_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.department(id);


-- Name: development_plan_action development_plan_action_goal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan_action
    ADD CONSTRAINT development_plan_action_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES public.development_plan_goal(id) ON DELETE CASCADE;


-- Name: development_plan_checkin development_plan_checkin_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan_checkin
    ADD CONSTRAINT development_plan_checkin_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.development_plan(id) ON DELETE CASCADE;


-- Name: development_plan_competency development_plan_competency_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan_competency
    ADD CONSTRAINT development_plan_competency_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.development_plan(id) ON DELETE CASCADE;


-- Name: development_plan_evidence development_plan_evidence_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan_evidence
    ADD CONSTRAINT development_plan_evidence_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.development_plan(id) ON DELETE CASCADE;


-- Name: development_plan_goal development_plan_goal_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_plan_goal
    ADD CONSTRAINT development_plan_goal_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.development_plan(id) ON DELETE CASCADE;


-- Name: development_track_competency development_track_competency_track_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.development_track_competency
    ADD CONSTRAINT development_track_competency_track_id_fkey FOREIGN KEY (track_id) REFERENCES public.development_track(id) ON DELETE CASCADE;


-- Name: employment_contract employment_contract_collaborator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.employment_contract
    ADD CONSTRAINT employment_contract_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.collaborator(id);


-- Name: employment_contract employment_contract_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.employment_contract
    ADD CONSTRAINT employment_contract_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company(id);


-- Name: employment_contract employment_contract_job_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.employment_contract
    ADD CONSTRAINT employment_contract_job_position_id_fkey FOREIGN KEY (job_position_id) REFERENCES public.job_position(id);


-- Name: esocial_event esocial_event_admission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.esocial_event
    ADD CONSTRAINT esocial_event_admission_id_fkey FOREIGN KEY (admission_id) REFERENCES public.admission_process(id);


-- Name: esocial_event esocial_event_collaborator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.esocial_event
    ADD CONSTRAINT esocial_event_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.collaborator(id);


-- Name: esocial_health_event esocial_health_event_occupational_exam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.esocial_health_event
    ADD CONSTRAINT esocial_health_event_occupational_exam_id_fkey FOREIGN KEY (occupational_exam_id) REFERENCES public.occupational_exam(id);


-- Name: exam_requirement exam_requirement_job_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.exam_requirement
    ADD CONSTRAINT exam_requirement_job_position_id_fkey FOREIGN KEY (job_position_id) REFERENCES public.job_position(id);


-- Name: exit_interview exit_interview_collaborator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.exit_interview
    ADD CONSTRAINT exit_interview_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.collaborator(id);


-- Name: exit_interview exit_interview_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.exit_interview
    ADD CONSTRAINT exit_interview_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department(id);


-- Name: exit_interview exit_interview_job_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.exit_interview
    ADD CONSTRAINT exit_interview_job_position_id_fkey FOREIGN KEY (job_position_id) REFERENCES public.job_position(id);


-- Name: experience_evaluation_score experience_evaluation_score_competency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.experience_evaluation_score
    ADD CONSTRAINT experience_evaluation_score_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competency(id);


-- Name: experience_evaluation_score experience_evaluation_score_evaluation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.experience_evaluation_score
    ADD CONSTRAINT experience_evaluation_score_evaluation_id_fkey FOREIGN KEY (evaluation_id) REFERENCES public.experience_evaluation(id);


-- Name: admission_process fk_admission_city; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.admission_process
    ADD CONSTRAINT fk_admission_city FOREIGN KEY (city_id) REFERENCES public.city(id);


-- Name: admission_process fk_admission_state; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.admission_process
    ADD CONSTRAINT fk_admission_state FOREIGN KEY (state_id) REFERENCES public.state(id);


-- Name: collaborator_address fk_collaborator_address_city; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.collaborator_address
    ADD CONSTRAINT fk_collaborator_address_city FOREIGN KEY (city_id) REFERENCES public.city(id);


-- Name: collaborator_address fk_collaborator_address_state; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.collaborator_address
    ADD CONSTRAINT fk_collaborator_address_state FOREIGN KEY (state_id) REFERENCES public.state(id);


-- Name: job_application_interview_evaluation job_application_interview_evalu_job_vacancy_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_application_interview_evaluation
    ADD CONSTRAINT job_application_interview_evalu_job_vacancy_application_id_fkey FOREIGN KEY (job_vacancy_application_id) REFERENCES public.job_vacancy_application(id);


-- Name: job_application_interview_score job_application_interview_score_competency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_application_interview_score
    ADD CONSTRAINT job_application_interview_score_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competency(id);


-- Name: job_application_interview_score job_application_interview_score_evaluation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_application_interview_score
    ADD CONSTRAINT job_application_interview_score_evaluation_id_fkey FOREIGN KEY (evaluation_id) REFERENCES public.job_application_interview_evaluation(id);


-- Name: job_position job_position_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_position
    ADD CONSTRAINT job_position_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company(id);


-- Name: job_position_competency job_position_competency_competency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_position_competency
    ADD CONSTRAINT job_position_competency_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competency(id);


-- Name: job_position_competency job_position_competency_job_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_position_competency
    ADD CONSTRAINT job_position_competency_job_position_id_fkey FOREIGN KEY (job_position_id) REFERENCES public.job_position(id);


-- Name: job_position job_position_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_position
    ADD CONSTRAINT job_position_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.department(id);


-- Name: job_position_salary_table_item job_position_salary_table_item_salary_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_position_salary_table_item
    ADD CONSTRAINT job_position_salary_table_item_salary_table_id_fkey FOREIGN KEY (salary_table_id) REFERENCES public.job_position_salary_table(id) ON DELETE CASCADE;


-- Name: job_position_salary_table job_position_salary_table_job_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_position_salary_table
    ADD CONSTRAINT job_position_salary_table_job_position_id_fkey FOREIGN KEY (job_position_id) REFERENCES public.job_position(id);


-- Name: job_requisition job_requisition_job_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_requisition
    ADD CONSTRAINT job_requisition_job_position_id_fkey FOREIGN KEY (job_position_id) REFERENCES public.job_position(id);


-- Name: job_vacancy_application job_vacancy_application_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_vacancy_application
    ADD CONSTRAINT job_vacancy_application_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidate(id);


-- Name: job_vacancy_application job_vacancy_application_job_vacancy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_vacancy_application
    ADD CONSTRAINT job_vacancy_application_job_vacancy_id_fkey FOREIGN KEY (job_vacancy_id) REFERENCES public.job_vacancy(id);


-- Name: job_vacancy_competency job_vacancy_competency_competency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_vacancy_competency
    ADD CONSTRAINT job_vacancy_competency_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competency(id);


-- Name: job_vacancy_competency job_vacancy_competency_job_vacancy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.job_vacancy_competency
    ADD CONSTRAINT job_vacancy_competency_job_vacancy_id_fkey FOREIGN KEY (job_vacancy_id) REFERENCES public.job_vacancy(id);


-- Name: leave_request leave_request_collaborator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.leave_request
    ADD CONSTRAINT leave_request_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.collaborator(id);


-- Name: leave_request leave_request_recess_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.leave_request
    ADD CONSTRAINT leave_request_recess_period_id_fkey FOREIGN KEY (recess_period_id) REFERENCES public.contract_recess_period(id);


-- Name: occupational_exam occupational_exam_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.occupational_exam
    ADD CONSTRAINT occupational_exam_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.medical_clinic(id);


-- Name: occupational_exam occupational_exam_collaborator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.occupational_exam
    ADD CONSTRAINT occupational_exam_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.collaborator(id);


-- Name: occupational_exam occupational_exam_coordinator_physician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.occupational_exam
    ADD CONSTRAINT occupational_exam_coordinator_physician_id_fkey FOREIGN KEY (coordinator_physician_id) REFERENCES public.occupational_physician(id);


-- Name: occupational_exam occupational_exam_exam_requirement_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.occupational_exam
    ADD CONSTRAINT occupational_exam_exam_requirement_version_id_fkey FOREIGN KEY (exam_requirement_version_id) REFERENCES public.exam_requirement(id);


-- Name: occupational_exam occupational_exam_examiner_physician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.occupational_exam
    ADD CONSTRAINT occupational_exam_examiner_physician_id_fkey FOREIGN KEY (examiner_physician_id) REFERENCES public.occupational_physician(id);


-- Name: occupational_exam occupational_exam_job_position_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.occupational_exam
    ADD CONSTRAINT occupational_exam_job_position_id_fkey FOREIGN KEY (job_position_id) REFERENCES public.job_position(id);


-- Name: occupational_exam occupational_exam_related_leave_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.occupational_exam
    ADD CONSTRAINT occupational_exam_related_leave_request_id_fkey FOREIGN KEY (related_leave_request_id) REFERENCES public.leave_request(id);


-- Name: occupational_physician_clinic occupational_physician_clinic_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.occupational_physician_clinic
    ADD CONSTRAINT occupational_physician_clinic_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.medical_clinic(id);


-- Name: occupational_physician_clinic occupational_physician_clinic_physician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.occupational_physician_clinic
    ADD CONSTRAINT occupational_physician_clinic_physician_id_fkey FOREIGN KEY (physician_id) REFERENCES public.occupational_physician(id);


-- Name: offboarding offboarding_collaborator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.offboarding
    ADD CONSTRAINT offboarding_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.collaborator(id);


-- Name: payment_batch payment_batch_payment_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payment_batch
    ADD CONSTRAINT payment_batch_payment_period_id_fkey FOREIGN KEY (payment_period_id) REFERENCES public.payment_period(id);


-- Name: payment_batch payment_batch_source_object_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payment_batch
    ADD CONSTRAINT payment_batch_source_object_id_fkey FOREIGN KEY (source_object_id) REFERENCES public.storage_object(id);


-- Name: payment_slip payment_slip_collaborator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payment_slip
    ADD CONSTRAINT payment_slip_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.collaborator(id);


-- Name: payment_slip payment_slip_payment_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payment_slip
    ADD CONSTRAINT payment_slip_payment_batch_id_fkey FOREIGN KEY (payment_batch_id) REFERENCES public.payment_batch(id);


-- Name: payment_slip payment_slip_slip_object_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payment_slip
    ADD CONSTRAINT payment_slip_slip_object_id_fkey FOREIGN KEY (slip_object_id) REFERENCES public.storage_object(id);


-- Name: payslip payslip_collaborator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payslip
    ADD CONSTRAINT payslip_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.collaborator(id);


-- Name: payslip_entry payslip_entry_payroll_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payslip_entry
    ADD CONSTRAINT payslip_entry_payroll_event_id_fkey FOREIGN KEY (payroll_event_id) REFERENCES public.payroll_event(id);


-- Name: payslip_entry payslip_entry_payslip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payslip_entry
    ADD CONSTRAINT payslip_entry_payslip_id_fkey FOREIGN KEY (payslip_id) REFERENCES public.payslip(id);


-- Name: payslip payslip_payroll_run_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.payslip
    ADD CONSTRAINT payslip_payroll_run_id_fkey FOREIGN KEY (payroll_run_id) REFERENCES public.payroll_run(id);


-- Name: performance_review performance_review_collaborator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.performance_review
    ADD CONSTRAINT performance_review_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.collaborator(id);


-- Name: refresh_token refresh_token_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT refresh_token_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_user(id);


-- Name: role_permission role_permission_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permission(id);


-- Name: role_permission role_permission_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.role_permission
    ADD CONSTRAINT role_permission_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role(id);


-- Name: storage_object_link storage_object_link_storage_object_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.storage_object_link
    ADD CONSTRAINT storage_object_link_storage_object_id_fkey FOREIGN KEY (storage_object_id) REFERENCES public.storage_object(id);


-- Name: tax_obligation tax_obligation_collaborator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.tax_obligation
    ADD CONSTRAINT tax_obligation_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.collaborator(id);


-- Name: user_role user_role_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role(id);


-- Name: user_role user_role_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_user(id);


-- Name: work_schedule_day work_schedule_day_work_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -

ALTER TABLE ONLY public.work_schedule_day
    ADD CONSTRAINT work_schedule_day_work_schedule_id_fkey FOREIGN KEY (work_schedule_id) REFERENCES public.work_schedule(id) ON DELETE CASCADE;
