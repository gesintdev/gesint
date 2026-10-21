-- Gesint Admin baseline schema (squashed from V1-V19).
-- Requires Client migrations first (gesint_types enums).

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

-- Name: admin; Type: SCHEMA; Schema: -; Owner: -

CREATE SCHEMA IF NOT EXISTS admin;


SET default_tablespace = '';

SET default_table_access_method = heap;

-- Name: admin_user; Type: TABLE; Schema: admin; Owner: -

CREATE TABLE admin.admin_user (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(200) NOT NULL,
    password_hash character varying(255),
    full_name character varying(200) NOT NULL,
    last_login timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    access_token_hash character varying(64),
    first_access_completed boolean DEFAULT false NOT NULL
);


-- Name: assistant_error_log; Type: TABLE; Schema: admin; Owner: -

CREATE TABLE admin.assistant_error_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid,
    client_name character varying(200),
    user_id uuid,
    user_name character varying(200),
    user_email character varying(200),
    tenant_schema character varying(100),
    summary character varying(500) NOT NULL,
    error_class character varying(200),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


-- Name: TABLE assistant_error_log; Type: COMMENT; Schema: admin; Owner: -

COMMENT ON TABLE admin.assistant_error_log IS 'Falhas do assistente I.A. (Client); sem conteúdo sensível da conversa';


-- Name: client; Type: TABLE; Schema: admin; Owner: -

CREATE TABLE admin.client (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(100) NOT NULL,
    document character varying(18),
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    mobile_login_code character varying(9) NOT NULL,
    legal_name character varying(255),
    tenant_company_id uuid,
    street character varying(200),
    number character varying(20),
    complement character varying(100),
    district character varying(100),
    city character varying(100),
    state_code character varying(2),
    zip_code character varying(10)
);


-- Name: COLUMN client.name; Type: COMMENT; Schema: admin; Owner: -

COMMENT ON COLUMN admin.client.name IS 'Nome fantasia';


-- Name: COLUMN client.legal_name; Type: COMMENT; Schema: admin; Owner: -

COMMENT ON COLUMN admin.client.legal_name IS 'Razao social';


-- Name: COLUMN client.street; Type: COMMENT; Schema: admin; Owner: -

COMMENT ON COLUMN admin.client.street IS 'Logradouro da matriz';


-- Name: COLUMN client.state_code; Type: COMMENT; Schema: admin; Owner: -

COMMENT ON COLUMN admin.client.state_code IS 'UF da matriz (2 letras)';


-- Name: COLUMN client.zip_code; Type: COMMENT; Schema: admin; Owner: -

COMMENT ON COLUMN admin.client.zip_code IS 'CEP da matriz';


-- Name: client_branch; Type: TABLE; Schema: admin; Owner: -

