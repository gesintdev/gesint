-- Nome opcional na matriz + seed completo Tabela 27 (eSocial).
ALTER TABLE exam_requirement ADD COLUMN IF NOT EXISTS name VARCHAR(200);

DO $sync_exam_req_name$
DECLARE target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = target_schema AND table_name = 'exam_requirement')
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = target_schema AND table_name = 'exam_requirement' AND column_name = 'name') THEN
            EXECUTE format('ALTER TABLE %I.exam_requirement ADD COLUMN name VARCHAR(200)', target_schema);
        END IF;
    END LOOP;
END
$sync_exam_req_name$;

-- Upsert Tabela 27 oficial (~1453 procedimentos).
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1, 'ACTIVE', '0001', '1,1-dicloro-2,2-bis (P-clorofeniletileno)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 2, 'ACTIVE', '0002', '1,1,1-tricloroetano', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 3, 'ACTIVE', '0003', '1,2 dihidroxi-4-(N-acetilcisteinil)-butano', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 4, 'ACTIVE', '0004', '1,25-dihidroxi vitamina D', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 5, 'ACTIVE', '0005', '1,2-ciclo-hexanediol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 6, 'ACTIVE', '0006', '1,2-dibromo-3-cloropropano', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 7, 'ACTIVE', '0007', '1,2-diclorobenzeno', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 8, 'ACTIVE', '0008', '1,2-gliceril dinitrato', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 9, 'ACTIVE', '0009', '1,3-gliceril dinitrato', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 10, 'ACTIVE', '0010', '1,5-diaminonaftaleno', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1398, 'ACTIVE', '1398', '11-desoxicorticosterona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1399, 'ACTIVE', '1399', '17-alfa-hidroxiprogesterona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 11, 'ACTIVE', '0011', '17-cetogênicos (17-CGS)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 12, 'ACTIVE', '0012', '17-cetosteroides', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 13, 'ACTIVE', '0013', '17-cetosteroides relação alfa/beta', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 14, 'ACTIVE', '0014', '17-cetosteroides totais (17-CTS)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 15, 'ACTIVE', '0015', '17-hidroxicorticosteroides (17-OHS)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 16, 'ACTIVE', '0016', '17-hidroxipregnenolona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 17, 'ACTIVE', '0017', '1-etoxi-2-propanol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 18, 'ACTIVE', '0018', '1-hidroxipireno', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 19, 'ACTIVE', '0019', '1-metoxi-2-propanol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 20, 'ACTIVE', '0020', '1-naftol + 2-naftol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 21, 'ACTIVE', '0021', '2-amino-4-nitrofenol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 22, 'ACTIVE', '0022', '2,2''-dicloro-4,4''metileno dianilina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 23, 'ACTIVE', '0023', '2,2-dimetil-1,3benzodioxol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 24, 'ACTIVE', '0024', '2,4-dinitroaminotolueno', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 25, 'ACTIVE', '0025', '2,4-hidroxibifenil', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 26, 'ACTIVE', '0026', '2,5-diclorofenol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 27, 'ACTIVE', '0027', '2,5-heptanediona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 28, 'ACTIVE', '0028', '2,5-hexanediona + 4,5-dihidroxi-2-hexanona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 29, 'ACTIVE', '0029', '2,5-hexanodiona urinária', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 30, 'ACTIVE', '0030', '2,6-dinitroaminotolueno', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 31, 'ACTIVE', '0031', '2-butanona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 32, 'ACTIVE', '0032', '2-dimetilamino-4-hidroxi-5,6-dimetilpirimidina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 33, 'ACTIVE', '0033', '2-etil, 5-hidroxi-hexil-ftalato', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 34, 'ACTIVE', '0034', '2-etil-5-oxi-hexil-ftalato', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 35, 'ACTIVE', '0035', '2-etilfenol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 36, 'ACTIVE', '0036', '2-fenil 2-propanol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 37, 'ACTIVE', '0037', '2-isopropoxifenol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 38, 'ACTIVE', '0038', '2-metilamino-4-hidroxi-5,6-dimetilpirimidina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 39, 'ACTIVE', '0039', '2-metilpentano sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 40, 'ACTIVE', '0040', '2-naftilamina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 41, 'ACTIVE', '0041', '3,4-diclorocatecol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 42, 'ACTIVE', '0042', '3-alfa androstanediol glucoronídeo (3-ALFADIOL)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 43, 'ACTIVE', '0043', '3-hidroxibenzopireno', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 44, 'ACTIVE', '0044', '3-hidroxicarbofurano urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 45, 'ACTIVE', '0045', '3-metil histidina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 46, 'ACTIVE', '0046', '3-metil pentano sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 47, 'ACTIVE', '0047', '4,4-diaminodiciclohexil metano (DDHM)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 49, 'ACTIVE', '0049', '4,4-diaminodifenilmetano', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 50, 'ACTIVE', '0050', '4,4''-metileno bis-2-cloroanilina (MbOCA)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 48, 'ACTIVE', '0048', '4,4''-metilenodianilina (MDA)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 51, 'ACTIVE', '0051', '4,5-diclorocatecol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 52, 'ACTIVE', '0052', '4,6-dinitro-o-cresol (DNOC) sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 53, 'ACTIVE', '0053', '4-amino-2,6-dinitrotolueno', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 54, 'ACTIVE', '0054', '4-amino-2-nitrofenol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 55, 'ACTIVE', '0055', '4-amino-bifenil', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 56, 'ACTIVE', '0056', '4-clorocatecol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 57, 'ACTIVE', '0057', '4-cloro-o-toluidina (derivados)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 58, 'ACTIVE', '0058', '4-etilfenol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 59, 'ACTIVE', '0059', '4-metilpentan-2-ona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 60, 'ACTIVE', '0060', '5,6-dimetil-2-(metilamino)pirimidin-4-ol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 61, 'ACTIVE', '0061', '5-hidroximetil-pirrolidona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 62, 'ACTIVE', '0062', '5-hydroxi-N-metilpirrolidona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 63, 'ACTIVE', '0063', '5-nucleotidase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 64, 'ACTIVE', '0064', 'Aberrações cromossômicas (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 65, 'ACTIVE', '0065', 'Absidia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 66, 'ACTIVE', '0066', 'Acanthamoeba (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 67, 'ACTIVE', '0067', 'Acetaminofen', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 68, 'ACTIVE', '0068', 'Acetilcolinesterase eritrocitária', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 69, 'ACTIVE', '0069', 'Acetilcolinesterase plasmática', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 70, 'ACTIVE', '0070', 'Acetona sanguínea', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 71, 'ACTIVE', '0071', 'Acetona urinária', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 72, 'ACTIVE', '0072', 'Acidez titulável na urina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 74, 'ACTIVE', '0074', 'Ácido 2,4,5-triclorofenoxiacético (2,4,5-T) urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 75, 'ACTIVE', '0075', 'Ácido 2,4-diclorofenoxiacético (2,4-D) urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 73, 'ACTIVE', '0073', 'Ácido 2,4-dinitrobenzoico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 76, 'ACTIVE', '0076', 'Ácido 2-hidroxi-3-butenil mercaptúrico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 77, 'ACTIVE', '0077', 'Ácido 2-hidroxipropil mercaptúrico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 78, 'ACTIVE', '0078', 'Ácido 2-tiotiazolidina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 79, 'ACTIVE', '0079', 'Ácido 2-tiotiazolidina-4-carboxílico (TTCA)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 80, 'ACTIVE', '0080', 'Ácido 3,4-dihidroxibutil mercaptúrico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 81, 'ACTIVE', '0081', 'Ácido 3-fenoxibenzoico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 82, 'ACTIVE', '0082', 'Ácido 3-hidroxipropil mercaptúrico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 83, 'ACTIVE', '0083', 'Ácido 4-cloro-2-metilfenoxiacético (MCPA) urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 84, 'ACTIVE', '0084', 'Ácido 4-fluoro-3-fenoxibenzoico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 85, 'ACTIVE', '0085', 'Ácido 5 hidróxi-indolacético', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 86, 'ACTIVE', '0086', 'Ácido acético', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 87, 'ACTIVE', '0087', 'Ácido ascórbico (vitamina C)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 88, 'ACTIVE', '0088', 'Ácido beta hidroxi-butírico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 89, 'ACTIVE', '0089', 'Ácido butoxi-acético', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 90, 'ACTIVE', '0090', 'Ácido cacodílico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 91, 'ACTIVE', '0091', 'Ácido cis- 3-(2,2-diclorovinil)-2,2-dimetilciclopropanocarboxilico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 92, 'ACTIVE', '0092', 'Ácido cis-3-(2,2-dibromovinil)-2,2-dimetilciclopropanocarboxilico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 93, 'ACTIVE', '0093', 'Ácido cítrico na urina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 94, 'ACTIVE', '0094', 'Ácido dehidroabiético', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 95, 'ACTIVE', '0095', 'Ácido delta aminolevulínico (ALA-U)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 96, 'ACTIVE', '0096', 'Ácido delta aminolevulínico desidratase (ALA-D)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 97, 'ACTIVE', '0097', 'Ácido d-glucárico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 98, 'ACTIVE', '0098', 'Ácido dimetilarsínico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 99, 'ACTIVE', '0099', 'Ácido dimetilbenzoico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 100, 'ACTIVE', '0100', 'Ácido etoxiacético', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 101, 'ACTIVE', '0101', 'Ácido fenilfosfórico urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 102, 'ACTIVE', '0102', 'Ácido fenilglioxílico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 103, 'ACTIVE', '0103', 'Ácido fenil-mercaptúrico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 104, 'ACTIVE', '0104', 'Ácido fólico eritrocitário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 105, 'ACTIVE', '0105', 'Ácido fórmico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 106, 'ACTIVE', '0106', 'Ácido furoico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 107, 'ACTIVE', '0107', 'Ácido glioxílico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 108, 'ACTIVE', '0108', 'Ácido hidroxietil-mercaptúrico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 109, 'ACTIVE', '0109', 'Ácido hipúrico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 110, 'ACTIVE', '0110', 'Ácido homo vanílico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 111, 'ACTIVE', '0111', 'Ácido homogentísico urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 112, 'ACTIVE', '0112', 'Ácido láctico (lactato)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 113, 'ACTIVE', '0113', 'Ácido mandélico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 114, 'ACTIVE', '0114', 'Ácido mercaptúrico acrilamida', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 115, 'ACTIVE', '0115', 'Ácido metil malônico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 116, 'ACTIVE', '0116', 'Ácido metilhipúrico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 117, 'ACTIVE', '0117', 'Ácido metoxiacético (2-metoxiacético)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 118, 'ACTIVE', '0118', 'Ácido metoxi-propiônico (ácido isobutírico)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 119, 'ACTIVE', '0119', 'Ácido monometilarsônico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 120, 'ACTIVE', '0120', 'Ácido orótico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 121, 'ACTIVE', '0121', 'Ácido oxálico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 122, 'ACTIVE', '0122', 'Ácido perfluorooctanoico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 123, 'ACTIVE', '0123', 'Ácido perfluorooctanossulfônico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 124, 'ACTIVE', '0124', 'Ácido pirúvico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 125, 'ACTIVE', '0125', 'Ácido S-(3-cloro-2-hidroxipropil) mercaptúrico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 126, 'ACTIVE', '0126', 'Ácido S(n-Propil)mercaptúrico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 127, 'ACTIVE', '0127', 'Ácido salicílico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 128, 'ACTIVE', '0128', 'Ácido siálico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 129, 'ACTIVE', '0129', 'Ácido tioglicólico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 130, 'ACTIVE', '0130', 'Ácido trans, trans-mucônico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 131, 'ACTIVE', '0131', 'Ácido trans-3-(2,2-diclorovinil)-2,2-dimetilciclopropanocarboxilico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 132, 'ACTIVE', '0132', 'Ácido trans-crisantemum-dicarboxilico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 133, 'ACTIVE', '0133', 'Ácido tricloroacético', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 134, 'ACTIVE', '0134', 'Ácido trifluoroacético', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 135, 'ACTIVE', '0135', 'Ácido úrico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 136, 'ACTIVE', '0136', 'Ácido valproico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 137, 'ACTIVE', '0137', 'Ácido vanilmandélico (VMA)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 138, 'ACTIVE', '0138', 'Ácido ß-hidroxietoxi acético', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1400, 'ACTIVE', '1400', 'Ácidos biliares', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 139, 'ACTIVE', '0139', 'Ácidos graxos livres', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 140, 'ACTIVE', '0140', 'Ácidos orgânicos (perfil quantitativo)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 141, 'ACTIVE', '0141', 'Acilcarnitinas (perfil qualitativo)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1401, 'ACTIVE', '1401', 'Acilcarnitinas (perfil quantitativo)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 142, 'ACTIVE', '0142', 'Actinobacillus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 143, 'ACTIVE', '0143', 'Actinomadura (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 144, 'ACTIVE', '0144', 'Actinomyces (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 145, 'ACTIVE', '0145', 'Adenilatoquinase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 146, 'ACTIVE', '0146', 'Adenovírus - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 147, 'ACTIVE', '0147', 'Adenovírus - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 148, 'ACTIVE', '0148', 'Adrenocorticotrófico, hormônio (ACTH)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 149, 'ACTIVE', '0149', 'Adutos de DNA (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 150, 'ACTIVE', '0150', 'Adutos de proteínas (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 151, 'ACTIVE', '0151', 'Aflatoxinas (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 152, 'ACTIVE', '0152', 'Agente da doença crônica emaciante (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 153, 'ACTIVE', '0153', 'Agente da doença de Creutzfeldt-Jakob esporádica (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 154, 'ACTIVE', '0154', 'Agente da doença de Creutzfeldt-Jakob familiar (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 155, 'ACTIVE', '0155', 'Agente da doença de Creutzfeldt-Jakob iatrogênica (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 156, 'ACTIVE', '0156', 'Agente da doença de Creutzfeldt-Jakob variante (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 157, 'ACTIVE', '0157', 'Agente da encefalopatia espongiforme bovina (BSE) (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 158, 'ACTIVE', '0158', 'Agente da encefalopatia espongiforme bovina tipo-H (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 159, 'ACTIVE', '0159', 'Agente da encefalopatia espongiforme em ungulados exóticos (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 160, 'ACTIVE', '0160', 'Agente da encefalopatia espongiforme felina (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 161, 'ACTIVE', '0161', 'Agente da insônia fatal esporádica (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 162, 'ACTIVE', '0162', 'Agente da insônia fatal familiar de Gerstmann-Sträussler-Scheinker (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 163, 'ACTIVE', '0163', 'Agente da Kuru (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 164, 'ACTIVE', '0164', 'Agente da prionopatia variante protease-resistente (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 165, 'ACTIVE', '0165', 'Agente do tremor epizoótico (scrapie disease) (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 166, 'ACTIVE', '0166', 'Agente do tremor epizoótico (scrapie disease) atípico (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 167, 'ACTIVE', '0167', 'Ajellomyces (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 168, 'ACTIVE', '0168', 'Albumina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 169, 'ACTIVE', '0169', 'Albumina S-metilcisteína', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 170, 'ACTIVE', '0170', 'Alcaligenes (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 171, 'ACTIVE', '0171', 'Alcaptonúria', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 172, 'ACTIVE', '0172', 'Aldolase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 173, 'ACTIVE', '0173', 'Aldosterona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 174, 'ACTIVE', '0174', 'Alérgenos - Perfil antigênico (painel C/36 antígenos)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 176, 'ACTIVE', '0176', 'Alfa-1-antitripsina, dosagem no soro', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 177, 'ACTIVE', '0177', 'Alfa-1-glicoproteína ácida', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 175, 'ACTIVE', '0175', 'Alfa-1-microglobulina na urina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 178, 'ACTIVE', '0178', 'Alfa-2-antiplasmina, teste funcional', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 179, 'ACTIVE', '0179', 'Alfa-2-macroglobulina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 180, 'ACTIVE', '0180', 'Alfa-amilase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 181, 'ACTIVE', '0181', 'Alfa-fetoproteína', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 182, 'ACTIVE', '0182', 'Alfa-hexaclorociclo-hexano', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 183, 'ACTIVE', '0183', 'Alumínio plasmático', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 184, 'ACTIVE', '0184', 'Alumínio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 185, 'ACTIVE', '0185', 'Amebíase - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 186, 'ACTIVE', '0186', 'Amebíase - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 187, 'ACTIVE', '0187', 'Amilase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 188, 'ACTIVE', '0188', 'Aminoácidos, fracionamento e quantificação', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 189, 'ACTIVE', '0189', 'Amiodarona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 190, 'ACTIVE', '0190', 'Amitriptilina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 191, 'ACTIVE', '0191', 'Amônia', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 192, 'ACTIVE', '0192', 'AMP cíclico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 193, 'ACTIVE', '0193', 'Ancylostoma (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 194, 'ACTIVE', '0194', 'Androstenediona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 195, 'ACTIVE', '0195', 'Anfetaminas', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 196, 'ACTIVE', '0196', 'Angiostrongylus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 197, 'ACTIVE', '0197', 'Anilina sanguínea', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 198, 'ACTIVE', '0198', 'Anilina urinária', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 199, 'ACTIVE', '0199', 'Anilina-hemoglobina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 200, 'ACTIVE', '0200', 'Anisakis (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 201, 'ACTIVE', '0201', 'Anti-12-hidroxi-endrin urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 202, 'ACTIVE', '0202', 'Anti-actina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 203, 'ACTIVE', '0203', 'Antibiograma', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 204, 'ACTIVE', '0204', 'Antibióticos, dosagem no soro', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 205, 'ACTIVE', '0205', 'Anticandida - IgG e IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 206, 'ACTIVE', '0206', 'Anticardiolipina - IgA', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 207, 'ACTIVE', '0207', 'Anticardiolipina - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 208, 'ACTIVE', '0208', 'Anticardiolipina - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 209, 'ACTIVE', '0209', 'Anticentrômero', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 210, 'ACTIVE', '0210', 'Anticoagulante lúpico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 211, 'ACTIVE', '0211', 'Anticorpo anti A e B', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 212, 'ACTIVE', '0212', 'Anticorpo anti saccharamyces - ASCA', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 213, 'ACTIVE', '0213', 'Anticorpo anti-DNAse B', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 214, 'ACTIVE', '0214', 'Anticorpo anti-hormônio do crescimento', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 215, 'ACTIVE', '0215', 'Anticorpo antimieloperoxidase, MPO', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 216, 'ACTIVE', '0216', 'Anticorpo anti-receptor de TSH (TRAB)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 217, 'ACTIVE', '0217', 'Anticorpo antivírus da hepatite E', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 218, 'ACTIVE', '0218', 'Anticorpos antiendomisio - IgG, IgM, IgA', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 219, 'ACTIVE', '0219', 'Anticorpos anti-ilhota de langherans', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 220, 'ACTIVE', '0220', 'Anticorpos anti-influenza A - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 221, 'ACTIVE', '0221', 'Anticorpos anti-influenza A - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 222, 'ACTIVE', '0222', 'Anticorpos anti-influenza B - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 223, 'ACTIVE', '0223', 'Anticorpos anti-influenza B - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 224, 'ACTIVE', '0224', 'Anticorpos antiinsulina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 225, 'ACTIVE', '0225', 'Anticorpos antiplaquetários, citometria de fluxo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 226, 'ACTIVE', '0226', 'Anticorpos antitireoide (tireoglobulina)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 227, 'ACTIVE', '0227', 'Anticorpos irregulares', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1402, 'ACTIVE', '1402', 'Anticorpos naturais - Isoaglutininas', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 228, 'ACTIVE', '0228', 'Anticortex supra-renal', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 229, 'ACTIVE', '0229', 'Antidesoxiribonuclease B', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 230, 'ACTIVE', '0230', 'Anti-DMP', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 231, 'ACTIVE', '0231', 'Anti-DNA', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 232, 'ACTIVE', '0232', 'Antiescleroderma', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 233, 'ACTIVE', '0233', 'Antifígado', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 235, 'ACTIVE', '0235', 'Antígeno carcinoembriogênico (CEA)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 236, 'ACTIVE', '0236', 'Antígeno de diferenciação celular', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 237, 'ACTIVE', '0237', 'Antígeno específico prostático livre (PSA livre)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 238, 'ACTIVE', '0238', 'Antígeno específico prostático total (PSA)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 239, 'ACTIVE', '0239', 'Antígenos fúngicos, pesquisa', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 240, 'ACTIVE', '0240', 'Antígenos metílicos solúveis do BCG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 241, 'ACTIVE', '0241', 'Antigliadina (glúten) - IgA', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 242, 'ACTIVE', '0242', 'Antigliadina (glúten) - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 243, 'ACTIVE', '0243', 'Antigliadina (glúten) - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 244, 'ACTIVE', '0244', 'Anti-hialuronidase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 245, 'ACTIVE', '0245', 'Anti-JO1', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 246, 'ACTIVE', '0246', 'Anti-LA/SSB', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 247, 'ACTIVE', '0247', 'Anti-LKM-1', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 248, 'ACTIVE', '0248', 'Antimembrana basal', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 249, 'ACTIVE', '0249', 'Antimicrossomal', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 250, 'ACTIVE', '0250', 'Antimitocondria', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 251, 'ACTIVE', '0251', 'Antimitocondria, M2', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 252, 'ACTIVE', '0252', 'Antimônio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 253, 'ACTIVE', '0253', 'Antimúsculo cardíaco', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 254, 'ACTIVE', '0254', 'Antimúsculo estriado', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 255, 'ACTIVE', '0255', 'Antimúsculo liso', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 256, 'ACTIVE', '0256', 'Antineutrófilos (anca) C', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 257, 'ACTIVE', '0257', 'Antineutrófilos (anca) P', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 258, 'ACTIVE', '0258', 'Antiparietal', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 259, 'ACTIVE', '0259', 'Antiperoxidase tireoideana', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 260, 'ACTIVE', '0260', 'Anti-RNP', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 261, 'ACTIVE', '0261', 'Anti-Ro/SSA', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 262, 'ACTIVE', '0262', 'Anti-Sm', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 263, 'ACTIVE', '0263', 'Anti-TPO', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 264, 'ACTIVE', '0264', 'Antitrombina III', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 265, 'ACTIVE', '0265', 'Antrax (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 266, 'ACTIVE', '0266', 'Apolipoproteína A (Apo A)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 267, 'ACTIVE', '0267', 'Apolipoproteína B (Apo B)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 268, 'ACTIVE', '0268', 'Apolipoproteína E', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 270, 'ACTIVE', '0270', 'Arcanobacterium (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 271, 'ACTIVE', '0271', 'Arsênico +III urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 272, 'ACTIVE', '0272', 'Arsênico +V urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 273, 'ACTIVE', '0273', 'Arsênico capilar', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 274, 'ACTIVE', '0274', 'Arsênico inorgânico urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1433, 'ACTIVE', '1433', 'Arsênico sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 275, 'ACTIVE', '0275', 'Arsênio - Metabólitos metilados urinários', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 276, 'ACTIVE', '0276', 'Ascaris (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 277, 'ACTIVE', '0277', 'Aslo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 278, 'ACTIVE', '0278', 'Aspergillus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 279, 'ACTIVE', '0279', 'Aspergilus, reação sorológica', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 280, 'ACTIVE', '0280', 'Ativador tissular de plasminogênio (TPA)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 282, 'ACTIVE', '0282', 'Audiometria de tronco cerebral (PEA) BERA', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 283, 'ACTIVE', '0283', 'Audiometria tonal limiar com testes de discriminação', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 281, 'ACTIVE', '0281', 'Audiometria tonal ocupacional', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 284, 'ACTIVE', '0284', 'Audiometria vocal - Pesquisa de limiar de discriminação', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 285, 'ACTIVE', '0285', 'Audiometria vocal - Pesquisa de limiar de inteligibilidade', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 286, 'ACTIVE', '0286', 'Avaliação clínica com ênfase cardiocirculatória (anamnese e exame físico)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 287, 'ACTIVE', '0287', 'Avaliação clínica com ênfase dermatológica (anamnese e exame físico)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 288, 'ACTIVE', '0288', 'Avaliação clínica com ênfase gastrointestinal (anamnese e exame físico)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 289, 'ACTIVE', '0289', 'Avaliação clínica com ênfase mental (anamnese e exame físico)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 290, 'ACTIVE', '0290', 'Avaliação clínica com ênfase neurológca (anamnese e exame físico)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 291, 'ACTIVE', '0291', 'Avaliação clínica com ênfase neurossensorial (anamnese e exame físico)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 292, 'ACTIVE', '0292', 'Avaliação clínica com ênfase ortopédica (anamnese e exame físico)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 293, 'ACTIVE', '0293', 'Avaliação clínica com ênfase respiratória (anamnese e exame físico)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 294, 'ACTIVE', '0294', 'Avaliação clínica com ênfase urogenital (anamnese e exame físico)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 295, 'ACTIVE', '0295', 'Avaliação clínica ocupacional (anamnese e exame físico)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 296, 'ACTIVE', '0296', 'Avaliação da acuidade visual', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 297, 'ACTIVE', '0297', 'Avaliação da estereopsia', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 298, 'ACTIVE', '0298', 'Avaliação da visão de cores', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 299, 'ACTIVE', '0299', 'Avaliação do campo visual', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 300, 'ACTIVE', '0300', 'Avaliação psicossocial', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 301, 'ACTIVE', '0301', 'Azida sódica, teste da', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 302, 'ACTIVE', '0302', 'B.A.A.R. (Ziehl ou fluorescência)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 303, 'ACTIVE', '0303', 'Babesia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 304, 'ACTIVE', '0304', 'Bacillus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 305, 'ACTIVE', '0305', 'Bacterioscopia', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 306, 'ACTIVE', '0306', 'Bacteroides (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 307, 'ACTIVE', '0307', 'Balantidium (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 308, 'ACTIVE', '0308', 'Barbitúricos, antidepressivos tricíclicos', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 309, 'ACTIVE', '0309', 'Bário urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 310, 'ACTIVE', '0310', 'Bartituratos', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 311, 'ACTIVE', '0311', 'Bartonella (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 312, 'ACTIVE', '0312', 'Benzeno urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 313, 'ACTIVE', '0313', 'Benzidina eritrocitária', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 314, 'ACTIVE', '0314', 'Benzidina urinária', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 315, 'ACTIVE', '0315', 'Benzodiazepínicos e similares', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1434, 'ACTIVE', '1434', 'Berílio sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 316, 'ACTIVE', '0316', 'Berílio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 317, 'ACTIVE', '0317', 'Beta mercapto-lactato-disulfidúria', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 318, 'ACTIVE', '0318', 'Beta-2-microglobulina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 319, 'ACTIVE', '0319', 'Beta-glicuronidase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 320, 'ACTIVE', '0320', 'Beta-hexaclorociclo-hexano', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 321, 'ACTIVE', '0321', 'Bilirrubinas (direta, indireta e total)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 322, 'ACTIVE', '0322', 'Biotinidase atividade', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 323, 'ACTIVE', '0323', 'Bisfenol A (4,4-isopropiledenedifenol)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 324, 'ACTIVE', '0324', 'Bismuto plasmático', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 325, 'ACTIVE', '0325', 'Bismuto urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 326, 'ACTIVE', '0326', 'Blastocystis (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 327, 'ACTIVE', '0327', 'Blastomicose, reação sorológica', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 328, 'ACTIVE', '0328', 'Blastomyces (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 329, 'ACTIVE', '0329', 'Bocavírus humano (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 330, 'ACTIVE', '0330', 'Boro', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 331, 'ACTIVE', '0331', 'Borrelia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 332, 'ACTIVE', '0332', 'Brachispira (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 333, 'ACTIVE', '0333', 'Brometo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 334, 'ACTIVE', '0334', 'Bromofós sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 335, 'ACTIVE', '0335', 'Bromofós urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 336, 'ACTIVE', '0336', 'Brucela - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 337, 'ACTIVE', '0337', 'Brucela - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 338, 'ACTIVE', '0338', 'Brucela, prova rápida', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 339, 'ACTIVE', '0339', 'Brucella (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 340, 'ACTIVE', '0340', 'Brugia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 341, 'ACTIVE', '0341', 'Bunyavírus germiston (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 342, 'ACTIVE', '0342', 'Burkholderia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 343, 'ACTIVE', '0343', 'Buta-2-ona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 344, 'ACTIVE', '0344', 'Butanol sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1429, 'ACTIVE', '1429', 'Butilcolinesterase no plasma ou soro', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 345, 'ACTIVE', '0345', 'C1q', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 346, 'ACTIVE', '0346', 'C3 proativador', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 347, 'ACTIVE', '0347', 'C3A (fator B)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 348, 'ACTIVE', '0348', 'CA 50', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 349, 'ACTIVE', '0349', 'CA-242', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 350, 'ACTIVE', '0350', 'CA-27-29', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 351, 'ACTIVE', '0351', 'Cádmio sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 352, 'ACTIVE', '0352', 'Cádmio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 353, 'ACTIVE', '0353', 'Cálcio', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 354, 'ACTIVE', '0354', 'Cálcio iônico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1435, 'ACTIVE', '1435', 'Cálcio sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1436, 'ACTIVE', '1436', 'Cálcio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 355, 'ACTIVE', '0355', 'Calcitonina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 356, 'ACTIVE', '0356', 'Campylobacter (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 357, 'ACTIVE', '0357', 'Campylobacter (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 358, 'ACTIVE', '0358', 'Candida (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 359, 'ACTIVE', '0359', 'Capacidade de fixação de ferro', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 360, 'ACTIVE', '0360', 'Capillaria (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 362, 'ACTIVE', '0362', 'Carbamazepina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 361, 'ACTIVE', '0361', 'Carbendazim', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 363, 'ACTIVE', '0363', 'Carbofuranfenol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 364, 'ACTIVE', '0364', 'Carboxihemoglobina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 365, 'ACTIVE', '0365', 'Cardiobacterium (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 366, 'ACTIVE', '0366', 'Carnitina livre', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 367, 'ACTIVE', '0367', 'Carnitina total e frações', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 368, 'ACTIVE', '0368', 'Caroteno', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 369, 'ACTIVE', '0369', 'Catecolaminas', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 370, 'ACTIVE', '0370', 'Catecolaminas fracionadas - Dopamina, epinefrina, norepinefrina na urina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 371, 'ACTIVE', '0371', 'Caxumba - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 372, 'ACTIVE', '0372', 'Caxumba - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 373, 'ACTIVE', '0373', 'CEE vírus, pesquisa', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 374, 'ACTIVE', '0374', 'Células LE', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 375, 'ACTIVE', '0375', 'Ceruloplasmina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 376, 'ACTIVE', '0376', 'Césio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 377, 'ACTIVE', '0377', 'Chagas - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 378, 'ACTIVE', '0378', 'Chagas - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 379, 'ACTIVE', '0379', 'Chlamydia - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 380, 'ACTIVE', '0380', 'Chlamydia - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 381, 'ACTIVE', '0381', 'Chlamydia, cultura', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 382, 'ACTIVE', '0382', 'Chlamydophila (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 383, 'ACTIVE', '0383', 'Chlormequat', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 384, 'ACTIVE', '0384', 'Chumbo dietila', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 385, 'ACTIVE', '0385', 'Chumbo sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 386, 'ACTIVE', '0386', 'Chumbo total', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 387, 'ACTIVE', '0387', 'Chumbo urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 388, 'ACTIVE', '0388', 'Cianeto (cianureto) sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 389, 'ACTIVE', '0389', 'Ciclofosfamida', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 390, 'ACTIVE', '0390', 'Ciclo-hexanodiol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 391, 'ACTIVE', '0391', 'Ciclo-hexanol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 392, 'ACTIVE', '0392', 'Ciclosporina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 393, 'ACTIVE', '0393', 'Cisticercose, AC', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 394, 'ACTIVE', '0394', 'Cistinúria', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 395, 'ACTIVE', '0395', 'cis-d4 tetrahidroftalimida (THPI)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 396, 'ACTIVE', '0396', 'Citomegalovírus - shell vial', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 397, 'ACTIVE', '0397', 'Citomegalovírus - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 398, 'ACTIVE', '0398', 'Citomegalovírus - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1437, 'ACTIVE', '1437', 'Citopatologia', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 399, 'ACTIVE', '0399', 'Cladophialophora (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 400, 'ACTIVE', '0400', 'Cladosporium (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 401, 'ACTIVE', '0401', 'Clamídia, pesquisa', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 402, 'ACTIVE', '0402', 'Clearance de ácido úrico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 403, 'ACTIVE', '0403', 'Clearance de creatinina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 404, 'ACTIVE', '0404', 'Clearance de fosfato', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 405, 'ACTIVE', '0405', 'Clearance de ureia', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 406, 'ACTIVE', '0406', 'Clearance osmolar', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 407, 'ACTIVE', '0407', 'Clomipramina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 408, 'ACTIVE', '0408', 'Clonorchis (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 409, 'ACTIVE', '0409', 'Cloreto de metileno sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 410, 'ACTIVE', '0410', 'Cloro', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 411, 'ACTIVE', '0411', 'Clorofenol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 412, 'ACTIVE', '0412', 'Clorofórmio', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 413, 'ACTIVE', '0413', 'Clostridium (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 414, 'ACTIVE', '0414', 'Clostridium difficile, toxina A', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 415, 'ACTIVE', '0415', 'Coagulograma', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 416, 'ACTIVE', '0416', 'Cobalto sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 417, 'ACTIVE', '0417', 'Cobalto urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 418, 'ACTIVE', '0418', 'Cobre sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 419, 'ACTIVE', '0419', 'Cobre urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 420, 'ACTIVE', '0420', 'Cocaína', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 421, 'ACTIVE', '0421', 'Coccidioides (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 422, 'ACTIVE', '0422', 'Cólera (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 423, 'ACTIVE', '0423', 'Colesterol (HDL)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 424, 'ACTIVE', '0424', 'Colesterol (LDL)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 425, 'ACTIVE', '0425', 'Colesterol (VLDL)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 426, 'ACTIVE', '0426', 'Colesterol total', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 427, 'ACTIVE', '0427', 'Complemento C2', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 428, 'ACTIVE', '0428', 'Complemento C3', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 429, 'ACTIVE', '0429', 'Complemento C4', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 430, 'ACTIVE', '0430', 'Complemento C5', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 431, 'ACTIVE', '0431', 'Complemento CH-100', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 432, 'ACTIVE', '0432', 'Complemento CH-50', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 433, 'ACTIVE', '0433', 'Composto S (11-desoxicortisol)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 434, 'ACTIVE', '0434', 'Consumo de protrombina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 435, 'ACTIVE', '0435', 'Contagem de eosinófilos', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 436, 'ACTIVE', '0436', 'Contagem sanguínea diferencial', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 437, 'ACTIVE', '0437', 'Contagem sedimentar de Addis', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 438, 'ACTIVE', '0438', 'Contracaecum (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 439, 'ACTIVE', '0439', 'Coombs direto', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 440, 'ACTIVE', '0440', 'Coombs indireto', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 441, 'ACTIVE', '0441', 'Coprológico funcional (caracteres, pH, digestibilidade, amônia, ácidos orgânicos e interpretação)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 442, 'ACTIVE', '0442', 'Coproporfirina III na urina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 443, 'ACTIVE', '0443', 'Coproporfirinas', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 444, 'ACTIVE', '0444', 'Coronavírus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 445, 'ACTIVE', '0445', 'Coronavírus humano 229E (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 446, 'ACTIVE', '0446', 'Coronavírus relacionado à MERS (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 447, 'ACTIVE', '0447', 'Coronavírus relacionado à SARS (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1419, 'ACTIVE', '1419', 'Coronavírus/COVID-19 - SARS-CoV-2 - IgA', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1420, 'ACTIVE', '1420', 'Coronavírus/COVID-19 - SARS-CoV-2 - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1421, 'ACTIVE', '1421', 'Coronavírus/COVID-19 - SARS-CoV-2 - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1422, 'ACTIVE', '1422', 'Coronavírus/COVID-19 - SARS-CoV-2 - Pesquisa de antígeno', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1423, 'ACTIVE', '1423', 'Coronavírus/COVID-19 - SARS-CoV-2 - RT-PCR', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 448, 'ACTIVE', '0448', 'Corpos cetônicos na urina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 449, 'ACTIVE', '0449', 'Corpúsculos de Donovani', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 450, 'ACTIVE', '0450', 'Cortisol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 451, 'ACTIVE', '0451', 'Cortisol livre', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 452, 'ACTIVE', '0452', 'Corynebacterium (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 453, 'ACTIVE', '0453', 'Cotinina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 454, 'ACTIVE', '0454', 'Coxiella (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 455, 'ACTIVE', '0455', 'Creatina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 456, 'ACTIVE', '0456', 'Creatinina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 457, 'ACTIVE', '0457', 'Creatino fosfoquinase - Fração MB', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 458, 'ACTIVE', '0458', 'Creatino fosfoquinase total (CK)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 459, 'ACTIVE', '0459', 'Cresol urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 460, 'ACTIVE', '0460', 'Crioaglutinina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 461, 'ACTIVE', '0461', 'Crioglobulinas', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 462, 'ACTIVE', '0462', 'Criptococo (tinta da China), pesquisa de', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 463, 'ACTIVE', '0463', 'Cromatografia de açúcares na urina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 464, 'ACTIVE', '0464', 'Cromatografia de aminoácidos', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 465, 'ACTIVE', '0465', 'Cromo eritrocitário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 466, 'ACTIVE', '0466', 'Cromo sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 467, 'ACTIVE', '0467', 'Cromo urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 468, 'ACTIVE', '0468', 'Cromossomo philadelfia', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 469, 'ACTIVE', '0469', 'Cryptococcus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 470, 'ACTIVE', '0470', 'Cryptosporidium (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 471, 'ACTIVE', '0471', 'Cultura bacteriana', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1403, 'ACTIVE', '1403', 'Cultura de urina (urocultura)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 472, 'ACTIVE', '0472', 'Cultura nas fezes: salmonela, shigellae e E. coli enteropatogênicas, enteroinvasora (sorol. incluída) + campylobacter SP. + E. coli enterohemorrágica', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 473, 'ACTIVE', '0473', 'Cultura para bactérias anaeróbicas', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 474, 'ACTIVE', '0474', 'Cultura para Criptosporidium', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 475, 'ACTIVE', '0475', 'Cultura para fungos', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 476, 'ACTIVE', '0476', 'Cultura para mycobacterium', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 477, 'ACTIVE', '0477', 'Cultura quantitativa de secreções pulmonares', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 478, 'ACTIVE', '0478', 'Curva glicêmica', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 479, 'ACTIVE', '0479', 'Curva insulínica', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 480, 'ACTIVE', '0480', 'Cyclospora (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 481, 'ACTIVE', '0481', 'Dehidroepiandrosterona (DHEA)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 482, 'ACTIVE', '0482', 'Dehidrotestosterona (DHT)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 483, 'ACTIVE', '0483', 'Dengue - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 484, 'ACTIVE', '0484', 'Dengue - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 485, 'ACTIVE', '0485', 'Desidrogenase alfa-hidroxibutírica', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 486, 'ACTIVE', '0486', 'Desidrogenase glutâmica', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 487, 'ACTIVE', '0487', 'Desidrogenase isocítrica', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 488, 'ACTIVE', '0488', 'Desidrogenase láctica', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 489, 'ACTIVE', '0489', 'Desipramina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 490, 'ACTIVE', '0490', 'Desoxicorticosterona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 491, 'ACTIVE', '0491', 'Dialdeído malônico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 492, 'ACTIVE', '0492', 'Diclorodifenil tricloroetano (DDT) sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 493, 'ACTIVE', '0493', 'Diclorodifenildicloroetileno (DDE) sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 494, 'ACTIVE', '0494', 'Dicloroetano', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 495, 'ACTIVE', '0495', 'Dicloroeteno', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 496, 'ACTIVE', '0496', 'Diclorometano', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 497, 'ACTIVE', '0497', 'Dicrocoelium (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 498, 'ACTIVE', '0498', 'Dieldrin sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 499, 'ACTIVE', '0499', 'Dientamoeba (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 500, 'ACTIVE', '0500', 'Dietilditiofosfato', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 501, 'ACTIVE', '0501', 'Dietilditiofosfato urinário (DEDTP)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 502, 'ACTIVE', '0502', 'Dietilestilbestrol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 503, 'ACTIVE', '0503', 'Dietilfosfato', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 504, 'ACTIVE', '0504', 'Dietilfosfato urinário (DEP)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 505, 'ACTIVE', '0505', 'Dietilltiofosfato urinário (DETP)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 506, 'ACTIVE', '0506', 'Dietiltiofosfato', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 507, 'ACTIVE', '0507', 'Digitoxina ou digoxina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 508, 'ACTIVE', '0508', 'Dímero D', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 509, 'ACTIVE', '0509', 'Dimetilditiofosfato', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 510, 'ACTIVE', '0510', 'Dimetilditiofosfato urinário (DMDTP)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 511, 'ACTIVE', '0511', 'Dimetilfosfato', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 512, 'ACTIVE', '0512', 'Dimetilfosfato urinário (DMP)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 513, 'ACTIVE', '0513', 'Dimetil-selênio respiratório (ar expirado)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 514, 'ACTIVE', '0514', 'Dimetiltiofosfato', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 515, 'ACTIVE', '0515', 'Dimetiltiofosfato urinário (DMTP)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 516, 'ACTIVE', '0516', 'Di-n-butil fosfato', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 517, 'ACTIVE', '0517', 'Dinitrato-etileno-glicol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 518, 'ACTIVE', '0518', 'Dinitrofenol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 519, 'ACTIVE', '0519', 'Dinoseb', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 520, 'ACTIVE', '0520', 'Dipetalonema (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 521, 'ACTIVE', '0521', 'Diphyllobothrium (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 522, 'ACTIVE', '0522', 'Diquat urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 523, 'ACTIVE', '0523', 'Dissulfeto de carbono', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 524, 'ACTIVE', '0524', 'DNCB Teste de Contato', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 525, 'ACTIVE', '0525', 'Doppler colorido arterial de membro inferior', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 526, 'ACTIVE', '0526', 'Doppler colorido arterial de membro superior', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 527, 'ACTIVE', '0527', 'Dosagem de receptor de progesterona ou de estrogênio', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 528, 'ACTIVE', '0528', 'Dracunculus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 529, 'ACTIVE', '0529', 'Ebola (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 530, 'ACTIVE', '0530', 'ECG (Eletrocardiograma) convencional de até 12 derivações', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 531, 'ACTIVE', '0531', 'ECG (Eletrocardiograma) de alta resolução', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 532, 'ACTIVE', '0532', 'Echinococcus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 533, 'ACTIVE', '0533', 'Echovírus (painel), sorologia para', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 534, 'ACTIVE', '0534', 'Echovírus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 535, 'ACTIVE', '0535', 'Edwardsiella (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 536, 'ACTIVE', '0536', 'EEG (Eletroencefalograma) de rotina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 537, 'ACTIVE', '0537', 'Ehrlichia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 538, 'ACTIVE', '0538', 'Eikenella (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 540, 'ACTIVE', '0540', 'Eletroforese de glicoproteínas', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 541, 'ACTIVE', '0541', 'Eletroforese de lipoproteínas', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 539, 'ACTIVE', '0539', 'Eletroforese de proteínas', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 542, 'ACTIVE', '0542', 'Eletroforese de proteínas urinárias', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 543, 'ACTIVE', '0543', 'Eletroneuromiografia de MMII', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 544, 'ACTIVE', '0544', 'Eletroneuromiografia de MMSS', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 545, 'ACTIVE', '0545', 'Elizabethkingia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 546, 'ACTIVE', '0546', 'Emmonsia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 547, 'ACTIVE', '0547', 'Encefalite japonesa B (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 548, 'ACTIVE', '0548', 'Encephalitozoon (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 549, 'ACTIVE', '0549', 'Endotoxinas (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 550, 'ACTIVE', '0550', 'Endrin sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 551, 'ACTIVE', '0551', 'Enolase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 552, 'ACTIVE', '0552', 'Entamoeba (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 553, 'ACTIVE', '0553', 'Enterobacter (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 554, 'ACTIVE', '0554', 'Enterobius (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 555, 'ACTIVE', '0555', 'Enterococcus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 556, 'ACTIVE', '0556', 'Enterocytozoon (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 557, 'ACTIVE', '0557', 'Enterovírus humano A, B e C (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 558, 'ACTIVE', '0558', 'Enzima conversora da angiotensina (ECA)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 559, 'ACTIVE', '0559', 'Enzimas eritrocitárias', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 560, 'ACTIVE', '0560', 'Epidermophyton (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 561, 'ACTIVE', '0561', 'Equinococose (hidatidose), reação', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 562, 'ACTIVE', '0562', 'Ergoespirometria ou teste cardiopulmonar de exercício completo (espirometria forçada, consumo de O2, produção de CO2 e derivados, ECG, oximetria)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 563, 'ACTIVE', '0563', 'Eritropoietina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 564, 'ACTIVE', '0564', 'Erysipelothrix (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 565, 'ACTIVE', '0565', 'Escândio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 566, 'ACTIVE', '0566', 'Escherichia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 567, 'ACTIVE', '0567', 'Escherichia coli (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 568, 'ACTIVE', '0568', 'Espermograma', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 569, 'ACTIVE', '0569', 'Esplenograma (citologia)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 570, 'ACTIVE', '0570', 'Esporotricose, reação sorológica', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 571, 'ACTIVE', '0571', 'Esporotriquina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 572, 'ACTIVE', '0572', 'Estanho urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 573, 'ACTIVE', '0573', 'Estireno sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1427, 'ACTIVE', '1427', 'Estireno urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 574, 'ACTIVE', '0574', 'Estradiol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 575, 'ACTIVE', '0575', 'Estreptozima', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 576, 'ACTIVE', '0576', 'Estriol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 577, 'ACTIVE', '0577', 'Estrogênios totais (fenolesteroides)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 578, 'ACTIVE', '0578', 'Estrona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 579, 'ACTIVE', '0579', 'Estrôncio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 580, 'ACTIVE', '0580', 'Etanol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 581, 'ACTIVE', '0581', 'Etilenotioureia (ETU)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 582, 'ACTIVE', '0582', 'Etossuximida', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 583, 'ACTIVE', '0583', 'Exame a fresco de amostra biológica', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 584, 'ACTIVE', '0584', 'Exame bacteriológico de fezes', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 585, 'ACTIVE', '0585', 'Exame de fundo de olho', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1432, 'ACTIVE', '1432', 'Exame oftalmológico com avaliação de retina e/ou cristalino', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 586, 'ACTIVE', '0586', 'Exophiala (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 587, 'ACTIVE', '0587', 'Falcização, teste de', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 588, 'ACTIVE', '0588', 'Fasciola (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 589, 'ACTIVE', '0589', 'Fasciolopsis (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 590, 'ACTIVE', '0590', 'Fator 4 plaquetário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 591, 'ACTIVE', '0591', 'Fator antinúcleo (FAN)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 592, 'ACTIVE', '0592', 'Fator II', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 593, 'ACTIVE', '0593', 'Fator IX', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 594, 'ACTIVE', '0594', 'Fator reumatoide', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 595, 'ACTIVE', '0595', 'Fator V', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 597, 'ACTIVE', '0597', 'Fator VII', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 598, 'ACTIVE', '0598', 'Fator VIII', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 599, 'ACTIVE', '0599', 'Fator VIII, dosagem do antígeno (Von Willebrand)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 600, 'ACTIVE', '0600', 'Fator VIII, dosagem do inibidor', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 601, 'ACTIVE', '0601', 'Fator X', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 602, 'ACTIVE', '0602', 'Fator XI', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 603, 'ACTIVE', '0603', 'Fator XII', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 604, 'ACTIVE', '0604', 'Fator XIII', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 605, 'ACTIVE', '0605', 'Fenilalanina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 606, 'ACTIVE', '0606', 'Fenilcetonúria', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 607, 'ACTIVE', '0607', 'Fenitoína', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 608, 'ACTIVE', '0608', 'Fenobarbital', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 609, 'ACTIVE', '0609', 'Fenol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 610, 'ACTIVE', '0610', 'Fenotipagem do sistema Rh-Hr (anti Rho(D) + anti Rh(C) + anti Rh(E)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 611, 'ACTIVE', '0611', 'Fenotipagem do sistema RH-HR (D, C, E, C E C)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 612, 'ACTIVE', '0612', 'Ferritina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 613, 'ACTIVE', '0613', 'Ferro sérico (sangue)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1438, 'ACTIVE', '1438', 'Ferro urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 614, 'ACTIVE', '0614', 'Fibrinogênio, teste funcional', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 615, 'ACTIVE', '0615', 'Filária (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 616, 'ACTIVE', '0616', 'Filaria (sorologia)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 617, 'ACTIVE', '0617', 'Filobasidiella (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 618, 'ACTIVE', '0618', 'Flavobacterium (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 619, 'ACTIVE', '0619', 'Flavovírus, pesquisa', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 620, 'ACTIVE', '0620', 'Fluazifop urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 621, 'ACTIVE', '0621', 'Flufenoxuron sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 622, 'ACTIVE', '0622', 'Flúor sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 623, 'ACTIVE', '0623', 'Flúor urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 624, 'ACTIVE', '0624', 'Fluoreto urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 625, 'ACTIVE', '0625', 'Fluoribacter (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 626, 'ACTIVE', '0626', 'Folículo estimulante, hormônio (FSH)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 627, 'ACTIVE', '0627', 'Fonsecaea (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 628, 'ACTIVE', '0628', 'Formaldeído', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1439, 'ACTIVE', '1439', 'Formaldeído sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1440, 'ACTIVE', '1440', 'Formaldeído urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 629, 'ACTIVE', '0629', 'Fosfatase ácida fração prostática', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 630, 'ACTIVE', '0630', 'Fosfatase ácida total', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 631, 'ACTIVE', '0631', 'Fosfatase alcalina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 632, 'ACTIVE', '0632', 'Fosfatase alcalina fração óssea', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 633, 'ACTIVE', '0633', 'Fosfatase alcalina termo-estável', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 634, 'ACTIVE', '0634', 'Fosfina sanguínea', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 635, 'ACTIVE', '0635', 'Fosfofructoquinase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 636, 'ACTIVE', '0636', 'Fosfoglicerato quinase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 637, 'ACTIVE', '0637', 'Fosfolipídios', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 638, 'ACTIVE', '0638', 'Fósforo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 639, 'ACTIVE', '0639', 'Francisella (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1404, 'ACTIVE', '1404', 'FREI (linfogranuloma venéreo) IDeR', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 640, 'ACTIVE', '0640', 'Frutosaminas', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 641, 'ACTIVE', '0641', 'Frutose', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 642, 'ACTIVE', '0642', 'Frutosúria', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 643, 'ACTIVE', '0643', 'Fungos, pesquisa a fresco', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 644, 'ACTIVE', '0644', 'Fusarium (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 645, 'ACTIVE', '0645', 'Fusobacterium (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 646, 'ACTIVE', '0646', 'Gad-Ab-antidescarboxilase do ácido glutâmico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 647, 'ACTIVE', '0647', 'Gadolínio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 648, 'ACTIVE', '0648', 'Galactose', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 649, 'ACTIVE', '0649', 'Galactose 1-fosfatouridil transferase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 650, 'ACTIVE', '0650', 'Galactosúria', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 651, 'ACTIVE', '0651', 'Gálio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 652, 'ACTIVE', '0652', 'Gama-glutamil transferase (gama-GT)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 653, 'ACTIVE', '0653', 'Gardnerella (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 654, 'ACTIVE', '0654', 'Gastrina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 655, 'ACTIVE', '0655', 'Geotrichum (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 656, 'ACTIVE', '0656', 'Giardia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 657, 'ACTIVE', '0657', 'Giardia (sorologia)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 658, 'ACTIVE', '0658', 'Glicemia', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 659, 'ACTIVE', '0659', 'Glicemia após sobrecarga com dextrosol ou glicose', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 660, 'ACTIVE', '0660', 'Gliceraldeído, 3-fosfato desidrogenase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 661, 'ACTIVE', '0661', 'Glicose 6-fosfato desidrogenase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 662, 'ACTIVE', '0662', 'Glicose fosfato isomerase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1441, 'ACTIVE', '1441', 'Glicose urinária', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 663, 'ACTIVE', '0663', 'Glifosato', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 664, 'ACTIVE', '0664', 'Globulina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 665, 'ACTIVE', '0665', 'Globulina de ligação de hormônios sexuais (SHBG)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 666, 'ACTIVE', '0666', 'Globulina transportadora da tiroxina (TBG)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 667, 'ACTIVE', '0667', 'Glucagon', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 668, 'ACTIVE', '0668', 'Glutation', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 669, 'ACTIVE', '0669', 'Glutation peroxidase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 670, 'ACTIVE', '0670', 'Gonococo - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 671, 'ACTIVE', '0671', 'Gonococo - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 672, 'ACTIVE', '0672', 'Grupo ABO, classificação reversa', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 673, 'ACTIVE', '0673', 'Grupo sanguíneo ABO, e fator Rho (inclui Du)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 674, 'ACTIVE', '0674', 'Haemophilus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 675, 'ACTIVE', '0675', 'Háfnio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 676, 'ACTIVE', '0676', 'Ham, teste de (hemólise ácida)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 677, 'ACTIVE', '0677', 'Hansen, pesquisa de', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 678, 'ACTIVE', '0678', 'Haptoglobina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 679, 'ACTIVE', '0679', 'Heinz, corpúsculos', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 680, 'ACTIVE', '0680', 'Helicobacter (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 681, 'ACTIVE', '0681', 'Helicobacter pylori - IgA', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 682, 'ACTIVE', '0682', 'Helicobacter pylori - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 683, 'ACTIVE', '0683', 'Helicobacter pylori - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 684, 'ACTIVE', '0684', 'Hemácias fetais', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 685, 'ACTIVE', '0685', 'Hematócrito', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 686, 'ACTIVE', '0686', 'Hemocultura', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 687, 'ACTIVE', '0687', 'Hemoglobina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 688, 'ACTIVE', '0688', 'Hemoglobina (eletroforese ou HPLC)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 689, 'ACTIVE', '0689', 'Hemoglobina glicada (A1 total)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 690, 'ACTIVE', '0690', 'Hemoglobina glicada (Fração A1c)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 691, 'ACTIVE', '0691', 'Hemoglobina plasmática livre', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 692, 'ACTIVE', '0692', 'Hemoglobina, solubilidade (HbS e HbD)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 693, 'ACTIVE', '0693', 'Hemograma com contagem de plaquetas ou frações (eritrograma, leucograma, plaquetas)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 694, 'ACTIVE', '0694', 'Hemophilus (bordetella) pertussis (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 695, 'ACTIVE', '0695', 'Hemossedimentação, (VHS)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 696, 'ACTIVE', '0696', 'Hemossiderina (siderócitos), sangue', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 697, 'ACTIVE', '0697', 'Hemossiderina (siderócitos), urina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 698, 'ACTIVE', '0698', 'Heparina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 699, 'ACTIVE', '0699', 'Hepatite A - HAV - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 700, 'ACTIVE', '0700', 'Hepatite A - HAV - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 702, 'ACTIVE', '0702', 'Hepatite B - HBCAC - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 701, 'ACTIVE', '0701', 'Hepatite B - HBCAC - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 703, 'ACTIVE', '0703', 'Hepatite B - HBeAC (anti-HBE)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1405, 'ACTIVE', '1405', 'Hepatite B - HBeAG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 704, 'ACTIVE', '0704', 'Hepatite B - HBsAC (anti-HBs)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 234, 'ACTIVE', '0234', 'Hepatite B - HBsAG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 705, 'ACTIVE', '0705', 'Hepatite C - Anti-HCV - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 706, 'ACTIVE', '0706', 'Hepatite C - Anti-HCV - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 707, 'ACTIVE', '0707', 'Hepatite delta - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 708, 'ACTIVE', '0708', 'Hepatite delta - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 709, 'ACTIVE', '0709', 'Hepatite delta, antigeno', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 710, 'ACTIVE', '0710', 'Heptacloro-epóxido', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 711, 'ACTIVE', '0711', 'HER-2 - Dosagem do receptor', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 712, 'ACTIVE', '0712', 'Herpes simples - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 713, 'ACTIVE', '0713', 'Herpes simples - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 714, 'ACTIVE', '0714', 'Herpes zóster - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 715, 'ACTIVE', '0715', 'Herpes zóster - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 716, 'ACTIVE', '0716', 'Herpesvírus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 717, 'ACTIVE', '0717', 'Heterophyes (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 718, 'ACTIVE', '0718', 'Hexaclorobenzeno', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 719, 'ACTIVE', '0719', 'Hexafluoroisopropanol (HFIP)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 720, 'ACTIVE', '0720', 'Hexametilenodiamina (1,6-hexametilenodiamina)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 721, 'ACTIVE', '0721', 'Hexona (metil isobutil cetona)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 722, 'ACTIVE', '0722', 'Hexosaminidase A', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 723, 'ACTIVE', '0723', 'Hidrazina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 724, 'ACTIVE', '0724', 'Hidroxiprogesterona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 725, 'ACTIVE', '0725', 'Hidroxiprolina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 726, 'ACTIVE', '0726', 'Hipersensibilidade retardada (intradermo reação IDeR)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 727, 'ACTIVE', '0727', 'Histamina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 728, 'ACTIVE', '0728', 'Histidina na urina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 729, 'ACTIVE', '0729', 'Histona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 730, 'ACTIVE', '0730', 'Histoplasma (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 731, 'ACTIVE', '0731', 'Histoplasmose', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 732, 'ACTIVE', '0732', 'HIV - Antígeno P24', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 733, 'ACTIVE', '0733', 'HIV1 ou HIV2, pesquisa de anticorpos', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 734, 'ACTIVE', '0734', 'HLA-DR', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 735, 'ACTIVE', '0735', 'HLA-DR+DQ', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 736, 'ACTIVE', '0736', 'Homocisteína', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 737, 'ACTIVE', '0737', 'Hormônio antidiurético', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 738, 'ACTIVE', '0738', 'Hormônio do crescimento (HGH)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 739, 'ACTIVE', '0739', 'Hormônio gonodotrofico corionico', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 740, 'ACTIVE', '0740', 'Hormônio luteinizante (LH)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 741, 'ACTIVE', '0741', 'Hormônio tireoestimulante (TSH)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 742, 'ACTIVE', '0742', 'HPV (vírus do papiloma humano)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 743, 'ACTIVE', '0743', 'HTLV-I / II', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 744, 'ACTIVE', '0744', 'Hymenolepis (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 745, 'ACTIVE', '0745', 'Identificação de helmintos', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 746, 'ACTIVE', '0746', 'Ifosfamida', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 747, 'ACTIVE', '0747', 'IgA', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 748, 'ACTIVE', '0748', 'IgA na saliva', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 749, 'ACTIVE', '0749', 'IgD', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 750, 'ACTIVE', '0750', 'IgE', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 751, 'ACTIVE', '0751', 'IGF BP3 (proteína ligadora dos fatores de crescimento "insulinlike")', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 752, 'ACTIVE', '0752', 'IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 753, 'ACTIVE', '0753', 'IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 754, 'ACTIVE', '0754', 'Imipramina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 755, 'ACTIVE', '0755', 'Impedanciometria', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 756, 'ACTIVE', '0756', 'Imunocomplexos circulantes', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 757, 'ACTIVE', '0757', 'Imunocomplexos circulantes, com células Raji', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 758, 'ACTIVE', '0758', 'Imunoeletroforese (estudo da gamopatia)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 759, 'ACTIVE', '0759', 'Imunofenotipagem para doença residual mínima', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 760, 'ACTIVE', '0760', 'Imunofenotipagem para hemoglobinúria paroxistica noturna', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 761, 'ACTIVE', '0761', 'Imunofenotipagem para leucemias agudas ou sindrome mielodisplásica', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 762, 'ACTIVE', '0762', 'Imunofenotipagem para linfoma não Hodgkin / sindrome linfoproliferativa crônica', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 763, 'ACTIVE', '0763', 'Imunofenotipagem para perfil imune', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 764, 'ACTIVE', '0764', 'Imunofixação', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 765, 'ACTIVE', '0765', 'Índice de tiroxina livre (ITL)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 766, 'ACTIVE', '0766', 'Índio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 767, 'ACTIVE', '0767', 'Inibidor de C1 esterase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 768, 'ACTIVE', '0768', 'Inibidor do fator IX', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 769, 'ACTIVE', '0769', 'Inibidor do TPA (PAI)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 770, 'ACTIVE', '0770', 'Inibidor dos fatores da hemostasia', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 771, 'ACTIVE', '0771', 'Insulina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 772, 'ACTIVE', '0772', 'Iodo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 773, 'ACTIVE', '0773', 'Iodo proteico (PBI)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 774, 'ACTIVE', '0774', 'Iontoforese para a coleta de suor, com dosagem de cloro', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 775, 'ACTIVE', '0775', 'Irídio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 776, 'ACTIVE', '0776', 'Isoaglutininas', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 777, 'ACTIVE', '0777', 'Isobutanol urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 778, 'ACTIVE', '0778', 'Isoforonodiamina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 779, 'ACTIVE', '0779', 'Isolamento de agentes específicos (vírus, bactérias, protozoários, fungos, outros parasitas)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 780, 'ACTIVE', '0780', 'Isomerase fosfohexose', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 781, 'ACTIVE', '0781', 'Isoniazida', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 782, 'ACTIVE', '0782', 'Isopropanol urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 783, 'ACTIVE', '0783', 'Isospora (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 784, 'ACTIVE', '0784', 'Isospora (sorologia)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 785, 'ACTIVE', '0785', 'Ito (cancro mole), IDeR', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 786, 'ACTIVE', '0786', 'Ítrio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 787, 'ACTIVE', '0787', 'Klebsiella (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 788, 'ACTIVE', '0788', 'Kveim (sarcoidose), IDeR', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 789, 'ACTIVE', '0789', 'Lactogênico placentário-hormônio', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 790, 'ACTIVE', '0790', 'Lactose, teste de tolerância', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 791, 'ACTIVE', '0791', 'Lamotrigina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 792, 'ACTIVE', '0792', 'Larvas (fezes), pesquisa', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 793, 'ACTIVE', '0793', 'Lassa vírus, pesquisa', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 794, 'ACTIVE', '0794', 'Legionella - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 795, 'ACTIVE', '0795', 'Legionella - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 796, 'ACTIVE', '0796', 'Leishmania (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 797, 'ACTIVE', '0797', 'Leishmaniose - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 798, 'ACTIVE', '0798', 'Leishmaniose - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 799, 'ACTIVE', '0799', 'Leptina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1406, 'ACTIVE', '1406', 'Leptospira (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 800, 'ACTIVE', '0800', 'Leptospirose - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 801, 'ACTIVE', '0801', 'Leptospirose - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 802, 'ACTIVE', '0802', 'Leucino aminopeptidase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 804, 'ACTIVE', '0804', 'Leucócitos e hemácias, pesquisa nas fezes', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 803, 'ACTIVE', '0803', 'Leucócitos, contagem (leucograma)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 806, 'ACTIVE', '0806', 'Leveduras, pesquisa nas fezes', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 807, 'ACTIVE', '0807', 'Lichtheimia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 808, 'ACTIVE', '0808', 'Lidocaina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 809, 'ACTIVE', '0809', 'Lindano (?-HCH) gama-hexaclorociclo-hexano', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 810, 'ACTIVE', '0810', 'Linfócitos T "helper" contagem de (IF com OKT-4) (CD-4+)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 811, 'ACTIVE', '0811', 'Linfócitos T supressores contagem de (IF com OKT-8)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 812, 'ACTIVE', '0812', 'Lipase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 813, 'ACTIVE', '0813', 'Lipase lipoproteica', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 814, 'ACTIVE', '0814', 'Lipídios totais', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 815, 'ACTIVE', '0815', 'Lipoides na urina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 816, 'ACTIVE', '0816', 'Lipoproteína (a) - Lp (a)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 817, 'ACTIVE', '0817', 'Listeria (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 818, 'ACTIVE', '0818', 'Listeriose, reação sorológica', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 819, 'ACTIVE', '0819', 'Lítio sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 820, 'ACTIVE', '0820', 'Lítio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 821, 'ACTIVE', '0821', 'Loa (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 822, 'ACTIVE', '0822', 'Lyme - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 823, 'ACTIVE', '0823', 'Lyme - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 824, 'ACTIVE', '0824', 'Lyssavírus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 825, 'ACTIVE', '0825', 'Lyssavírus do morcego Australiano (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 826, 'ACTIVE', '0826', 'Lyssavírus do morcego europeu tipos 1 e 2 (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 827, 'ACTIVE', '0827', 'Macroprolactina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 828, 'ACTIVE', '0828', 'Madurella (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 829, 'ACTIVE', '0829', 'Magnésio', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1442, 'ACTIVE', '1442', 'Magnésio sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1443, 'ACTIVE', '1443', 'Magnésio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 830, 'ACTIVE', '0830', 'Malária - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 831, 'ACTIVE', '0831', 'Malária - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 832, 'ACTIVE', '0832', 'Malassezia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 833, 'ACTIVE', '0833', 'Malation urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 834, 'ACTIVE', '0834', 'Maltose, teste de tolerância', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1444, 'ACTIVE', '1444', 'Mamografia', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 836, 'ACTIVE', '0836', 'Manganês sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 835, 'ACTIVE', '0835', 'Manganês urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 837, 'ACTIVE', '0837', 'Mansonella (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 838, 'ACTIVE', '0838', 'Mantoux, IDeR', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1445, 'ACTIVE', '1445', 'Mapeamento de retina (oftalmoscopia indireta)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 839, 'ACTIVE', '0839', 'Marcador tumoral CA 125', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 840, 'ACTIVE', '0840', 'Marcador tumoral CA 15-3', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 841, 'ACTIVE', '0841', 'Marcador tumoral CA 19-9', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 842, 'ACTIVE', '0842', 'Marcador tumoral CA 72-4', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 843, 'ACTIVE', '0843', 'Marcadores tumorais', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 844, 'ACTIVE', '0844', 'MCA (antígeno cárcino-mamário)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 845, 'ACTIVE', '0845', 'Medida de pico de fluxo expiratório', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 846, 'ACTIVE', '0846', 'Medida seriada por 3 semanas do pico de fluxo expiratório', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 847, 'ACTIVE', '0847', 'MEHP + 5-OH-MEHP+ 5-oxo-MEHP+ 5-cx-MEPP', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 848, 'ACTIVE', '0848', 'Melanina na urina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 849, 'ACTIVE', '0849', 'Mercúrio sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 850, 'ACTIVE', '0850', 'Mercúrio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 851, 'ACTIVE', '0851', 'Metabólitos de atrazina urinários (atrazina dealquilada, deetilada, deisoprpilada)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 852, 'ACTIVE', '0852', 'Metagonimus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 853, 'ACTIVE', '0853', 'Meta-hemoglobina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 854, 'ACTIVE', '0854', 'Metais pesados, pesquisa em unhas, cabelos, outros tecidos', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 855, 'ACTIVE', '0855', 'Metalotioneína urinária', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 856, 'ACTIVE', '0856', 'Metanefrinas urinárias', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 857, 'ACTIVE', '0857', 'Metanol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 858, 'ACTIVE', '0858', 'Metapneumovírus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 859, 'ACTIVE', '0859', 'Metaxililenodiamina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 860, 'ACTIVE', '0860', 'Methotrexate (metotrexato)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 861, 'ACTIVE', '0861', 'Metil (4-hidroxi-1H-benzimidazol-2-il)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 862, 'ACTIVE', '0862', 'Metil (5-hidoxi-1H-benzimidazol-2-il)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 863, 'ACTIVE', '0863', 'Metil etil cetona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 864, 'ACTIVE', '0864', 'Metil isobutil cetona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1426, 'ACTIVE', '1426', 'Metilclorofórmio no ar exalado', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 865, 'ACTIVE', '0865', 'Métodos diagnósticos por imagem antebraço', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 866, 'ACTIVE', '0866', 'Métodos diagnósticos por imagem antebraço articulação acromioclavicular', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 867, 'ACTIVE', '0867', 'Métodos diagnósticos por imagem articulação coxofemoral (quadril)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 868, 'ACTIVE', '0868', 'Métodos diagnósticos por imagem articulação escapuloumeral (ombro)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 869, 'ACTIVE', '0869', 'Métodos diagnósticos por imagem articulação esternoclavicular', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 870, 'ACTIVE', '0870', 'Métodos diagnósticos por imagem articulação tibiotársica (tornozelo)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 871, 'ACTIVE', '0871', 'Métodos diagnósticos por imagem articulações sacro', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 872, 'ACTIVE', '0872', 'Métodos diagnósticos por imagem bacia', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 873, 'ACTIVE', '0873', 'Métodos diagnósticos por imagem braço', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 874, 'ACTIVE', '0874', 'Métodos diagnósticos por imagem calcâneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 875, 'ACTIVE', '0875', 'Métodos diagnósticos por imagem clavícula', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1407, 'ACTIVE', '1407', 'Métodos diagnósticos por imagem coluna', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1408, 'ACTIVE', '1408', 'Métodos diagnósticos por imagem coluna cervical', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1409, 'ACTIVE', '1409', 'Métodos diagnósticos por imagem coluna dorsal', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1410, 'ACTIVE', '1410', 'Métodos diagnósticos por imagem coluna lombar', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1411, 'ACTIVE', '1411', 'Métodos diagnósticos por imagem coluna sacro-cóccix', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 876, 'ACTIVE', '0876', 'Métodos diagnósticos por imagem coração e vasos da base', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 877, 'ACTIVE', '0877', 'Métodos diagnósticos por imagem cotovelo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 878, 'ACTIVE', '0878', 'Métodos diagnósticos por imagem coxa', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 879, 'ACTIVE', '0879', 'Métodos diagnósticos por imagem escanometria', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 880, 'ACTIVE', '0880', 'Métodos diagnósticos por imagem escápula', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 881, 'ACTIVE', '0881', 'Métodos diagnósticos por imagem esterno', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 882, 'ACTIVE', '0882', 'Métodos diagnósticos por imagem joelho', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 883, 'ACTIVE', '0883', 'Métodos diagnósticos por imagem laringe ou hipofaringe ou pescoço (partes moles)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 884, 'ACTIVE', '0884', 'Métodos diagnósticos por imagem mão ou quirodáctilo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 886, 'ACTIVE', '0886', 'Métodos diagnósticos por imagem panorâmica dos membros inferiores', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 887, 'ACTIVE', '0887', 'Métodos diagnósticos por imagem patela', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 888, 'ACTIVE', '0888', 'Métodos diagnósticos por imagem pé ou pododáctilo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 889, 'ACTIVE', '0889', 'Métodos diagnósticos por imagem perna', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 890, 'ACTIVE', '0890', 'Métodos diagnósticos por imagem punho', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1999, 'ACTIVE', '1999', 'Métodos diagnósticos por imagem - Não especificados anteriormente', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1412, 'ACTIVE', '1412', 'Metotrexato', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 893, 'ACTIVE', '0893', 'Microalbuminúria', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 894, 'ACTIVE', '0894', 'Micronúcleos cromossômicos (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 895, 'ACTIVE', '0895', 'Microsporídia, pesquisa nas fezes', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 896, 'ACTIVE', '0896', 'Microsporum (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 897, 'ACTIVE', '0897', 'Mielograma', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 898, 'ACTIVE', '0898', 'Mioglobina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 899, 'ACTIVE', '0899', 'Mioglobina urinária', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 900, 'ACTIVE', '0900', 'Mitomicina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 901, 'ACTIVE', '0901', 'Molibdênio plasmático', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 902, 'ACTIVE', '0902', 'Molibdênio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 903, 'ACTIVE', '0903', 'Monoclorometano', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 904, 'ACTIVE', '0904', 'Monometilfosfato urinário (MMP)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 905, 'ACTIVE', '0905', 'Mononucleose - Epstein BARR - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 906, 'ACTIVE', '0906', 'Mononucleose, anti-VCA (EBV) - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 907, 'ACTIVE', '0907', 'Monóxido de carbono no ar expirado', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 908, 'ACTIVE', '0908', 'Montenegro, IDeR', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 909, 'ACTIVE', '0909', 'Moraxella (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 910, 'ACTIVE', '0910', 'Morfoline urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 911, 'ACTIVE', '0911', 'Morganella (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 912, 'ACTIVE', '0912', 'Muco-nasal, pesquisa de eosinófilos e mastócitos', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 913, 'ACTIVE', '0913', 'Mucopolissacaridose, pesquisa', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 914, 'ACTIVE', '0914', 'Mucoproteínas', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 915, 'ACTIVE', '0915', 'Mycobacterium (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 916, 'ACTIVE', '0916', 'Mycoplasma (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 891, 'ACTIVE', '0891', 'Mycoplasma pneumoniae - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 892, 'ACTIVE', '0892', 'Mycoplasma pneumoniae - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 917, 'ACTIVE', '0917', 'N-(2-carbonamidaetil)-valina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 918, 'ACTIVE', '0918', 'N-(2-cianoetil)-valina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 919, 'ACTIVE', '0919', 'N-(2-hidroxietil)-valina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 920, 'ACTIVE', '0920', 'N-(2-hidroxipropil)-valina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 921, 'ACTIVE', '0921', 'N-1(hidroxibutenil) valina (adutos de hemoglobina)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 922, 'ACTIVE', '0922', 'N-2(hidroxibutenil) valina (adutos de hemoglobina)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 923, 'ACTIVE', '0923', 'N-acetil, 3,4-diidroxibutil-cisteína', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 924, 'ACTIVE', '0924', 'N-acetil-beta-glicosaminidase na urina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 925, 'ACTIVE', '0925', 'N-acetil-S-(2-carbonamidaetil)-cisteína', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1425, 'ACTIVE', '1425', 'N-acetil-S-(N-metilcarbamoil) cisteína na urina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 926, 'ACTIVE', '0926', 'N-acetil-S-2-hidroxietil-L-cisteína', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 927, 'ACTIVE', '0927', 'Naegleria (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 928, 'ACTIVE', '0928', 'Naftóis urinários', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 929, 'ACTIVE', '0929', 'NBT estimulado', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 930, 'ACTIVE', '0930', 'N-butil álcool', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 931, 'ACTIVE', '0931', 'N-dimetil acetamida + N-hidroximetil-N-metil acetamida', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 932, 'ACTIVE', '0932', 'Necator (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 933, 'ACTIVE', '0933', 'Neisseria (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 934, 'ACTIVE', '0934', 'Neotestudina (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 935, 'ACTIVE', '0935', 'N-heptano', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 936, 'ACTIVE', '0936', 'Nióbio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1446, 'ACTIVE', '1446', 'Níquel sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 937, 'ACTIVE', '0937', 'Níquel urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 938, 'ACTIVE', '0938', 'Nitrogênio amoniacal', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 939, 'ACTIVE', '0939', 'Nitrogênio total', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 940, 'ACTIVE', '0940', 'Nitroglicóis totais urinários', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 941, 'ACTIVE', '0941', 'N-metil-2-pirrolidona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 942, 'ACTIVE', '0942', 'N-metilacetamida', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 943, 'ACTIVE', '0943', 'N-metilformamida', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 944, 'ACTIVE', '0944', 'N-metilformamida + N-hidroximetil-N-metilformamida', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 945, 'ACTIVE', '0945', 'N-metilvalina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 946, 'ACTIVE', '0946', 'Nocardia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 947, 'ACTIVE', '0947', 'Norovírus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 948, 'ACTIVE', '0948', 'Nortriptilina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 949, 'ACTIVE', '0949', 'N-telopeptídeo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 950, 'ACTIVE', '0950', 'Ocitocinase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 951, 'ACTIVE', '0951', 'O-cresol urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 952, 'ACTIVE', '0952', 'Onchocerca (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 953, 'ACTIVE', '0953', 'Opisthorchis (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 954, 'ACTIVE', '0954', 'Orbivírus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 955, 'ACTIVE', '0955', 'Orthopoxvírus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 956, 'ACTIVE', '0956', 'Ortoreovírus de mamíferos, tipos 1 a 3 (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 957, 'ACTIVE', '0957', 'Ósmio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 958, 'ACTIVE', '0958', 'Osmolalidade', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 959, 'ACTIVE', '0959', 'Osmolalidade na urina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 960, 'ACTIVE', '0960', 'Osteocalcina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 961, 'ACTIVE', '0961', 'O-toluidina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 962, 'ACTIVE', '0962', 'Oxcarbazepina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 963, 'ACTIVE', '0963', 'Óxido nitroso na urina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 964, 'ACTIVE', '0964', 'P,p-1-diclorobenzofenona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 965, 'ACTIVE', '0965', 'Paládio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 966, 'ACTIVE', '0966', 'P-aminofenol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 967, 'ACTIVE', '0967', 'Papilomavírus humano (HPV) (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 968, 'ACTIVE', '0968', 'PAPP-A', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 969, 'ACTIVE', '0969', 'Paracoccidioides (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 970, 'ACTIVE', '0970', 'Paracoccidioidomicose, anticorpos totais - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 971, 'ACTIVE', '0971', 'Paragonimus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 972, 'ACTIVE', '0972', 'Parapoxvírus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 973, 'ACTIVE', '0973', 'Paraquat urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 974, 'ACTIVE', '0974', 'Parasitológico de fezes', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 975, 'ACTIVE', '0975', 'Paratormônio - PTH', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 976, 'ACTIVE', '0976', 'Parechovírus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 977, 'ACTIVE', '0977', 'Parvovírus - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1413, 'ACTIVE', '1413', 'Parvovírus - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 978, 'ACTIVE', '0978', 'Parvovírus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 979, 'ACTIVE', '0979', 'Parvovírus humano 4 e 5 (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 980, 'ACTIVE', '0980', 'Parvovírus humano B19 (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 981, 'ACTIVE', '0981', 'Pasteurella (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 982, 'ACTIVE', '0982', 'PCB 101', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 983, 'ACTIVE', '0983', 'PCB 138', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 984, 'ACTIVE', '0984', 'PCB 153', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 985, 'ACTIVE', '0985', 'PCB 180', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 986, 'ACTIVE', '0986', 'PCB 28', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 987, 'ACTIVE', '0987', 'PCB 52', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1424, 'ACTIVE', '1424', 'p-clorocatecol (para-clorocatecol) urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 988, 'ACTIVE', '0988', 'Pegivírus humano (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 989, 'ACTIVE', '0989', 'Penicillium (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 990, 'ACTIVE', '0990', 'Pentacloroetano', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 991, 'ACTIVE', '0991', 'Pentaclorofenol sanguíneo/plasmático', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 992, 'ACTIVE', '0992', 'Pentaclorofenol urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 993, 'ACTIVE', '0993', 'Peptídeo C', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 994, 'ACTIVE', '0994', 'Peptídeo natriurético BNP/PROBNP', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 995, 'ACTIVE', '0995', 'Peptídio intestinal vasoativo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 996, 'ACTIVE', '0996', 'Peptostreptococcus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 997, 'ACTIVE', '0997', 'Perfil lipídico/lipidograma', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 998, 'ACTIVE', '0998', 'Pesquisa de agente infeccioso específico por PCR', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 999, 'ACTIVE', '0999', 'Pesquisa de mutação de alelo específico por PCR', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1000, 'ACTIVE', '1000', 'pH - Tornassol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1001, 'ACTIVE', '1001', 'Piridinolina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1002, 'ACTIVE', '1002', 'Pirimidina-5-nucleotidase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1003, 'ACTIVE', '1003', 'Piruvato quinase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1004, 'ACTIVE', '1004', 'Planigrafia de tórax, mediastino ou laringe', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1005, 'ACTIVE', '1005', 'Plaquetas, teste de agregação', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1006, 'ACTIVE', '1006', 'Plasminogênio', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1007, 'ACTIVE', '1007', 'Plasmodium (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1008, 'ACTIVE', '1008', 'Platina urinária', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1009, 'ACTIVE', '1009', 'Plesiomonas (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1010, 'ACTIVE', '1010', 'Pneumocysti carinii (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1011, 'ACTIVE', '1011', 'P-nitrocresol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1012, 'ACTIVE', '1012', 'P-nitrofenol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1013, 'ACTIVE', '1013', 'Poliomavírus BK (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1014, 'ACTIVE', '1014', 'Poliomavírus JC (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1015, 'ACTIVE', '1015', 'Poliomavírus KI (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1016, 'ACTIVE', '1016', 'Poliomavírus WU (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1017, 'ACTIVE', '1017', 'Poliomelite (sorologia)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1018, 'ACTIVE', '1018', 'Poliovírus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1019, 'ACTIVE', '1019', 'Porfibilinogênio na urina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1020, 'ACTIVE', '1020', 'Porfirinas quantitativas', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1021, 'ACTIVE', '1021', 'Porphyromonas (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1022, 'ACTIVE', '1022', 'Potássio', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1023, 'ACTIVE', '1023', 'Poxvírus, pesquisa', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1024, 'ACTIVE', '1024', 'PPD (tuberculina), IDeR', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1025, 'ACTIVE', '1025', 'Prata sanguínea', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1026, 'ACTIVE', '1026', 'Pré-albumina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1027, 'ACTIVE', '1027', 'Pregnandiol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1028, 'ACTIVE', '1028', 'Pregnantriol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1029, 'ACTIVE', '1029', 'Prevotella (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1030, 'ACTIVE', '1030', 'Primidona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1031, 'ACTIVE', '1031', 'Prions (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1032, 'ACTIVE', '1032', 'Procainamida', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1033, 'ACTIVE', '1033', 'Procalcitonina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1447, 'ACTIVE', '1447', 'Procedimento diagnóstico em citopatologia cérvico-vaginal oncótica', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1034, 'ACTIVE', '1034', 'Produtos de degradação da fibrina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1035, 'ACTIVE', '1035', 'Progesterona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1036, 'ACTIVE', '1036', 'Prolactina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1037, 'ACTIVE', '1037', 'Propanolol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1038, 'ACTIVE', '1038', 'Propilenoglicol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1039, 'ACTIVE', '1039', 'Propilenotioureia (PTU)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1040, 'ACTIVE', '1040', 'Proteína amiloide A', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1041, 'ACTIVE', '1041', 'Proteína C', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1042, 'ACTIVE', '1042', 'Proteína C reativa', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1043, 'ACTIVE', '1043', 'Proteína eosinofílica catiônica', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1044, 'ACTIVE', '1044', 'Proteína ligadora do retinol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1045, 'ACTIVE', '1045', 'Proteína nuclear matriz 22 (NMP22)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1046, 'ACTIVE', '1046', 'Proteína S livre', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1047, 'ACTIVE', '1047', 'Proteína S total + livre', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1048, 'ACTIVE', '1048', 'Proteína S, teste funcional', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1049, 'ACTIVE', '1049', 'Proteínas de Bence Jones', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1050, 'ACTIVE', '1050', 'Proteínas totais', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1051, 'ACTIVE', '1051', 'Proteus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1052, 'ACTIVE', '1052', 'Protoporfirina eritrocitária livre - Zinco', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1053, 'ACTIVE', '1053', 'Protoporfirinas livres', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1054, 'ACTIVE', '1054', 'Protoporfirinas Zn', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1055, 'ACTIVE', '1055', 'Prova de concentração da urina (Fishberg ou Volhard)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1056, 'ACTIVE', '1056', 'Prova de diluição urinária', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1057, 'ACTIVE', '1057', 'Prova de função pulmonar completa (ou espirometria)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1058, 'ACTIVE', '1058', 'Prova do laço', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1059, 'ACTIVE', '1059', 'Prova do LH-Rh', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1060, 'ACTIVE', '1060', 'Prova do TRH-HPR', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1414, 'ACTIVE', '1414', 'Prova do TRH-TSH', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1061, 'ACTIVE', '1061', 'Prova para diabete insípido', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1062, 'ACTIVE', '1062', 'Providencia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1063, 'ACTIVE', '1063', 'Pseudallescheria (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1064, 'ACTIVE', '1064', 'Pseudomonas (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1065, 'ACTIVE', '1065', 'Pseudoterranova (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1066, 'ACTIVE', '1066', 'Psitacose - IgA', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1067, 'ACTIVE', '1067', 'Psitacose - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1068, 'ACTIVE', '1068', 'Psitacose - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1069, 'ACTIVE', '1069', 'P-ter-butilfenol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1070, 'ACTIVE', '1070', 'P-toluidina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1071, 'ACTIVE', '1071', 'Quebra das fitas de DNA (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1072, 'ACTIVE', '1072', 'Quinidina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1073, 'ACTIVE', '1073', 'Radiografia de coluna cervical', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1074, 'ACTIVE', '1074', 'Radiografia de coluna dorsal', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1075, 'ACTIVE', '1075', 'Radiografia de coluna lombo-sacra', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1076, 'ACTIVE', '1076', 'Radiografia de membros inferiores', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1077, 'ACTIVE', '1077', 'Radiografia de membros superiores', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1078, 'ACTIVE', '1078', 'Radiografia de tórax (PA) Padrão OIT (o mais recente), com dois leitores habilitados', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1415, 'ACTIVE', '1415', 'Radiografia de tórax (PA) Padrão OIT (o mais recente), com pelo menos um leitor habilitado', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1448, 'ACTIVE', '1448', 'Radiografia de tórax em duas incidências', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1430, 'ACTIVE', '1430', 'Radiografia de tórax em visão anteroposterior e de perfil', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1079, 'ACTIVE', '1079', 'Raiva (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1080, 'ACTIVE', '1080', 'Reação de fixação de complemento', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1081, 'ACTIVE', '1081', 'Reação sorológica para Coxsackie, neutralização - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1082, 'ACTIVE', '1082', 'Renina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1083, 'ACTIVE', '1083', 'Reovírus tipos 1 a 3 (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1084, 'ACTIVE', '1084', 'Reserva alcalina (bicarbonato)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1085, 'ACTIVE', '1085', 'Resistência globular, curva de', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1086, 'ACTIVE', '1086', 'Reticulócitos', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1087, 'ACTIVE', '1087', 'Retração do coágulo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1088, 'ACTIVE', '1088', 'Rhinocladiella (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1089, 'ACTIVE', '1089', 'Rhizomucor (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1090, 'ACTIVE', '1090', 'Rhizopus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1091, 'ACTIVE', '1091', 'Rhodococcus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1092, 'ACTIVE', '1092', 'Rickettsia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1093, 'ACTIVE', '1093', 'Rinovírus humano (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1094, 'ACTIVE', '1094', 'Ristocetina, co-fator', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1095, 'ACTIVE', '1095', 'Rochalimaea (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1096, 'ACTIVE', '1096', 'Ródio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1097, 'ACTIVE', '1097', 'Rotavírus humano tipos A, B e C (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1098, 'ACTIVE', '1098', 'Rotina (sumário) de urina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1099, 'ACTIVE', '1099', 'Rubéola - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1100, 'ACTIVE', '1100', 'Rubéola - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1101, 'ACTIVE', '1101', 'Rubídio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1102, 'ACTIVE', '1102', 'Sacarose, teste de tolerância', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1103, 'ACTIVE', '1103', 'Saksenaea (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1104, 'ACTIVE', '1104', 'Salicilatos', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1105, 'ACTIVE', '1105', 'Salmonela (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1107, 'ACTIVE', '1107', 'Sangue oculto nas fezes', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1108, 'ACTIVE', '1108', 'Sarampo - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1109, 'ACTIVE', '1109', 'Sarampo - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1110, 'ACTIVE', '1110', 'Sarcocystis (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1111, 'ACTIVE', '1111', 'Sarcoptes scabei (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1112, 'ACTIVE', '1112', 'Scedosporium (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1113, 'ACTIVE', '1113', 'Schistosoma (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1114, 'ACTIVE', '1114', 'Schistosomose/Esquistossomose - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1115, 'ACTIVE', '1115', 'Schistosomose/Esquistossomose - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1116, 'ACTIVE', '1116', 'Scopulariopsis (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1117, 'ACTIVE', '1117', 'Selênio plasmático', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1118, 'ACTIVE', '1118', 'Selênio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1119, 'ACTIVE', '1119', 'Serpulina (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1120, 'ACTIVE', '1120', 'Shigella (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1121, 'ACTIVE', '1121', 'Sífilis - FTA-ABS - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1122, 'ACTIVE', '1122', 'Sífilis - FTA-ABS - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1123, 'ACTIVE', '1123', 'Sífilis - VDRL', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1124, 'ACTIVE', '1124', 'Silício sangúineo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1125, 'ACTIVE', '1125', 'S-metilcisteína', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1126, 'ACTIVE', '1126', 'Sobrecarga de água, prova', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1127, 'ACTIVE', '1127', 'Sódio', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1128, 'ACTIVE', '1128', 'Solventes, pesquisa no ar expirado', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1129, 'ACTIVE', '1129', 'Somatomedina C (IGF1)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1431, 'ACTIVE', '1431', 'Somatório de ácidos mandélico e fenilglioxílico na urina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1130, 'ACTIVE', '1130', 'Somatotrófico coriônico-hormônio (HCS ou PHL)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1131, 'ACTIVE', '1131', 'Sporothrix (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1132, 'ACTIVE', '1132', 'Staphylococcus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1133, 'ACTIVE', '1133', 'Streptococcus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1134, 'ACTIVE', '1134', 'Strongyloides (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1135, 'ACTIVE', '1135', 'Substâncias redutoras nas fezes', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1136, 'ACTIVE', '1136', 'Succinil acetona', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1137, 'ACTIVE', '1137', 'Sulfato de dehidroepiandrosterona (S-DHEA)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1138, 'ACTIVE', '1138', 'Sulfatos inorgânicos', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1139, 'ACTIVE', '1139', 'Sulfatos orgânicos', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1140, 'ACTIVE', '1140', 'Sulfo-hemoglobina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1141, 'ACTIVE', '1141', 'Sulfonamidas livre e acetilada (% de acetilação)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1142, 'ACTIVE', '1142', 'T3 livre', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1143, 'ACTIVE', '1143', 'T3 retenção', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1144, 'ACTIVE', '1144', 'T3 reverso', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1145, 'ACTIVE', '1145', 'T4 livre', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1146, 'ACTIVE', '1146', 'Tacrolimus', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1147, 'ACTIVE', '1147', 'Taenia saginata (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1148, 'ACTIVE', '1148', 'Taenia solium (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1149, 'ACTIVE', '1149', 'Tálio sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1150, 'ACTIVE', '1150', 'Tálio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1151, 'ACTIVE', '1151', 'Telúrio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1152, 'ACTIVE', '1152', 'Tempo de coagulação', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1153, 'ACTIVE', '1153', 'Tempo de protrombina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1154, 'ACTIVE', '1154', 'Tempo de reptilase', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1155, 'ACTIVE', '1155', 'Tempo de sangramento (Duke)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1156, 'ACTIVE', '1156', 'Tempo de sangramento de IVY', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1157, 'ACTIVE', '1157', 'Tempo de trombina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1158, 'ACTIVE', '1158', 'Tempo de tromboplastina parcial ativada (TTPA)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1159, 'ACTIVE', '1159', 'Teofilina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1160, 'ACTIVE', '1160', 'Ter-butil-álcool sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1161, 'ACTIVE', '1161', 'Ter-butil-álcool urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1162, 'ACTIVE', '1162', 'Ter-butil-metil-éter sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1163, 'ACTIVE', '1163', 'Ter-butil-metil-éter urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1164, 'ACTIVE', '1164', 'Teste de inibição da migração dos linfócitos', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1165, 'ACTIVE', '1165', 'Teste de tolerância a insulina ou hipoglicemiantes orais', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1166, 'ACTIVE', '1166', 'Teste ergométrico (de esforço)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1167, 'ACTIVE', '1167', 'Teste oral de tolerância à glicose', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1168, 'ACTIVE', '1168', 'Teste respiratório para H. Pylori', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1169, 'ACTIVE', '1169', 'Testes cutâneo-alérgicos para alérgenos da poeira', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1170, 'ACTIVE', '1170', 'Testes cutâneo-alérgicos para alimentos', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1171, 'ACTIVE', '1171', 'Testes cutâneo-alérgicos para fungos', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1172, 'ACTIVE', '1172', 'Testes cutâneo-alérgicos para insetos hematófagos', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1173, 'ACTIVE', '1173', 'Testes cutâneo-alérgicos para pólens', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1174, 'ACTIVE', '1174', 'Testes de contato - Até 30 substâncias', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1175, 'ACTIVE', '1175', 'Testosterona livre', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1176, 'ACTIVE', '1176', 'Testosterona total', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1177, 'ACTIVE', '1177', 'Tetracloreto de carbono (tetraclorometano)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1178, 'ACTIVE', '1178', 'Tetracloroetano', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1179, 'ACTIVE', '1179', 'Tetracloroetileno', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1428, 'ACTIVE', '1428', 'Tetracloroetileno no ar exalado', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1180, 'ACTIVE', '1180', 'Tetrahidroftalimida urinária', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1181, 'ACTIVE', '1181', 'Tetra-hidrofurano', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1182, 'ACTIVE', '1182', 'Thiram sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1183, 'ACTIVE', '1183', 'Tiocianato plasmático', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1184, 'ACTIVE', '1184', 'Tiocianato urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1185, 'ACTIVE', '1185', 'Tireoglobulina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1186, 'ACTIVE', '1186', 'Tirosina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1187, 'ACTIVE', '1187', 'Tirosinose na urina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1188, 'ACTIVE', '1188', 'Tolueno sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1189, 'ACTIVE', '1189', 'Tolueno urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1190, 'ACTIVE', '1190', 'Tolueno-2,4-diamina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1191, 'ACTIVE', '1191', 'Tolueno-2,6-diamina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1416, 'ACTIVE', '1416', 'Tomografia de tórax', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1192, 'ACTIVE', '1192', 'Torovírus bovino (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1193, 'ACTIVE', '1193', 'Torovírus equino (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1194, 'ACTIVE', '1194', 'Torovírus humano (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1195, 'ACTIVE', '1195', 'Torovírus porcino (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1196, 'ACTIVE', '1196', 'Toxocara (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1197, 'ACTIVE', '1197', 'Toxocara canis - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1198, 'ACTIVE', '1198', 'Toxocara canis - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1199, 'ACTIVE', '1199', 'Toxoplasma (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1200, 'ACTIVE', '1200', 'Toxoplasmina, IDeR', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1201, 'ACTIVE', '1201', 'Toxoplasmose - IgA', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1202, 'ACTIVE', '1202', 'Toxoplasmose - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1203, 'ACTIVE', '1203', 'Toxoplasmose - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1204, 'ACTIVE', '1204', 'Transaminase oxalacética (amino transferase aspartato)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1205, 'ACTIVE', '1205', 'Transaminase pirúvica (amino transferase de alanina)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1206, 'ACTIVE', '1206', 'Transferrina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1207, 'ACTIVE', '1207', 'Treponema (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1208, 'ACTIVE', '1208', 'Triazínicos dealquilados', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1209, 'ACTIVE', '1209', 'Triazolam', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1210, 'ACTIVE', '1210', 'Trichinella (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1211, 'ACTIVE', '1211', 'Trichomonas (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1212, 'ACTIVE', '1212', 'Trichosporon (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1213, 'ACTIVE', '1213', 'Trichostrongylus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1214, 'ACTIVE', '1214', 'Trichuris (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1215, 'ACTIVE', '1215', 'Triclorocompostos totais', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1216, 'ACTIVE', '1216', 'Tricloroetano (tricloroetanol) sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1217, 'ACTIVE', '1217', 'Tricloroetano (tricloroetanol) urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1218, 'ACTIVE', '1218', 'Tricloroetileno', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1219, 'ACTIVE', '1219', 'Tricloropridinol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1220, 'ACTIVE', '1220', 'Tricophyton (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1221, 'ACTIVE', '1221', 'Trifenilcarbinol urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1222, 'ACTIVE', '1222', 'Triglicerídeos', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1223, 'ACTIVE', '1223', 'Trimipramina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1224, 'ACTIVE', '1224', 'Tripsina imuno reativa (IRT)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1225, 'ACTIVE', '1225', 'Troca de cromátides irmãs (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1226, 'ACTIVE', '1226', 'Tromboelastograma', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1227, 'ACTIVE', '1227', 'Troponina', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1228, 'ACTIVE', '1228', 'Trypanosoma (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1229, 'ACTIVE', '1229', 'Tungstênio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1230, 'ACTIVE', '1230', 'Ultrassonografia', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1231, 'ACTIVE', '1231', 'Ultrassonografia abdome inferior feminino (bexiga, útero, ovário e anexos)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1232, 'ACTIVE', '1232', 'Ultrassonografia abdome inferior masculino (bexiga, próstata e vesículas seminais)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1233, 'ACTIVE', '1233', 'Ultrassonografia abdome superior (fígado, vias biliares, vesícula, pâncreas, baço)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1234, 'ACTIVE', '1234', 'Ultrassonografia abdome total (inclui abdome inferior)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1235, 'ACTIVE', '1235', 'Ultrassonografia aparelho urinário feminino (rins, ureteres e bexiga)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1236, 'ACTIVE', '1236', 'Ultrassonografia aparelho urinário masculino (rins, ureteres, bexiga e próstata)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1237, 'ACTIVE', '1237', 'Ultrassonografia articular', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1238, 'ACTIVE', '1238', 'Ultrassonografia dermatológica - Pele e subcutâneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1239, 'ACTIVE', '1239', 'Urânio', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1240, 'ACTIVE', '1240', 'Ureaplasma (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1241, 'ACTIVE', '1241', 'Urease, teste rápido parahelicobacter pylori', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1242, 'ACTIVE', '1242', 'Ureia', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1243, 'ACTIVE', '1243', 'Urobilinogênio', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1244, 'ACTIVE', '1244', 'Uroporfirinas', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1245, 'ACTIVE', '1245', 'Vanádio sanguíneo/plasmático', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1246, 'ACTIVE', '1246', 'Vanádio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1247, 'ACTIVE', '1247', 'Varicela - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1248, 'ACTIVE', '1248', 'Varicela - IgM', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1249, 'ACTIVE', '1249', 'Vibrio (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1449, 'ACTIVE', '1449', 'Videolaringoscopia', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1251, 'ACTIVE', '1251', 'Vírus Absettarov (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1252, 'ACTIVE', '1252', 'Vírus Akabane (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1253, 'ACTIVE', '1253', 'Vírus Amapari (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1254, 'ACTIVE', '1254', 'Vírus Andes (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1255, 'ACTIVE', '1255', 'Vírus Banna (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1256, 'ACTIVE', '1256', 'Vírus Bebaru (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1257, 'ACTIVE', '1257', 'Vírus Belgrade (Dobrava) (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1258, 'ACTIVE', '1258', 'Vírus Bhanja (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1250, 'ACTIVE', '1250', 'Vírus Buffalopox vaccinia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1259, 'ACTIVE', '1259', 'Vírus Bunyamwera (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1260, 'ACTIVE', '1260', 'Vírus Chapare (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1261, 'ACTIVE', '1261', 'Vírus chikungunya (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1262, 'ACTIVE', '1262', 'Vírus Coxsackie (A e B) (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1263, 'ACTIVE', '1263', 'Vírus da conjuntivite hemorrágica aguda (AHC) (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1264, 'ACTIVE', '1264', 'Vírus da coriomeningite linfocítica (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1265, 'ACTIVE', '1265', 'Vírus da dengue tipos 1-4 (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1266, 'ACTIVE', '1266', 'Vírus da doença da floresta Kyasanur (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1267, 'ACTIVE', '1267', 'Vírus da doença de carneiros do Nairóbi (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1268, 'ACTIVE', '1268', 'Vírus da doença lupina (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1269, 'ACTIVE', '1269', 'Vírus da encefalite da Califórnia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1270, 'ACTIVE', '1270', 'Vírus da encefalite de Murray Valley (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1271, 'ACTIVE', '1271', 'Vírus da encefalite de St. Louis (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1272, 'ACTIVE', '1272', 'Vírus da encefalite do carrapato (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1273, 'ACTIVE', '1273', 'Vírus da encefalite do carrapato da Europa Central (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1274, 'ACTIVE', '1274', 'Vírus da encefalite do carrapato do extremo Oriente (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1275, 'ACTIVE', '1275', 'Vírus da encefalite do carrapato siberiano (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1276, 'ACTIVE', '1276', 'Vírus da encefalite equina do oeste (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1277, 'ACTIVE', '1277', 'Vírus da encefalite japonesa (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1278, 'ACTIVE', '1278', 'Vírus da encefalite primavera-verão russa (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1279, 'ACTIVE', '1279', 'Vírus da estomatite vesicular (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1280, 'ACTIVE', '1280', 'Vírus da família Bunyaviridae (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1281, 'ACTIVE', '1281', 'Vírus da família Caliciviridae (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1282, 'ACTIVE', '1282', 'Vírus da febre amarela (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1283, 'ACTIVE', '1283', 'Vírus da febre com trombocitopenia severa (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1284, 'ACTIVE', '1284', 'Vírus da febre de Lassa (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1285, 'ACTIVE', '1285', 'Vírus da febre de Rift Valley (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1286, 'ACTIVE', '1286', 'Vírus da febre do carrapato do Colorado (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1288, 'ACTIVE', '1288', 'Vírus da febre hemorrágica da Crimeia/Congo (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1289, 'ACTIVE', '1289', 'Vírus da febre hemorrágica de Alkhurma (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1287, 'ACTIVE', '1287', 'Vírus da febre hemorrágica de Omsk (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1290, 'ACTIVE', '1290', 'Vírus da imudeficiência humana - HIV (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1291, 'ACTIVE', '1291', 'Vírus da imudeficiência símia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1292, 'ACTIVE', '1292', 'Vírus da lebre Snoeshoe (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1293, 'ACTIVE', '1293', 'Vírus da meningite de perus de Israel (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1294, 'ACTIVE', '1294', 'Vírus da meningoencefalomielite (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1295, 'ACTIVE', '1295', 'Vírus da mosca da areia de Naples (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1296, 'ACTIVE', '1296', 'Vírus da varíola bovina (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1297, 'ACTIVE', '1297', 'Vírus das águas brancas de Arroyo (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1298, 'ACTIVE', '1298', 'Vírus Dhori (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1299, 'ACTIVE', '1299', 'Vírus do molusco contagioso (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1300, 'ACTIVE', '1300', 'Vírus do morcego de Lagos (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1301, 'ACTIVE', '1301', 'Vírus Dugbe (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1302, 'ACTIVE', '1302', 'Vírus Duvenhage (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1303, 'ACTIVE', '1303', 'Vírus Everglades (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1304, 'ACTIVE', '1304', 'Vírus Flexal (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1305, 'ACTIVE', '1305', 'Vírus Ganjam (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1306, 'ACTIVE', '1306', 'Vírus Germiston (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1307, 'ACTIVE', '1307', 'Vírus Getah (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1308, 'ACTIVE', '1308', 'Vírus Guanarito (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1309, 'ACTIVE', '1309', 'Vírus Hantaan (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1310, 'ACTIVE', '1310', 'Vírus Hanzalova (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1311, 'ACTIVE', '1311', 'Vírus Hazara (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1312, 'ACTIVE', '1312', 'Vírus Hendra (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1313, 'ACTIVE', '1313', 'Vírus Herpes Simplex 1 e 2 (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1314, 'ACTIVE', '1314', 'Vírus Hypr (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1315, 'ACTIVE', '1315', 'Vírus Influenza A, B e C (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1316, 'ACTIVE', '1316', 'Vírus Ippy (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1317, 'ACTIVE', '1317', 'Vírus Junin (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1318, 'ACTIVE', '1318', 'Vírus Kodoko (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1319, 'ACTIVE', '1319', 'Vírus Kumlinge (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1320, 'ACTIVE', '1320', 'Vírus La Crosse (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1321, 'ACTIVE', '1321', 'Vírus Latino (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1322, 'ACTIVE', '1322', 'Vírus linfotrópico de células T de primatas, tipos 1 e 2 (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1323, 'ACTIVE', '1323', 'Vírus Lujo (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1324, 'ACTIVE', '1324', 'Vírus Machupo (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1325, 'ACTIVE', '1325', 'Vírus Mayaro (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1326, 'ACTIVE', '1326', 'Vírus Merino Walk (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1327, 'ACTIVE', '1327', 'Vírus Middelburg (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1328, 'ACTIVE', '1328', 'Vírus Mobala (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1329, 'ACTIVE', '1329', 'Vírus Mokola (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1330, 'ACTIVE', '1330', 'Vírus Monkeypox (varíola símia) (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1331, 'ACTIVE', '1331', 'Vírus Mopeia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1332, 'ACTIVE', '1332', 'Vírus Morogoro (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1333, 'ACTIVE', '1333', 'Vírus Mucambo (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1334, 'ACTIVE', '1334', 'Vírus Ndumu (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1335, 'ACTIVE', '1335', 'Vírus Negishi (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1336, 'ACTIVE', '1336', 'Vírus Ngari (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1337, 'ACTIVE', '1337', 'Vírus Nipah (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1338, 'ACTIVE', '1338', 'Vírus Norwalk-like (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1339, 'ACTIVE', '1339', 'Vírus O''nyong-nyong (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1340, 'ACTIVE', '1340', 'Vírus Orf (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1341, 'ACTIVE', '1341', 'Vírus Oropouche (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1342, 'ACTIVE', '1342', 'Vírus Parainfluenza (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1343, 'ACTIVE', '1343', 'Vírus Parana (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1344, 'ACTIVE', '1344', 'Vírus Pichinde (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1345, 'ACTIVE', '1345', 'Vírus Piry (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1346, 'ACTIVE', '1346', 'Vírus Powassan (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1347, 'ACTIVE', '1347', 'Vírus Prospect Hill (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1348, 'ACTIVE', '1348', 'Vírus Pseudocowpox (pseudo varíola bovina) (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1349, 'ACTIVE', '1349', 'Vírus Punta Toro (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1350, 'ACTIVE', '1350', 'Vírus Puumala (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1351, 'ACTIVE', '1351', 'Vírus relacionado à leucemia murina xenotrópico (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1352, 'ACTIVE', '1352', 'Vírus Rocio (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1353, 'ACTIVE', '1353', 'Vírus Ross River (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1354, 'ACTIVE', '1354', 'Vírus Sabia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1355, 'ACTIVE', '1355', 'Vírus Sal Vieja (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1356, 'ACTIVE', '1356', 'Vírus San Perlita (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1357, 'ACTIVE', '1357', 'Vírus sem nome ou de Muerto Canyon (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1358, 'ACTIVE', '1358', 'Vírus Seoul (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1359, 'ACTIVE', '1359', 'Vírus Símio 40 (SV40) (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1360, 'ACTIVE', '1360', 'Vírus sincicial respiratório - Elisa - IgG', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1368, 'ACTIVE', '1368', 'Vírus sincicial respiratório (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1417, 'ACTIVE', '1417', 'Vírus sincicial respiratório (sorologia)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1361, 'ACTIVE', '1361', 'Vírus sincicial respiratório humano (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1369, 'ACTIVE', '1369', 'Vírus Tamiami (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1362, 'ACTIVE', '1362', 'Vírus Thogoto (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1363, 'ACTIVE', '1363', 'Vírus Torque teno (TTV) (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1364, 'ACTIVE', '1364', 'Vírus Toscana (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1365, 'ACTIVE', '1365', 'Vírus tumorais do macaco Yaba (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1366, 'ACTIVE', '1366', 'Vírus varíola (maior e menor) (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1367, 'ACTIVE', '1367', 'Vírus Wesselsbron (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1370, 'ACTIVE', '1370', 'Vitamina A', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1371, 'ACTIVE', '1371', 'Vitamina B1', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1372, 'ACTIVE', '1372', 'Vitamina B12', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1373, 'ACTIVE', '1373', 'Vitamina B2', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1374, 'ACTIVE', '1374', 'Vitamina B3', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1375, 'ACTIVE', '1375', 'Vitamina B6', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1376, 'ACTIVE', '1376', 'Vitamina D2', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1418, 'ACTIVE', '1418', 'Vitamina D3', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1377, 'ACTIVE', '1377', 'Vitamina E', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1378, 'ACTIVE', '1378', 'Vitamina K', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1379, 'ACTIVE', '1379', 'Waaler-Rose (fator reumatoide)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1380, 'ACTIVE', '1380', 'Weil Felix (Ricketsiose)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1381, 'ACTIVE', '1381', 'Western blot (anticorpos anti-HIV)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1382, 'ACTIVE', '1382', 'Western blot (anticorpos anti-HTV-I ou HTLV-II)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1383, 'ACTIVE', '1383', 'Widal, reação de', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1384, 'ACTIVE', '1384', 'Wuchereria (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1385, 'ACTIVE', '1385', 'X frágil (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1386, 'ACTIVE', '1386', 'Xileno sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1387, 'ACTIVE', '1387', 'Xilose, teste de absorção à', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1388, 'ACTIVE', '1388', 'Xylohypha (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1389, 'ACTIVE', '1389', 'Yersinia (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1390, 'ACTIVE', '1390', 'Yersinia pestis (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1391, 'ACTIVE', '1391', 'Zika vírus (pesquisa)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1392, 'ACTIVE', '1392', 'Zika vírus (sorologia)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1393, 'ACTIVE', '1393', 'Zinco sanguíneo', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1394, 'ACTIVE', '1394', 'Zinco urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1395, 'ACTIVE', '1395', 'Zircônio urinário', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1396, 'ACTIVE', '1396', 'a-fluoro-ß-alanine (FBAL)', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1397, 'ACTIVE', '1397', 'a-naftol', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1992, 'ACTIVE', '1992', 'Detecção de agente químico não especificado anteriormente', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1993, 'ACTIVE', '1993', 'Detecção de agentes infecciosos não especificados anteriormente por ELISA', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1994, 'ACTIVE', '1994', 'Detecção de agentes infecciosos não especificados anteriormente por imunofluorescência', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1995, 'ACTIVE', '1995', 'Detecção de agentes infecciosos não especificados anteriormente por métodos sorológicos', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1996, 'ACTIVE', '1996', 'Detecção de agentes infecciosos não especificados anteriormente por PCR', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1997, 'ACTIVE', '1997', 'Detecção de agentes infecciosos não especificados anteriormente por western blot', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 1998, 'ACTIVE', '1998', 'Detecção de medicamento não especificado anteriormente', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();
INSERT INTO esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
VALUES (gen_random_uuid(), 9999, 'ACTIVE', '9999', 'Outros procedimentos diagnósticos não descritos anteriormente', true, now())
ON CONFLICT (procedure_code) DO UPDATE SET description = EXCLUDED.description, active = true, updated_at = now();

DO $sync_t27$
DECLARE target_schema text;
BEGIN
    FOR target_schema IN
        SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'tenant\_%' ESCAPE '\'
    LOOP
        IF to_regclass(format('%I.esocial_table27_procedure', target_schema)) IS NOT NULL THEN
            EXECUTE format(
                $sql$
                INSERT INTO %I.esocial_table27_procedure (id, code, status, procedure_code, description, active, created_at)
                SELECT p.id, p.code, p.status, p.procedure_code, p.description, p.active, now()
                FROM public.esocial_table27_procedure p
                WHERE p.status <> 'DELETED'
                ON CONFLICT (procedure_code) DO UPDATE SET
                    description = EXCLUDED.description,
                    active = EXCLUDED.active,
                    updated_at = now()
                $sql$,
                target_schema
            );
        END IF;
    END LOOP;
END
$sync_t27$;
