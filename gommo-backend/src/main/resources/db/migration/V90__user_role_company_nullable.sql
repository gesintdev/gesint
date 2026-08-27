-- V89 colocou company_id na chave primaria de user_role e a marcou NOT NULL, mas o modelo de
-- acesso usa filial nula justamente para o vinculo que vale em todas as filiais (admin de
-- plataforma e o seed inicial do tenant). Com a coluna na chave, dois problemas apareciam: o
-- Postgres recusava o insert com filial nula e o JPA devolvia entidade nula ao ler essas linhas,
-- porque um componente da chave composta vinha nulo.
--
-- A tabela passa a ter chave propria, e a regra de "um perfil por usuario por filial" vira um
-- indice unico com COALESCE, que compara o nulo por igualdade.

ALTER TABLE user_role DROP CONSTRAINT IF EXISTS user_role_pkey;

ALTER TABLE user_role ALTER COLUMN company_id DROP NOT NULL;

ALTER TABLE user_role ADD COLUMN IF NOT EXISTS id UUID;

UPDATE user_role SET id = gen_random_uuid() WHERE id IS NULL;

ALTER TABLE user_role ALTER COLUMN id SET NOT NULL;
ALTER TABLE user_role ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE user_role ADD PRIMARY KEY (id);

CREATE UNIQUE INDEX IF NOT EXISTS uk_user_role_user_role_company
    ON user_role (user_id, role_id, COALESCE(company_id, '00000000-0000-0000-0000-000000000000'::uuid));
