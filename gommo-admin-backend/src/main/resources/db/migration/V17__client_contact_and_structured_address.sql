-- Contatos tipados (EMAIL/PHONE) e endereco estruturado na matriz do cliente.

ALTER TABLE admin.client
    ADD COLUMN IF NOT EXISTS street VARCHAR(200),
    ADD COLUMN IF NOT EXISTS number VARCHAR(20),
    ADD COLUMN IF NOT EXISTS complement VARCHAR(100),
    ADD COLUMN IF NOT EXISTS district VARCHAR(100),
    ADD COLUMN IF NOT EXISTS city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS state_code VARCHAR(2),
    ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10);

-- Melhor esforco: texto livre antigo vira logradouro.
UPDATE admin.client
SET street = LEFT(TRIM(address), 200)
WHERE address IS NOT NULL
  AND TRIM(address) <> ''
  AND (street IS NULL OR TRIM(street) = '');

CREATE TABLE IF NOT EXISTS admin.client_contact (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status      gommo_types.status_enum NOT NULL DEFAULT 'ACTIVE',
    code        INTEGER,
    client_id   UUID NOT NULL REFERENCES admin.client(id),
    type        VARCHAR(16) NOT NULL,
    value       VARCHAR(200) NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_by  UUID,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by  UUID,
    updated_at  TIMESTAMPTZ,
    CONSTRAINT ck_client_contact_type CHECK (type IN ('EMAIL', 'PHONE'))
);

CREATE INDEX IF NOT EXISTS idx_client_contact_client ON admin.client_contact (client_id);

-- Migra email legado.
INSERT INTO admin.client_contact (id, status, client_id, type, value, sort_order, created_at)
SELECT gen_random_uuid(),
       'ACTIVE',
       c.id,
       'EMAIL',
       LEFT(TRIM(c.contact_email), 200),
       0,
       now()
FROM admin.client c
WHERE c.contact_email IS NOT NULL
  AND TRIM(c.contact_email) <> ''
  AND NOT EXISTS (
      SELECT 1
      FROM admin.client_contact cc
      WHERE cc.client_id = c.id
        AND cc.type = 'EMAIL'
        AND cc.status <> 'DELETED'
  );

-- Migra telefones legados (separados por /, ; ou ,).
INSERT INTO admin.client_contact (id, status, client_id, type, value, sort_order, created_at)
SELECT gen_random_uuid(),
       'ACTIVE',
       s.client_id,
       'PHONE',
       LEFT(s.phone, 200),
       s.sort_order,
       now()
FROM (
    SELECT c.id AS client_id,
           TRIM(part) AS phone,
           (ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY ordinality))::integer AS sort_order
    FROM admin.client c
    CROSS JOIN LATERAL unnest(regexp_split_to_array(COALESCE(c.contact_phone, ''), '[/;,]'))
        WITH ORDINALITY AS u(part, ordinality)
    WHERE c.contact_phone IS NOT NULL
      AND TRIM(c.contact_phone) <> ''
) s
WHERE s.phone <> '';

-- Codigo sequencial obrigatorio (padrao BaseEntity).
UPDATE admin.client_contact t
SET code = s.rn
FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
    FROM admin.client_contact
) s
WHERE t.id = s.id
  AND t.code IS NULL;

ALTER TABLE admin.client_contact
    ALTER COLUMN code SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_client_contact_code ON admin.client_contact (code);

ALTER TABLE admin.client
    DROP COLUMN IF EXISTS contact_email,
    DROP COLUMN IF EXISTS contact_phone,
    DROP COLUMN IF EXISTS address;

COMMENT ON TABLE admin.client_contact IS 'Contatos do cliente (EMAIL ou PHONE) vinculados aos Dados Basicos.';
COMMENT ON COLUMN admin.client.street IS 'Logradouro da matriz';
COMMENT ON COLUMN admin.client.state_code IS 'UF da matriz (2 letras)';
COMMENT ON COLUMN admin.client.zip_code IS 'CEP da matriz';
