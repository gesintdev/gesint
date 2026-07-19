-- Alinha o catalogo comercial com o rail Contabilidade (CTB) do HR.

INSERT INTO admin.product_system (id, status, code, key, name, description, default_price, with_ai_available, sort_order, created_at)
SELECT
    'a1111111-1111-1111-1111-111111111103',
    'ACTIVE',
    3,
    'CTB',
    'Contabilidade',
    'Sistema de Contabilidade (folha e relacionados)',
    NULL,
    false,
    30,
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM admin.product_system WHERE key = 'CTB' AND status <> 'DELETED'
);
