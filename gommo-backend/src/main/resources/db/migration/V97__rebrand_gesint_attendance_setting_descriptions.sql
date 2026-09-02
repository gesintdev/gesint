-- Atualiza descricoes visiveis nas configuracoes de ponto (rebrand Gommo -> Gesint).
UPDATE system_setting
SET description = 'Exige selfie no registro de ponto pelo Gesint Tick'
WHERE setting_key = 'ATTENDANCE_REQUIRE_PHOTO'
  AND status != 'DELETED'
  AND description = 'Exige selfie no registro de ponto pelo Gommo Tick';

UPDATE system_setting
SET description = 'Exige localizacao no registro de ponto pelo Gesint Tick'
WHERE setting_key = 'ATTENDANCE_REQUIRE_LOCATION'
  AND status != 'DELETED'
  AND description = 'Exige localizacao no registro de ponto pelo Gommo Tick';
