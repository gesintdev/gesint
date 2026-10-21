-- Destino da compensacao ao aprovar ponto fora da escala (banco de horas x hora extra).
ALTER TABLE attendance_request
    ADD COLUMN IF NOT EXISTS compensation_type VARCHAR(40);
