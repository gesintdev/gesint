-- A matriz e o proprio cadastro do cliente (admin.client), nao uma linha de client_branch.
--
-- O modelo anterior pedia que a matriz fosse redigitada na aba Filiais, o que duplicava o CNPJ que
-- ja estava em Dados Basicos e fazia um cliente de estabelecimento unico parecer ter uma filial.
-- Agora client_branch guarda somente as filhas da matriz.

-- Linhas criadas sob a semantica antiga que na verdade eram a matriz: o CNPJ e o mesmo do cliente.
DELETE FROM admin.client_branch b
USING admin.client c
WHERE b.client_id = c.id
  AND regexp_replace(COALESCE(c.document, ''), '\D', '', 'g') = b.cnpj;

DROP INDEX IF EXISTS admin.uk_client_branch_headquarters;

ALTER TABLE admin.client_branch DROP COLUMN IF EXISTS is_headquarters;
