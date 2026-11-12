package br.com.gesint.modules.cfg.dataimport.excel;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import br.com.gesint.modules.cfg.dataimport.entity.DataImportEntityType;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportMode;
import br.com.gesint.modules.cfg.dataimport.exception.DataImportException;

@Component
public class ExcelTemplateBuilder {

    public byte[] build(DataImportEntityType entityType, DataImportMode mode) {
        List<ExcelColumnDef> columns = DataImportColumnCatalog.columnsFor(entityType, mode);
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("dados");
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            Row header = sheet.createRow(0);
            for (int i = 0; i < columns.size(); i++) {
                ExcelColumnDef def = columns.get(i);
                Cell cell = header.createCell(i);
                cell.setCellValue(def.required() ? def.header() + "*" : def.header());
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 18 * 256);
            }

            Row hint = sheet.createRow(1);
            for (int i = 0; i < columns.size(); i++) {
                ExcelColumnDef def = columns.get(i);
                hint.createCell(i).setCellValue(typeHint(def));
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException ex) {
            throw DataImportException.invalidFile();
        }
    }

    private static String typeHint(ExcelColumnDef def) {
        return switch (def.type()) {
            case TEXT -> "texto";
            case INTEGER -> "inteiro";
            case DECIMAL -> "decimal";
            case BOOLEAN -> "true/false";
            case DATE -> "yyyy-MM-dd";
            case ENUM -> "enum";
        };
    }
}
