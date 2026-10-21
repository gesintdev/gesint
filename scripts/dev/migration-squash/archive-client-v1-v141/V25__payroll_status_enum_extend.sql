-- Novos valores do fluxo de competencia (usar antes de UPDATE na V26)

ALTER TYPE payroll_status_enum ADD VALUE IF NOT EXISTS 'OPEN';
ALTER TYPE payroll_status_enum ADD VALUE IF NOT EXISTS 'PROCESSED';
ALTER TYPE payroll_status_enum ADD VALUE IF NOT EXISTS 'REVIEWED';