CREATE TABLE admin.client_branch (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    code integer,
    client_id uuid NOT NULL,
    tenant_company_id uuid,
    sort_order integer DEFAULT 0 NOT NULL,
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
    provisioned_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: client_contact; Type: TABLE; Schema: admin; Owner: -

CREATE TABLE admin.client_contact (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    code integer NOT NULL,
    client_id uuid NOT NULL,
    type character varying(16) NOT NULL,
    value character varying(200) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    CONSTRAINT ck_client_contact_type CHECK (((type)::text = ANY ((ARRAY['EMAIL'::character varying, 'PHONE'::character varying])::text[])))
);


-- Name: TABLE client_contact; Type: COMMENT; Schema: admin; Owner: -

COMMENT ON TABLE admin.client_contact IS 'Contatos do cliente (EMAIL ou PHONE) vinculados aos Dados Basicos.';


-- Name: client_contracted_system; Type: TABLE; Schema: admin; Owner: -

CREATE TABLE admin.client_contracted_system (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    code integer NOT NULL,
    client_id uuid NOT NULL,
    name character varying(150) NOT NULL,
    module_name character varying(150),
    operational_status character varying(32) DEFAULT 'ACTIVE'::character varying NOT NULL,
    status_date date,
    return_date date,
    negotiated_amount numeric(12,2),
    discount_percent numeric(5,2),
    agreed_amount numeric(12,2),
    contract_type character varying(32),
    contract_date date,
    end_date date,
    due_day character varying(2),
    late_tolerance character varying(50),
    with_ai boolean DEFAULT false NOT NULL,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    product_system_id uuid NOT NULL,
    effective_from timestamp with time zone,
    deactivate_at timestamp with time zone,
    session_policy character varying(32) DEFAULT 'KEEP_UNTIL_EXPIRY'::character varying NOT NULL,
    branch_mode character varying(16) DEFAULT 'ALL'::character varying NOT NULL
);


-- Name: COLUMN client_contracted_system.product_system_id; Type: COMMENT; Schema: admin; Owner: -

COMMENT ON COLUMN admin.client_contracted_system.product_system_id IS 'Sistema do catalogo vinculado ao contrato do cliente';


-- Name: COLUMN client_contracted_system.effective_from; Type: COMMENT; Schema: admin; Owner: -

COMMENT ON COLUMN admin.client_contracted_system.effective_from IS 'Inicio da vigencia (null = imediato)';


-- Name: COLUMN client_contracted_system.deactivate_at; Type: COMMENT; Schema: admin; Owner: -

COMMENT ON COLUMN admin.client_contracted_system.deactivate_at IS 'Fim da vigencia / desativacao agendada';


-- Name: COLUMN client_contracted_system.session_policy; Type: COMMENT; Schema: admin; Owner: -

COMMENT ON COLUMN admin.client_contracted_system.session_policy IS 'FORCE_LOGOUT | KEEP_UNTIL_EXPIRY | SCHEDULED';


-- Name: client_contracted_system_branch; Type: TABLE; Schema: admin; Owner: -

CREATE TABLE admin.client_contracted_system_branch (
    contracted_system_id uuid NOT NULL,
    client_branch_id uuid
);


-- Name: client_environment_config; Type: TABLE; Schema: admin; Owner: -

CREATE TABLE admin.client_environment_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    code integer NOT NULL,
    client_id uuid NOT NULL,
    routing_mode character varying(32) DEFAULT 'SUBDOMAIN'::character varying NOT NULL,
    subdomain character varying(100),
    custom_domain character varying(200),
    database_strategy character varying(32) DEFAULT 'DEDICATED_DATABASE'::character varying NOT NULL,
    database_host character varying(200),
    database_port integer,
    database_name character varying(100),
    database_schema character varying(100),
    database_user character varying(150),
    database_secret_ref character varying(255),
    provisioning_status character varying(32) DEFAULT 'PENDING'::character varying NOT NULL,
    provisioning_notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: client_payment; Type: TABLE; Schema: admin; Owner: -

CREATE TABLE admin.client_payment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    client_id uuid NOT NULL,
    reference_code character varying(100),
    amount numeric(12,2) NOT NULL,
    due_date date NOT NULL,
    paid_at timestamp with time zone,
    payment_status character varying(32) DEFAULT 'PENDING'::character varying NOT NULL,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL
);


-- Name: client_subscription; Type: TABLE; Schema: admin; Owner: -

CREATE TABLE admin.client_subscription (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    client_id uuid NOT NULL,
    plan_code character varying(50) NOT NULL,
    billing_status character varying(32) DEFAULT 'ACTIVE'::character varying NOT NULL,
    started_at timestamp with time zone,
    ends_at timestamp with time zone,
    monthly_amount numeric(12,2),
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL
);


-- Name: client_user; Type: TABLE; Schema: admin; Owner: -

CREATE TABLE admin.client_user (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    client_id uuid NOT NULL,
    tenant_app_user_id uuid,
    display_name character varying(200),
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone,
    code integer NOT NULL,
    username character varying(100),
    email character varying(200),
    password_hash character varying(255),
    provisioned_at timestamp with time zone,
    access_token_hash character varying(64),
    first_access_completed boolean DEFAULT false NOT NULL
);


