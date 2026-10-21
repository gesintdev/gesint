-- Preparacao do evento eSocial S-2220 (sem transmissao real nesta fase).

CREATE TYPE gesint_types.esocial_transmission_status_enum AS ENUM (
    'PENDING',
    'GENERATED',
    'TRANSMITTED',
    'REJECTED'
);

CREATE TABLE IF NOT EXISTS esocial_health_event (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                    INTEGER NOT NULL UNIQUE,
    status                  gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    occupational_exam_id    UUID NOT NULL REFERENCES occupational_exam (id),
    event_type              VARCHAR(10) NOT NULL DEFAULT 'S-2220',
    layout_version          VARCHAR(10) NOT NULL DEFAULT 'S-1.3',
    payload_json            JSONB,
    protocol_number         VARCHAR(60),
    receipt_number          VARCHAR(60),
    transmission_status     gesint_types.esocial_transmission_status_enum NOT NULL DEFAULT 'PENDING',
    transmission_deadline   DATE,
    errors                  TEXT,
    created_by              UUID,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by              UUID,
    updated_at              TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_esocial_health_event_exam
    ON esocial_health_event (occupational_exam_id)
    WHERE status != 'DELETED';

CREATE INDEX IF NOT EXISTS idx_esocial_health_event_status_deadline
    ON esocial_health_event (transmission_status, transmission_deadline)
    WHERE status != 'DELETED';

DO $sync_esocial_health_event$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.esocial_health_event', target_schema)) IS NULL
           AND to_regclass('public.esocial_health_event') IS NOT NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.esocial_health_event (LIKE public.esocial_health_event INCLUDING ALL)',
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_esocial_health_event$;
