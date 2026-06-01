ALTER TABLE admission_process
    ADD COLUMN photo_object_id UUID;

ALTER TABLE collaborator
    ADD COLUMN photo_object_id UUID;

COMMENT ON COLUMN admission_process.photo_object_id IS 'Referência ao storage_object (foto do colaborador no processo)';
COMMENT ON COLUMN collaborator.photo_object_id IS 'Referência ao storage_object (foto de perfil do colaborador)';
