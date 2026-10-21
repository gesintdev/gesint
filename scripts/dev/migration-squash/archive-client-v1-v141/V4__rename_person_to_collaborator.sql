-- Renomeia domínio Person para Colaborador (tabela, FK, permissões)

ALTER TABLE person RENAME TO collaborator;

ALTER INDEX idx_person_cpf RENAME TO idx_collaborator_cpf;
ALTER INDEX idx_person_status RENAME TO idx_collaborator_status;
ALTER INDEX idx_person_full_name RENAME TO idx_collaborator_full_name;

ALTER TABLE app_user RENAME COLUMN person_id TO collaborator_id;

UPDATE permission
SET code = 'collaborator:read',
    module = 'collaborator',
    description = 'Listar colaboradores'
WHERE code = 'person:read';

UPDATE permission
SET code = 'collaborator:write',
    module = 'collaborator',
    description = 'Criar e editar colaboradores'
WHERE code = 'person:write';

UPDATE permission
SET code = 'collaborator:delete',
    module = 'collaborator',
    description = 'Excluir colaboradores (soft)'
WHERE code = 'person:delete';