-- Name: platform_email_settings; Type: TABLE; Schema: admin; Owner: -

CREATE TABLE admin.platform_email_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    code integer NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    host character varying(200),
    port integer,
    security character varying(16) DEFAULT 'STARTTLS'::character varying NOT NULL,
    username character varying(200),
    password_encrypted bytea,
    from_address character varying(200),
    from_name character varying(120),
    reply_to character varying(200),
    last_test_at timestamp with time zone,
    last_test_success boolean,
    last_test_message character varying(500),
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: TABLE platform_email_settings; Type: COMMENT; Schema: admin; Owner: -

COMMENT ON TABLE admin.platform_email_settings IS 'SMTP da plataforma Gesint (linha unica, lida pelo Client)';


-- Name: COLUMN platform_email_settings.password_encrypted; Type: COMMENT; Schema: admin; Owner: -

COMMENT ON COLUMN admin.platform_email_settings.password_encrypted IS 'Senha SMTP / senha de app cifrada (AES-GCM)';


-- Name: platform_outbox_event; Type: TABLE; Schema: admin; Owner: -

CREATE TABLE admin.platform_outbox_event (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type character varying(80) NOT NULL,
    aggregate_type character varying(80) NOT NULL,
    aggregate_id uuid NOT NULL,
    payload jsonb NOT NULL,
    status character varying(32) DEFAULT 'PENDING'::character varying NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    last_error text,
    available_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


-- Name: product_system; Type: TABLE; Schema: admin; Owner: -

CREATE TABLE admin.product_system (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    status gesint_types.status_enum DEFAULT 'ACTIVE'::gesint_types.status_enum NOT NULL,
    code integer NOT NULL,
    key character varying(32) NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    default_price numeric(12,2),
    with_ai_available boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    updated_at timestamp with time zone
);


-- Name: TABLE product_system; Type: COMMENT; Schema: admin; Owner: -

COMMENT ON TABLE admin.product_system IS 'Catalogo dos sistemas Gesint disponiveis para contratacao';


-- Name: COLUMN product_system.key; Type: COMMENT; Schema: admin; Owner: -

COMMENT ON COLUMN admin.product_system.key IS 'Codigo estavel do sistema (DP, RH, CTB, ...)';


-- Name: refresh_token; Type: TABLE; Schema: admin; Owner: -

CREATE TABLE admin.refresh_token (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(64) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    code integer NOT NULL
);


-- Name: refresh_token_blacklist; Type: TABLE; Schema: admin; Owner: -

CREATE TABLE admin.refresh_token_blacklist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    token_hash character varying(64) NOT NULL,
    revoked_at timestamp with time zone DEFAULT now() NOT NULL,
    code integer NOT NULL
);


-- Name: admin_user admin_user_pkey; Type: CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.admin_user
    ADD CONSTRAINT admin_user_pkey PRIMARY KEY (id);


-- Name: assistant_error_log assistant_error_log_pkey; Type: CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.assistant_error_log
    ADD CONSTRAINT assistant_error_log_pkey PRIMARY KEY (id);


-- Name: client_branch client_branch_pkey; Type: CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.client_branch
    ADD CONSTRAINT client_branch_pkey PRIMARY KEY (id);


-- Name: client_contact client_contact_pkey; Type: CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.client_contact
    ADD CONSTRAINT client_contact_pkey PRIMARY KEY (id);


-- Name: client_contracted_system client_contracted_system_pkey; Type: CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.client_contracted_system
    ADD CONSTRAINT client_contracted_system_pkey PRIMARY KEY (id);


-- Name: client_environment_config client_environment_config_pkey; Type: CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.client_environment_config
    ADD CONSTRAINT client_environment_config_pkey PRIMARY KEY (id);


-- Name: client_payment client_payment_pkey; Type: CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.client_payment
    ADD CONSTRAINT client_payment_pkey PRIMARY KEY (id);


-- Name: client client_pkey; Type: CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.client
    ADD CONSTRAINT client_pkey PRIMARY KEY (id);


