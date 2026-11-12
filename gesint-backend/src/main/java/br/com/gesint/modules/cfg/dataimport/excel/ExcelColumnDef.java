package br.com.gesint.modules.cfg.dataimport.excel;

public record ExcelColumnDef(String key, String header, ExcelColumnType type, boolean required) {}
