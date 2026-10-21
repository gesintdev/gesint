-- Ligacao medico ocupacional x clinicas (1 medico : N clinicas via tabela de vinculo).
-- Migra clinic_id legado e remove a coluna unica.

CREATE TABLE IF NOT EXISTS occupational_physician_clinic (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    physician_id    UUID NOT NULL REFERENCES occupational_physician (id),
    clinic_id       UUID NOT NULL REFERENCES medical_clinic (id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_occupational_physician_clinic UNIQUE (physician_id, clinic_id)
);

CREATE INDEX IF NOT EXISTS idx_occupational_physician_clinic_physician
    ON occupational_physician_clinic (physician_id);

CREATE INDEX IF NOT EXISTS idx_occupational_physician_clinic_clinic
    ON occupational_physician_clinic (clinic_id);

INSERT INTO occupational_physician_clinic (physician_id, clinic_id)
SELECT p.id, p.clinic_id
FROM occupational_physician p
WHERE p.clinic_id IS NOT NULL
ON CONFLICT (physician_id, clinic_id) DO NOTHING;

ALTER TABLE occupational_physician DROP COLUMN IF EXISTS clinic_id;

DO $sync_physician_clinic$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.occupational_physician_clinic', target_schema)) IS NULL
           AND to_regclass('public.occupational_physician_clinic') IS NOT NULL THEN
            EXECUTE format(
                'CREATE TABLE %I.occupational_physician_clinic (LIKE public.occupational_physician_clinic INCLUDING ALL)',
                target_schema
            );
        END IF;

        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = target_schema
              AND table_name = 'occupational_physician'
              AND column_name = 'clinic_id'
        ) THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.occupational_physician_clinic (physician_id, clinic_id)
                SELECT p.id, p.clinic_id
                FROM %I.occupational_physician p
                WHERE p.clinic_id IS NOT NULL
                ON CONFLICT (physician_id, clinic_id) DO NOTHING
                $sql$,
                target_schema,
                target_schema
            );
            EXECUTE format(
                'ALTER TABLE %I.occupational_physician DROP COLUMN IF EXISTS clinic_id',
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_physician_clinic$;