-- Name: client_subscription client_subscription_pkey; Type: CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.client_subscription
    ADD CONSTRAINT client_subscription_pkey PRIMARY KEY (id);


-- Name: client_user client_user_pkey; Type: CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.client_user
    ADD CONSTRAINT client_user_pkey PRIMARY KEY (id);


-- Name: platform_email_settings platform_email_settings_code_key; Type: CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.platform_email_settings
    ADD CONSTRAINT platform_email_settings_code_key UNIQUE (code);


-- Name: platform_email_settings platform_email_settings_pkey; Type: CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.platform_email_settings
    ADD CONSTRAINT platform_email_settings_pkey PRIMARY KEY (id);


-- Name: platform_outbox_event platform_outbox_event_pkey; Type: CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.platform_outbox_event
    ADD CONSTRAINT platform_outbox_event_pkey PRIMARY KEY (id);


-- Name: product_system product_system_pkey; Type: CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.product_system
    ADD CONSTRAINT product_system_pkey PRIMARY KEY (id);


-- Name: refresh_token_blacklist refresh_token_blacklist_pkey; Type: CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.refresh_token_blacklist
    ADD CONSTRAINT refresh_token_blacklist_pkey PRIMARY KEY (id);


-- Name: refresh_token_blacklist refresh_token_blacklist_token_hash_key; Type: CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.refresh_token_blacklist
    ADD CONSTRAINT refresh_token_blacklist_token_hash_key UNIQUE (token_hash);


-- Name: refresh_token refresh_token_pkey; Type: CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.refresh_token
    ADD CONSTRAINT refresh_token_pkey PRIMARY KEY (id);


-- Name: refresh_token refresh_token_token_hash_key; Type: CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.refresh_token
    ADD CONSTRAINT refresh_token_token_hash_key UNIQUE (token_hash);


-- Name: idx_admin_user_access_token_hash; Type: INDEX; Schema: admin; Owner: -

CREATE INDEX idx_admin_user_access_token_hash ON admin.admin_user USING btree (access_token_hash) WHERE ((access_token_hash IS NOT NULL) AND (status <> 'DELETED'::gesint_types.status_enum));


-- Name: idx_admin_user_email; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX idx_admin_user_email ON admin.admin_user USING btree (email) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_admin_user_username; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX idx_admin_user_username ON admin.admin_user USING btree (username) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_assistant_error_log_client_id; Type: INDEX; Schema: admin; Owner: -

CREATE INDEX idx_assistant_error_log_client_id ON admin.assistant_error_log USING btree (client_id);


-- Name: idx_assistant_error_log_created_at; Type: INDEX; Schema: admin; Owner: -

CREATE INDEX idx_assistant_error_log_created_at ON admin.assistant_error_log USING btree (created_at DESC);


-- Name: idx_client_branch_client; Type: INDEX; Schema: admin; Owner: -

CREATE INDEX idx_client_branch_client ON admin.client_branch USING btree (client_id);


-- Name: idx_client_contact_client; Type: INDEX; Schema: admin; Owner: -

CREATE INDEX idx_client_contact_client ON admin.client_contact USING btree (client_id);


-- Name: idx_client_contracted_system_client; Type: INDEX; Schema: admin; Owner: -

CREATE INDEX idx_client_contracted_system_client ON admin.client_contracted_system USING btree (client_id);


-- Name: idx_client_contracted_system_product; Type: INDEX; Schema: admin; Owner: -

CREATE INDEX idx_client_contracted_system_product ON admin.client_contracted_system USING btree (product_system_id);


