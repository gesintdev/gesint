-- Catalogo comercial dos sistemas Gommo (DP, RH, ...) e vinculo nos contratos do cliente.

CREATE TABLE admin.product_system (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status              public.status_enum NOT NULL DEFAULT 'ACTIVE',
    code                INTEGER NOT NULL,
    key                 VARCHAR(32) NOT NULL,
    name                VARCHAR(150) NOT NULL,
    description         TEXT,
    default_price       NUMERIC(12, 2),
    with_ai_available   BOOLEAN NOT NULL DEFAULT false,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    notes               TEXT,
    created_by          UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,
    updated_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX uk_product_system_code ON admin.product_system (code);
CREATE UNIQUE INDEX uk_product_system_key
    ON admin.product_system (key)
    WHERE status != 'DELETED';
CREATE INDEX idx_product_system_sort ON admin.product_system (sort_order);

INSERT INTO admin.product_system (id, status, code, key, name, description, default_price, with_ai_available, sort_order, created_at)
VALUES
    (
        'a1111111-1111-1111-1111-111111111101',
        'ACTIVE',
        1,
        'DP',
        'Departamento Pessoal',
        'Sistema de Departamento Pessoal',
        NULL,
        false,
        10,
        now()
    ),
    (
        'a1111111-1111-1111-1111-111111111102',
        'ACTIVE',
        2,
        'RH',
        'Recursos Humanos',
        'Sistema de Recursos Humanos',
        NULL,
        false,
        20,
        now()
    );

ALTER TABLE admin.client_contracted_system
    ADD COLUMN IF NOT EXISTS product_system_id UUID REFERENCES admin.product_system(id);

UPDATE admin.client_contracted_system c
SET product_system_id = p.id
FROM admin.product_system p
WHERE c.product_system_id IS NULL
  AND (
      upper(c.name) = p.key
      OR c.name ILIKE p.name
      OR (p.key = 'DP' AND (c.name ILIKE '%departamento pessoal%' OR c.module_name ILIKE '%DP%'))
      OR (p.key = 'RH' AND (c.name ILIKE '%recursos humanos%' OR c.module_name ILIKE '%RH%'))
  );

UPDATE admin.client_contracted_system
SET product_system_id = 'a1111111-1111-1111-1111-111111111101'
WHERE product_system_id IS NULL;

ALTER TABLE admin.client_contracted_system
    ALTER COLUMN product_system_id SET NOT NULL;

CREATE INDEX idx_client_contracted_system_product
    ON admin.client_contracted_system (product_system_id);

CREATE UNIQUE INDEX uk_client_contracted_system_client_product
    ON admin.client_contracted_system (client_id, product_system_id)
    WHERE status != 'DELETED';

COMMENT ON TABLE admin.product_system IS 'Catalogo dos sistemas Gommo disponiveis para contratacao';
COMMENT ON COLUMN admin.product_system.key IS 'Codigo estavel do sistema (DP, RH, CTB, ...)';
COMMENT ON COLUMN admin.client_contracted_system.product_system_id IS 'Sistema do catalogo vinculado ao contrato do cliente';
