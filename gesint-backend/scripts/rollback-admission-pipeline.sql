-- =====================================================================================
-- Desfaz as migrations V86, V87 e V88 (esteira de admissao + unaccent nos tenants).
--
-- QUANDO USAR
--   Somente se a esteira de admissao precisar ser revertida em producao. O `git revert`
--   do merge desfaz o codigo, mas nao o schema: este script e a contraparte no banco.
--
-- COMO USAR
--   Rode o arquivo INTEIRO, como script unico, conectado ao banco alvo. E uma transacao
--   so: se qualquer passo falhar, nada e aplicado.
--
-- O QUE E DESTRUTIVO
--   As tabelas admission_step e esocial_event sao removidas com os dados. As colunas
--   novas de admission_process tambem. Nada disso existia antes da V86, entao a perda se
--   limita ao que a propria esteira produziu.
--
-- A SECAO DA V88 E OPCIONAL E ESTA COMENTADA POR PADRAO
--   gesint_types.unaccent conserta a busca global nos schemas de tenant e nao tem relacao
--   com a esteira. Reverter a V88 quebra a busca global de novo. Descomente apenas se a
--   intencao for voltar o banco ao estado exato da V85.
-- =====================================================================================

BEGIN;

-- ---------------------------------------------------------------------------------
-- V86 / V87 nos schemas de tenant
-- ---------------------------------------------------------------------------------
DO $rollback_admission_pipeline$
DECLARE
    target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        EXECUTE format('DROP TABLE IF EXISTS %I.admission_step', target_schema);
        EXECUTE format('DROP TABLE IF EXISTS %I.esocial_event', target_schema);

        IF to_regclass(format('%I.admission_process', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                ALTER TABLE %I.admission_process
                    DROP COLUMN IF EXISTS blocked_reason,
                    DROP COLUMN IF EXISTS race_color,
                    DROP COLUMN IF EXISTS education_level,
                    DROP COLUMN IF EXISTS birth_city_id,
                    DROP COLUMN IF EXISTS birth_country,
                    DROP COLUMN IF EXISTS disability_info,
                    DROP COLUMN IF EXISTS worker_category,
                    DROP COLUMN IF EXISTS activity_nature,
                    DROP COLUMN IF EXISTS establishment_id,
                    DROP COLUMN IF EXISTS union_cnpj,
                    DROP COLUMN IF EXISTS bank_account
                $sql$,
                target_schema
            );
        END IF;

        -- A permissao sai antes do vinculo por causa da FK.
        IF to_regclass(format('%I.role_permission', target_schema)) IS NOT NULL
           AND to_regclass(format('%I.permission', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                DELETE FROM %I.role_permission rp
                USING %I.permission p
                WHERE p.id = rp.permission_id AND p.authority = 'admission:pipeline'
                $sql$,
                target_schema,
                target_schema
            );
            EXECUTE format(
                'DELETE FROM %I.permission WHERE authority = ''admission:pipeline''',
                target_schema
            );
        END IF;
    END LOOP;
END
$rollback_admission_pipeline$;

-- ---------------------------------------------------------------------------------
-- V86 / V87 no schema public
-- ---------------------------------------------------------------------------------
DROP TABLE IF EXISTS admission_step;
DROP TABLE IF EXISTS esocial_event;

ALTER TABLE admission_process
    DROP COLUMN IF EXISTS blocked_reason,
    DROP COLUMN IF EXISTS race_color,
    DROP COLUMN IF EXISTS education_level,
    DROP COLUMN IF EXISTS birth_city_id,
    DROP COLUMN IF EXISTS birth_country,
    DROP COLUMN IF EXISTS disability_info,
    DROP COLUMN IF EXISTS worker_category,
    DROP COLUMN IF EXISTS activity_nature,
    DROP COLUMN IF EXISTS establishment_id,
    DROP COLUMN IF EXISTS union_cnpj,
    DROP COLUMN IF EXISTS bank_account;

DELETE FROM role_permission rp
USING permission p
WHERE p.id = rp.permission_id AND p.authority = 'admission:pipeline';

DELETE FROM permission WHERE authority = 'admission:pipeline';

-- Os enums so podem cair depois das tabelas que os usam.
DROP TYPE IF EXISTS gesint_types.admission_step_key_enum;
DROP TYPE IF EXISTS gesint_types.admission_step_status_enum;
DROP TYPE IF EXISTS gesint_types.esocial_event_type_enum;
DROP TYPE IF EXISTS gesint_types.esocial_event_status_enum;

-- ---------------------------------------------------------------------------------
-- V88 (opcional -- ver o cabecalho antes de descomentar)
-- ---------------------------------------------------------------------------------
-- DROP FUNCTION IF EXISTS gesint_types.unaccent(text);

-- ---------------------------------------------------------------------------------
-- Historico do Flyway
--
-- Sem isso o Flyway acusa checksum/estado inconsistente no proximo start. Ajuste a
-- lista se a V88 tiver sido mantida.
-- ---------------------------------------------------------------------------------
DELETE FROM flyway_schema_history WHERE version IN ('86', '87', '88');

COMMIT;
