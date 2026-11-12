package br.com.gesint.modules.cfg.dataimport.excel;

import java.util.ArrayList;
import java.util.List;

import br.com.gesint.modules.cfg.dataimport.entity.DataImportEntityType;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportMode;

public final class DataImportColumnCatalog {

    private DataImportColumnCatalog() {}

    public static List<ExcelColumnDef> columnsFor(DataImportEntityType entityType, DataImportMode mode) {
        return switch (entityType) {
            case DEPARTMENT -> departmentColumns(mode);
            case JOB_POSITION -> jobPositionColumns(mode);
            case ADMISSION -> admissionColumns(mode);
        };
    }

    private static List<ExcelColumnDef> departmentColumns(DataImportMode mode) {
        List<ExcelColumnDef> cols = new ArrayList<>();
        if (mode == DataImportMode.UPDATE) {
            cols.add(col("codigo", "codigo", ExcelColumnType.INTEGER, true));
        }
        cols.add(col("nome", "nome", ExcelColumnType.TEXT, mode == DataImportMode.INSERT));
        cols.add(col("centro_custo", "centro_custo", ExcelColumnType.TEXT, false));
        cols.add(col("descricao", "descricao", ExcelColumnType.TEXT, false));
        cols.add(col("orcamento_mensal", "orcamento_mensal", ExcelColumnType.DECIMAL, false));
        cols.add(col("localizacao", "localizacao", ExcelColumnType.TEXT, false));
        cols.add(col("telefone", "telefone", ExcelColumnType.TEXT, false));
        cols.add(col("fax", "fax", ExcelColumnType.TEXT, false));
        cols.add(col("ramal", "ramal", ExcelColumnType.TEXT, false));
        cols.add(col("email", "email", ExcelColumnType.TEXT, false));
        cols.add(col("codigo_pai", "codigo_pai", ExcelColumnType.INTEGER, false));
        cols.add(col("codigo_filial", "codigo_filial", ExcelColumnType.INTEGER, false));
        cols.add(col("compartilhado_filiais", "compartilhado_filiais", ExcelColumnType.BOOLEAN, false));
        return cols;
    }

    private static List<ExcelColumnDef> jobPositionColumns(DataImportMode mode) {
        List<ExcelColumnDef> cols = new ArrayList<>();
        if (mode == DataImportMode.UPDATE) {
            cols.add(col("codigo", "codigo", ExcelColumnType.INTEGER, true));
        }
        cols.add(col("titulo", "titulo", ExcelColumnType.TEXT, mode == DataImportMode.INSERT));
        cols.add(col("codigo_departamento", "codigo_departamento", ExcelColumnType.INTEGER, false));
        cols.add(col("codigo_filial", "codigo_filial", ExcelColumnType.INTEGER, false));
        cols.add(col("codigo_cbo", "codigo_cbo", ExcelColumnType.TEXT, false));
        cols.add(col("natureza", "natureza", ExcelColumnType.ENUM, false));
        cols.add(col("descricao", "descricao", ExcelColumnType.TEXT, false));
        cols.add(col("compartilhado_filiais", "compartilhado_filiais", ExcelColumnType.BOOLEAN, false));
        return cols;
    }

    private static List<ExcelColumnDef> admissionColumns(DataImportMode mode) {
        List<ExcelColumnDef> cols = new ArrayList<>();
        cols.add(col("cpf", "cpf", ExcelColumnType.TEXT, mode == DataImportMode.INSERT));
        cols.add(col("provider_cnpj", "provider_cnpj", ExcelColumnType.TEXT, false));
        cols.add(col("nome_completo", "nome_completo", ExcelColumnType.TEXT, mode == DataImportMode.INSERT));
        cols.add(col("nome_social", "nome_social", ExcelColumnType.TEXT, false));
        cols.add(col("rg", "rg", ExcelColumnType.TEXT, false));
        cols.add(col("rg_emissor", "rg_emissor", ExcelColumnType.TEXT, false));
        cols.add(col("rg_uf", "rg_uf", ExcelColumnType.TEXT, false));
        cols.add(col("data_nascimento", "data_nascimento", ExcelColumnType.DATE, false));
        cols.add(col("sexo", "sexo", ExcelColumnType.ENUM, false));
        cols.add(col("estado_civil", "estado_civil", ExcelColumnType.ENUM, false));
        cols.add(col("nome_mae", "nome_mae", ExcelColumnType.TEXT, false));
        cols.add(col("nome_pai", "nome_pai", ExcelColumnType.TEXT, false));
        cols.add(col("nacionalidade", "nacionalidade", ExcelColumnType.TEXT, false));
        cols.add(col("pis_pasep", "pis_pasep", ExcelColumnType.TEXT, false));
        cols.add(col("email", "email", ExcelColumnType.TEXT, false));
        cols.add(col("telefone", "telefone", ExcelColumnType.TEXT, false));
        cols.add(col("cep", "cep", ExcelColumnType.TEXT, false));
        cols.add(col("logradouro", "logradouro", ExcelColumnType.TEXT, false));
        cols.add(col("numero", "numero", ExcelColumnType.TEXT, false));
        cols.add(col("complemento", "complemento", ExcelColumnType.TEXT, false));
        cols.add(col("bairro", "bairro", ExcelColumnType.TEXT, false));
        cols.add(col("cidade_ibge", "cidade_ibge", ExcelColumnType.INTEGER, false));
        cols.add(col("uf", "uf", ExcelColumnType.TEXT, false));
        cols.add(col("data_prevista_inicio", "data_prevista_inicio", ExcelColumnType.DATE, mode == DataImportMode.INSERT));
        cols.add(col("codigo_filial", "codigo_filial", ExcelColumnType.INTEGER, false));
        cols.add(col("codigo_departamento", "codigo_departamento", ExcelColumnType.INTEGER, false));
        cols.add(col("codigo_cargo", "codigo_cargo", ExcelColumnType.INTEGER, false));
        cols.add(col("tipo_contrato", "tipo_contrato", ExcelColumnType.ENUM, mode == DataImportMode.INSERT));
        cols.add(col("salario_base", "salario_base", ExcelColumnType.DECIMAL, false));
        cols.add(col("jornada", "jornada", ExcelColumnType.TEXT, false));
        cols.add(col("codigo_escala", "codigo_escala", ExcelColumnType.INTEGER, false));
        cols.add(col("data_inicio_contrato", "data_inicio_contrato", ExcelColumnType.DATE, false));
        cols.add(col("data_fim_contrato", "data_fim_contrato", ExcelColumnType.DATE, false));
        cols.add(col("periodo_experiencia", "periodo_experiencia", ExcelColumnType.TEXT, false));
        cols.add(col("razao_social_prestador", "razao_social_prestador", ExcelColumnType.TEXT, false));
        cols.add(col("nome_fantasia_prestador", "nome_fantasia_prestador", ExcelColumnType.TEXT, false));
        cols.add(col("observacoes", "observacoes", ExcelColumnType.TEXT, false));
        return cols;
    }

    private static ExcelColumnDef col(String key, String header, ExcelColumnType type, boolean required) {
        return new ExcelColumnDef(key, header, type, required);
    }
}
