-- A busca global monta as queries com unaccent() sem qualificar o schema (ver os metodos
-- searchForGlobal dos repositorios). A extensao unaccent vive em public, mas conexoes de tenant
-- rodam com "SET search_path TO <tenant>, gesint_types" -- sem public, de proposito, para manter o
-- isolamento fail-closed do TenantSchemaDataSource. Resultado: toda busca global feita por usuario
-- de tenant dedicado falhava com "function unaccent(character varying) does not exist".
--
-- gesint_types e o unico schema presente nos dois modos de search_path, entao expor o wrapper ali
-- resolve a chamada para tenants sem afetar o modo public (onde public.unaccent tem precedencia).
--
-- Preferido a ALTER EXTENSION unaccent SET SCHEMA: immutable_unaccent referencia public.unaccent no
-- corpo e o indice GIN de search_document depende dela, entao mover a extensao exigiria recriar as
-- duas coisas.
--
-- A forma de dois argumentos (dicionario explicito) e IMMUTABLE; a de um argumento e apenas STABLE.
CREATE OR REPLACE FUNCTION gesint_types.unaccent(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
    SELECT public.unaccent('public.unaccent'::regdictionary, value)
$$;
