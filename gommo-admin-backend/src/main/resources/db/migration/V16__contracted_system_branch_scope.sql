-- Escopo de filial nos sistemas contratados.
--
-- O contrato continua unico por cliente: valores, descontos e vencimentos nao se repetem por
-- filial. A filial define apenas onde o sistema esta habilitado, e por isso o escopo vive numa
-- tabela de associacao em vez de virar uma segunda linha de contrato.
--
-- branch_mode = 'ALL' significa todas as filiais, inclusive as cadastradas no futuro. E o default,
-- entao todo contrato ja existente mantem exatamente o comportamento atual.

ALTER TABLE admin.client_contracted_system
    ADD COLUMN IF NOT EXISTS branch_mode VARCHAR(16) NOT NULL DEFAULT 'ALL';

-- Filiais habilitadas quando branch_mode = 'SELECTED'. client_branch_id nulo representa a matriz,
-- que nao tem linha em admin.client_branch por ser o proprio cadastro do cliente.
CREATE TABLE IF NOT EXISTS admin.client_contracted_system_branch (
    contracted_system_id UUID NOT NULL REFERENCES admin.client_contracted_system(id) ON DELETE CASCADE,
    client_branch_id     UUID REFERENCES admin.client_branch(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_contracted_system_branch_contract
    ON admin.client_contracted_system_branch (contracted_system_id);

-- COALESCE porque nulo (matriz) nao e comparado por igualdade num indice unico comum.
CREATE UNIQUE INDEX IF NOT EXISTS uk_contracted_system_branch
    ON admin.client_contracted_system_branch (
        contracted_system_id,
        COALESCE(client_branch_id, '00000000-0000-0000-0000-000000000000'::uuid)
    );

-- Elo entre a matriz e a company correspondente no schema do tenant. As filiais ja tinham o seu em
-- admin.client_branch.tenant_company_id; sem este, nao ha como resolver o escopo da matriz na
-- leitura feita pelo login.
ALTER TABLE admin.client ADD COLUMN IF NOT EXISTS tenant_company_id UUID;
