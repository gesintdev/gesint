package br.com.gesint.modules.cfg.dataimport.excel;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import br.com.gesint.modules.cfg.dataimport.entity.DataImportEntityType;
import br.com.gesint.modules.cfg.dataimport.entity.DataImportMode;
import br.com.gesint.modules.cfg.dataimport.exception.DataImportException;

@Component
public class ExcelSheetReader {

    private final DataFormatter formatter = new DataFormatter(Locale.ROOT);

    public List<Map<String, String>> readRows(byte[] bytes, DataImportEntityType entityType, DataImportMode mode) {
        List<ExcelColumnDef> expected = DataImportColumnCatalog.columnsFor(entityType, mode);
        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            Sheet sheet = workbook.getNumberOfSheets() > 0 ? workbook.getSheetAt(0) : null;
            if (sheet == null) {
                throw DataImportException.invalidFile();
            }
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw DataImportException.invalidHeaders(null);
            }
            Map<Integer, String> indexToKey = mapHeaders(headerRow, expected);
            List<Map<String, String>> rows = new ArrayList<>();
            int last = sheet.getLastRowNum();
            for (int r = 1; r <= last; r++) {
                Row row = sheet.getRow(r);
                if (row == null || isHintRow(row, expected) || isBlankRow(row)) {
                    continue;
                }
                Map<String, String> values = new LinkedHashMap<>();
                for (Map.Entry<Integer, String> entry : indexToKey.entrySet()) {
                    values.put(entry.getValue(), cellAsString(row.getCell(entry.getKey())));
                }
                if (values.values().stream().allMatch(v -> v == null || v.isBlank())) {
                    continue;
                }
                values.put("__rowNumber", String.valueOf(r + 1));
                rows.add(values);
            }
            if (rows.isEmpty()) {
                throw DataImportException.emptyRows();
            }
            return rows;
        } catch (IOException ex) {
            throw DataImportException.invalidFile();
        }
    }

    private Map<Integer, String> mapHeaders(Row headerRow, List<ExcelColumnDef> expected) {
        Map<String, String> normalizedToKey = new HashMap<>();
        for (ExcelColumnDef def : expected) {
            normalizedToKey.put(normalizeHeader(def.header()), def.key());
            normalizedToKey.put(normalizeHeader(def.header() + "*"), def.key());
        }
        Map<Integer, String> indexToKey = new LinkedHashMap<>();
        short last = headerRow.getLastCellNum();
        for (int i = 0; i < last; i++) {
            String raw = cellAsString(headerRow.getCell(i));
            if (raw == null || raw.isBlank()) {
                continue;
            }
            String key = normalizedToKey.get(normalizeHeader(raw));
            if (key != null) {
                indexToKey.put(i, key);
            }
        }
        for (ExcelColumnDef def : expected) {
            if (def.required() && !indexToKey.containsValue(def.key())) {
                throw DataImportException.invalidHeaders("Coluna obrigatoria ausente: " + def.header());
            }
        }
        if (indexToKey.isEmpty()) {
            throw DataImportException.invalidHeaders(null);
        }
        return indexToKey;
    }

    private boolean isHintRow(Row row, List<ExcelColumnDef> expected) {
        String first = cellAsString(row.getCell(0));
        if (first == null) {
            return false;
        }
        String n = first.trim().toLowerCase(Locale.ROOT);
        return n.equals("texto")
                || n.equals("inteiro")
                || n.equals("decimal")
                || n.equals("true/false")
                || n.equals("yyyy-mm-dd")
                || n.equals("enum");
    }

    private boolean isBlankRow(Row row) {
        if (row == null) {
            return true;
        }
        short last = row.getLastCellNum();
        for (int i = 0; i < last; i++) {
            String v = cellAsString(row.getCell(i));
            if (v != null && !v.isBlank()) {
                return false;
            }
        }
        return true;
    }

    private String cellAsString(Cell cell) {
        if (cell == null) {
            return null;
        }
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            Date date = cell.getDateCellValue();
            LocalDate localDate = date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            return localDate.toString();
        }
        if (cell.getCellType() == CellType.NUMERIC) {
            double n = cell.getNumericCellValue();
            if (Math.rint(n) == n) {
                return BigDecimal.valueOf((long) n).toPlainString();
            }
            return BigDecimal.valueOf(n).stripTrailingZeros().toPlainString();
        }
        String formatted = formatter.formatCellValue(cell);
        return formatted != null ? formatted.trim() : null;
    }

    private static String normalizeHeader(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT).replace('*', ' ').trim();
    }
}
