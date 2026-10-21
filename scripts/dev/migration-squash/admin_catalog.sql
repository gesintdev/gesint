--
-- PostgreSQL database dump
--

\restrict 2zME49ZqvShYkIeeogpOSPdXirId1vTY1TF9zZHehyA45PcBQdEmQy4yobsmPrW

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

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

--
-- Data for Name: client; Type: TABLE DATA; Schema: admin; Owner: -
--

INSERT INTO admin.client (id, status, name, slug, document, notes, created_by, created_at, updated_by, updated_at, code, mobile_login_code, legal_name, tenant_company_id, street, number, complement, district, city, state_code, zip_code) VALUES ('baa953c7-d6b4-4954-97f5-971350696bd1', 'ACTIVE', 'Public', 'public', NULL, NULL, NULL, '2026-10-21 16:55:58.436454+00', NULL, '2026-10-21 16:55:58.436454+00', 1, '000000000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: client_environment_config; Type: TABLE DATA; Schema: admin; Owner: -
--

INSERT INTO admin.client_environment_config (id, status, code, client_id, routing_mode, subdomain, custom_domain, database_strategy, database_host, database_port, database_name, database_schema, database_user, database_secret_ref, provisioning_status, provisioning_notes, created_by, created_at, updated_by, updated_at) VALUES ('82923606-329f-4461-a5cf-a499c39bf61f', 'ACTIVE', 1, 'baa953c7-d6b4-4954-97f5-971350696bd1', 'SUBDOMAIN', NULL, NULL, 'DEDICATED_DATABASE', NULL, NULL, NULL, 'public', NULL, NULL, 'READY', NULL, NULL, '2026-10-21 16:55:58.53132+00', NULL, NULL);


--
-- Data for Name: product_system; Type: TABLE DATA; Schema: admin; Owner: -
--

INSERT INTO admin.product_system (id, status, code, key, name, description, default_price, with_ai_available, sort_order, notes, created_by, created_at, updated_by, updated_at) VALUES ('a1111111-1111-1111-1111-111111111101', 'ACTIVE', 1, 'DP', 'Departamento Pessoal', 'Sistema de Departamento Pessoal', NULL, false, 10, NULL, NULL, '2026-10-21 16:55:58.848445+00', NULL, NULL);
INSERT INTO admin.product_system (id, status, code, key, name, description, default_price, with_ai_available, sort_order, notes, created_by, created_at, updated_by, updated_at) VALUES ('a1111111-1111-1111-1111-111111111102', 'ACTIVE', 2, 'RH', 'Recursos Humanos', 'Sistema de Recursos Humanos', NULL, false, 20, NULL, NULL, '2026-10-21 16:55:58.848445+00', NULL, NULL);
INSERT INTO admin.product_system (id, status, code, key, name, description, default_price, with_ai_available, sort_order, notes, created_by, created_at, updated_by, updated_at) VALUES ('a1111111-1111-1111-1111-111111111103', 'ACTIVE', 3, 'CTB', 'Contabilidade', 'Sistema de Contabilidade (folha e relacionados)', NULL, false, 30, NULL, NULL, '2026-10-21 16:55:59.004448+00', NULL, NULL);


--
-- PostgreSQL database dump complete
--

\unrestrict 2zME49ZqvShYkIeeogpOSPdXirId1vTY1TF9zZHehyA45PcBQdEmQy4yobsmPrW

