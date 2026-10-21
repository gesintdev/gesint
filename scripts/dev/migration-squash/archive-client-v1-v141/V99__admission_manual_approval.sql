-- Aprovacao manual na esteira: permite concluir a admissao mesmo com etapas pendentes.
ALTER TABLE admission_process
    ADD COLUMN IF NOT EXISTS manually_approved_at TIMESTAMPTZ NULL,
    ADD COLUMN IF NOT EXISTS manually_approved_by UUID NULL;
