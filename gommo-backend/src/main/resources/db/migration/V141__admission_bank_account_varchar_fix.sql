-- V139 tentou ADD bank_account VARCHAR, mas V86 já tinha bank_account JSONB (S-2200).
-- Renomeia o JSONB legado e cria a coluna varchar da pré-admissão.

DO $fix_bank_account$
DECLARE
    col_type text;
BEGIN
    SELECT c.data_type INTO col_type
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'admission_process'
      AND c.column_name = 'bank_account';

    IF col_type = 'jsonb' THEN
        ALTER TABLE public.admission_process RENAME COLUMN bank_account TO bank_account_esocial;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'admission_process'
          AND column_name = 'bank_account'
    ) THEN
        ALTER TABLE public.admission_process ADD COLUMN bank_account VARCHAR(30);
    END IF;
END
$fix_bank_account$;

DO $sync_v141$
DECLARE
    target_schema text;
    col_type text;
BEGIN
    FOR target_schema IN
        SELECT n.nspname
        FROM pg_namespace n
        WHERE n.nspname NOT IN ('public', 'admin', 'gommo_types', 'information_schema')
          AND n.nspname NOT LIKE 'pg\_%' ESCAPE '\'
          AND to_regclass(format('%I.admission_process', n.nspname)) IS NOT NULL
        ORDER BY 1
    LOOP
        EXECUTE format(
            $sql$
            SELECT c.data_type
            FROM information_schema.columns c
            WHERE c.table_schema = %L
              AND c.table_name = 'admission_process'
              AND c.column_name = 'bank_account'
            $sql$,
            target_schema)
            INTO col_type;

        IF col_type = 'jsonb' THEN
            EXECUTE format(
                'ALTER TABLE %I.admission_process RENAME COLUMN bank_account TO bank_account_esocial',
                target_schema);
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = target_schema
              AND table_name = 'admission_process'
              AND column_name = 'bank_account'
        ) THEN
            EXECUTE format(
                'ALTER TABLE %I.admission_process ADD COLUMN bank_account VARCHAR(30)',
                target_schema);
        END IF;
    END LOOP;
END
$sync_v141$;

SELECT public.gommo_audit_sync_table('admission_process');
