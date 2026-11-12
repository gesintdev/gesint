package br.com.gesint.modules.cfg.dataimport.importer;

import java.util.Map;

import br.com.gesint.modules.cfg.dataimport.entity.DataImportEntityType;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportMode;

public interface DataImporter {

    DataImportEntityType entityType();

    String importRow(DataImportMode mode, Map<String, String> row);
}
