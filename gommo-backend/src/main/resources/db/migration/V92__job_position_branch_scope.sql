-- Cargos passam a suportar escopo por filial (company_id nulo = todas as filiais).
-- Schema public (template). Tenants ja provisionados: V93 espelha a coluna nos tenant_*.

ALTER TABLE job_position
    ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company (id);

CREATE INDEX IF NOT EXISTS idx_job_position_company
    ON job_position (company_id)
    WHERE status <> 'DELETED';
