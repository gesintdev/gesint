-- Gestao de Ponto (GP) como produto comercial contratavel pelo cliente.
INSERT INTO admin.product_system (id, status, code, key, name, description, default_price, with_ai_available, sort_order, created_at)
SELECT 'a1111111-1111-1111-1111-111111111104'::uuid,
       'ACTIVE',
       COALESCE((SELECT MAX(code) FROM admin.product_system), 0) + 1,
       'GP',
       'Gestão de Ponto',
       'Controle de jornada, banco de horas, espelho de ponto e alertas legais',
       NULL,
       false,
       40,
       now()
WHERE NOT EXISTS (SELECT 1 FROM admin.product_system WHERE key = 'GP');