-- Name: idx_client_environment_config_client; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX idx_client_environment_config_client ON admin.client_environment_config USING btree (client_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_client_environment_config_custom_domain; Type: INDEX; Schema: admin; Owner: -

CREATE INDEX idx_client_environment_config_custom_domain ON admin.client_environment_config USING btree (custom_domain) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_client_environment_config_subdomain; Type: INDEX; Schema: admin; Owner: -

CREATE INDEX idx_client_environment_config_subdomain ON admin.client_environment_config USING btree (subdomain) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_client_mobile_login_code; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX idx_client_mobile_login_code ON admin.client USING btree (mobile_login_code) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_client_payment_client; Type: INDEX; Schema: admin; Owner: -

CREATE INDEX idx_client_payment_client ON admin.client_payment USING btree (client_id);


-- Name: idx_client_payment_due_date; Type: INDEX; Schema: admin; Owner: -

CREATE INDEX idx_client_payment_due_date ON admin.client_payment USING btree (due_date);


-- Name: idx_client_slug; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX idx_client_slug ON admin.client USING btree (slug) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: idx_client_subscription_client; Type: INDEX; Schema: admin; Owner: -

CREATE INDEX idx_client_subscription_client ON admin.client_subscription USING btree (client_id);


-- Name: idx_client_subscription_client_active; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX idx_client_subscription_client_active ON admin.client_subscription USING btree (client_id) WHERE ((status <> 'DELETED'::gesint_types.status_enum) AND ((billing_status)::text = 'ACTIVE'::text));


-- Name: idx_client_user_access_token_hash; Type: INDEX; Schema: admin; Owner: -

CREATE INDEX idx_client_user_access_token_hash ON admin.client_user USING btree (access_token_hash) WHERE ((access_token_hash IS NOT NULL) AND (status <> 'DELETED'::gesint_types.status_enum));


-- Name: idx_client_user_client; Type: INDEX; Schema: admin; Owner: -

CREATE INDEX idx_client_user_client ON admin.client_user USING btree (client_id);


-- Name: idx_client_user_client_username; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX idx_client_user_client_username ON admin.client_user USING btree (client_id, lower((username)::text)) WHERE ((status <> 'DELETED'::gesint_types.status_enum) AND (username IS NOT NULL));


-- Name: idx_client_user_email; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX idx_client_user_email ON admin.client_user USING btree (lower((email)::text)) WHERE ((status <> 'DELETED'::gesint_types.status_enum) AND (email IS NOT NULL));


-- Name: idx_contracted_system_branch_contract; Type: INDEX; Schema: admin; Owner: -

CREATE INDEX idx_contracted_system_branch_contract ON admin.client_contracted_system_branch USING btree (contracted_system_id);


-- Name: idx_platform_outbox_aggregate; Type: INDEX; Schema: admin; Owner: -

CREATE INDEX idx_platform_outbox_aggregate ON admin.platform_outbox_event USING btree (aggregate_type, aggregate_id);


-- Name: idx_platform_outbox_pending; Type: INDEX; Schema: admin; Owner: -

CREATE INDEX idx_platform_outbox_pending ON admin.platform_outbox_event USING btree (status, available_at) WHERE ((status)::text = 'PENDING'::text);


-- Name: idx_product_system_sort; Type: INDEX; Schema: admin; Owner: -

CREATE INDEX idx_product_system_sort ON admin.product_system USING btree (sort_order);


-- Name: uk_admin_user_code; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX uk_admin_user_code ON admin.admin_user USING btree (code);


-- Name: uk_client_branch_client_cnpj; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX uk_client_branch_client_cnpj ON admin.client_branch USING btree (client_id, cnpj) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_client_branch_code; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX uk_client_branch_code ON admin.client_branch USING btree (code);


-- Name: uk_client_code; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX uk_client_code ON admin.client USING btree (code);


-- Name: uk_client_contact_code; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX uk_client_contact_code ON admin.client_contact USING btree (code);


-- Name: uk_client_contracted_system_client_product; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX uk_client_contracted_system_client_product ON admin.client_contracted_system USING btree (client_id, product_system_id) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_client_contracted_system_code; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX uk_client_contracted_system_code ON admin.client_contracted_system USING btree (code);


-- Name: uk_client_environment_config_code; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX uk_client_environment_config_code ON admin.client_environment_config USING btree (code);


-- Name: uk_client_payment_code; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX uk_client_payment_code ON admin.client_payment USING btree (code);


-- Name: uk_client_subscription_code; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX uk_client_subscription_code ON admin.client_subscription USING btree (code);


-- Name: uk_client_user_code; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX uk_client_user_code ON admin.client_user USING btree (code);


-- Name: uk_contracted_system_branch; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX uk_contracted_system_branch ON admin.client_contracted_system_branch USING btree (contracted_system_id, COALESCE(client_branch_id, '00000000-0000-0000-0000-000000000000'::uuid));


-- Name: uk_product_system_code; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX uk_product_system_code ON admin.product_system USING btree (code);


-- Name: uk_product_system_key; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX uk_product_system_key ON admin.product_system USING btree (key) WHERE (status <> 'DELETED'::gesint_types.status_enum);


-- Name: uk_refresh_token_blacklist_code; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX uk_refresh_token_blacklist_code ON admin.refresh_token_blacklist USING btree (code);


-- Name: uk_refresh_token_code; Type: INDEX; Schema: admin; Owner: -

CREATE UNIQUE INDEX uk_refresh_token_code ON admin.refresh_token USING btree (code);


-- Name: client_branch client_branch_client_id_fkey; Type: FK CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.client_branch
    ADD CONSTRAINT client_branch_client_id_fkey FOREIGN KEY (client_id) REFERENCES admin.client(id);


-- Name: client_contact client_contact_client_id_fkey; Type: FK CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.client_contact
    ADD CONSTRAINT client_contact_client_id_fkey FOREIGN KEY (client_id) REFERENCES admin.client(id);


-- Name: client_contracted_system_branch client_contracted_system_branch_client_branch_id_fkey; Type: FK CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.client_contracted_system_branch
    ADD CONSTRAINT client_contracted_system_branch_client_branch_id_fkey FOREIGN KEY (client_branch_id) REFERENCES admin.client_branch(id) ON DELETE CASCADE;


-- Name: client_contracted_system_branch client_contracted_system_branch_contracted_system_id_fkey; Type: FK CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.client_contracted_system_branch
    ADD CONSTRAINT client_contracted_system_branch_contracted_system_id_fkey FOREIGN KEY (contracted_system_id) REFERENCES admin.client_contracted_system(id) ON DELETE CASCADE;


-- Name: client_contracted_system client_contracted_system_client_id_fkey; Type: FK CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.client_contracted_system
    ADD CONSTRAINT client_contracted_system_client_id_fkey FOREIGN KEY (client_id) REFERENCES admin.client(id);


-- Name: client_contracted_system client_contracted_system_product_system_id_fkey; Type: FK CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.client_contracted_system
    ADD CONSTRAINT client_contracted_system_product_system_id_fkey FOREIGN KEY (product_system_id) REFERENCES admin.product_system(id);


-- Name: client_environment_config client_environment_config_client_id_fkey; Type: FK CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.client_environment_config
    ADD CONSTRAINT client_environment_config_client_id_fkey FOREIGN KEY (client_id) REFERENCES admin.client(id);


-- Name: client_payment client_payment_client_id_fkey; Type: FK CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.client_payment
    ADD CONSTRAINT client_payment_client_id_fkey FOREIGN KEY (client_id) REFERENCES admin.client(id);


-- Name: client_subscription client_subscription_client_id_fkey; Type: FK CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.client_subscription
    ADD CONSTRAINT client_subscription_client_id_fkey FOREIGN KEY (client_id) REFERENCES admin.client(id);


-- Name: client_user client_user_client_id_fkey; Type: FK CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.client_user
    ADD CONSTRAINT client_user_client_id_fkey FOREIGN KEY (client_id) REFERENCES admin.client(id);


-- Name: refresh_token refresh_token_user_id_fkey; Type: FK CONSTRAINT; Schema: admin; Owner: -

ALTER TABLE ONLY admin.refresh_token
    ADD CONSTRAINT refresh_token_user_id_fkey FOREIGN KEY (user_id) REFERENCES admin.admin_user(id);
