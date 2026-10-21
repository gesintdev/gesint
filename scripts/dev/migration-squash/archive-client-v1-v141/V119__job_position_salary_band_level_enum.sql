-- Converte nivel da faixa do cargo para enum I/II/III e remove sort_order.

DO $create_salary_level_enum$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'gesint_types'
          AND t.typname = 'job_position_salary_level_enum'
    ) THEN
        CREATE TYPE gesint_types.job_position_salary_level_enum AS ENUM ('I', 'II', 'III');
    END IF;
END
$create_salary_level_enum$;

ALTER TABLE job_position_salary_band
    ADD COLUMN IF NOT EXISTS level gesint_types.job_position_salary_level_enum;

UPDATE job_position_salary_band
SET level = CASE upper(trim(level_name))
    WHEN 'I' THEN 'I'::gesint_types.job_position_salary_level_enum
    WHEN 'II' THEN 'II'::gesint_types.job_position_salary_level_enum
    WHEN 'III' THEN 'III'::gesint_types.job_position_salary_level_enum
    WHEN '1' THEN 'I'::gesint_types.job_position_salary_level_enum
    WHEN '2' THEN 'II'::gesint_types.job_position_salary_level_enum
    WHEN '3' THEN 'III'::gesint_types.job_position_salary_level_enum
    ELSE 'I'::gesint_types.job_position_salary_level_enum
END
WHERE level IS NULL;

ALTER TABLE job_position_salary_band
    ALTER COLUMN level SET NOT NULL;

DROP INDEX IF EXISTS idx_job_position_salary_band_position;

ALTER TABLE job_position_salary_band
    DROP COLUMN IF EXISTS level_name,
    DROP COLUMN IF EXISTS sort_order;

CREATE INDEX IF NOT EXISTS idx_job_position_salary_band_position
    ON job_position_salary_band (job_position_id, level, valid_from)
    WHERE status <> 'DELETED';

DO $sync_job_position_salary_band_level$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gesint_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.job_position_salary_band', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        EXECUTE format(
            'ALTER TABLE %I.job_position_salary_band ADD COLUMN IF NOT EXISTS level gesint_types.job_position_salary_level_enum',
            target_schema
        );

        -- So atualiza se level_name ainda existir nesta schema.
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = target_schema
              AND table_name = 'job_position_salary_band'
              AND column_name = 'level_name'
        ) THEN
            EXECUTE format(
                $sql$
                UPDATE %I.job_position_salary_band
                SET level = CASE upper(trim(level_name))
                    WHEN 'I' THEN 'I'::gesint_types.job_position_salary_level_enum
                    WHEN 'II' THEN 'II'::gesint_types.job_position_salary_level_enum
                    WHEN 'III' THEN 'III'::gesint_types.job_position_salary_level_enum
                    WHEN '1' THEN 'I'::gesint_types.job_position_salary_level_enum
                    WHEN '2' THEN 'II'::gesint_types.job_position_salary_level_enum
                    WHEN '3' THEN 'III'::gesint_types.job_position_salary_level_enum
                    ELSE 'I'::gesint_types.job_position_salary_level_enum
                END
                WHERE level IS NULL
                $sql$,
                target_schema
            );
        END IF;

        EXECUTE format(
            'ALTER TABLE %I.job_position_salary_band ALTER COLUMN level SET NOT NULL',
            target_schema
        );

        EXECUTE format(
            'DROP INDEX IF EXISTS %I.idx_job_position_salary_band_position',
            target_schema
        );

        EXECUTE format(
            'ALTER TABLE %I.job_position_salary_band DROP COLUMN IF EXISTS level_name, DROP COLUMN IF EXISTS sort_order',
            target_schema
        );

        EXECUTE format(
            $sql$
            CREATE INDEX IF NOT EXISTS idx_job_position_salary_band_position
                ON %I.job_position_salary_band (job_position_id, level, valid_from)
                WHERE status <> 'DELETED'
            $sql$,
            target_schema
        );
    END LOOP;
END
$sync_job_position_salary_band_level$;
