package br.com.gesint.modules.cfg.dataimport.excel;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;
import java.util.Map;

import br.com.gesint.modules.cfg.dataimport.exception.DataImportException;

public final class ExcelValueParser {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private ExcelValueParser() {}

    public static String text(Map<String, String> row, String key) {
        String value = row.get(key);
        return value == null || value.isBlank() ? null : value.trim();
    }

    public static String requiredText(Map<String, String> row, String key) {
        String value = text(row, key);
        if (value == null) {
            throw DataImportException.rowError("Campo obrigatorio ausente: " + key);
        }
        return value;
    }

    public static Integer integer(Map<String, String> row, String key) {
        String value = text(row, key);
        if (value == null) {
            return null;
        }
        try {
            return new BigDecimal(value.replace(",", ".")).intValueExact();
        } catch (Exception ex) {
            throw DataImportException.rowError("Valor inteiro invalido em " + key + ": " + value);
        }
    }

    public static Integer requiredInteger(Map<String, String> row, String key) {
        Integer value = integer(row, key);
        if (value == null) {
            throw DataImportException.rowError("Campo obrigatorio ausente: " + key);
        }
        return value;
    }

    public static BigDecimal decimal(Map<String, String> row, String key) {
        String value = text(row, key);
        if (value == null) {
            return null;
        }
        try {
            return new BigDecimal(value.replace(",", "."));
        } catch (Exception ex) {
            throw DataImportException.rowError("Valor decimal invalido em " + key + ": " + value);
        }
    }

    public static Boolean bool(Map<String, String> row, String key) {
        String value = text(row, key);
        if (value == null) {
            return null;
        }
        String n = value.toLowerCase(Locale.ROOT);
        if (n.equals("true") || n.equals("1") || n.equals("sim") || n.equals("s") || n.equals("yes")) {
            return true;
        }
        if (n.equals("false") || n.equals("0") || n.equals("nao") || n.equals("não") || n.equals("n") || n.equals("no")) {
            return false;
        }
        throw DataImportException.rowError("Valor booleano invalido em " + key + ": " + value);
    }

    public static LocalDate date(Map<String, String> row, String key) {
        String value = text(row, key);
        if (value == null) {
            return null;
        }
        try {
            return LocalDate.parse(value, ISO);
        } catch (DateTimeParseException ignored) {
            // fallthrough
        }
        try {
            return LocalDate.parse(value, BR);
        } catch (DateTimeParseException ex) {
            throw DataImportException.rowError("Data invalida em " + key + ": " + value);
        }
    }

    public static LocalDate requiredDate(Map<String, String> row, String key) {
        LocalDate value = date(row, key);
        if (value == null) {
            throw DataImportException.rowError("Campo obrigatorio ausente: " + key);
        }
        return value;
    }

    public static String digits(Map<String, String> row, String key) {
        String value = text(row, key);
        if (value == null) {
            return null;
        }
        return value.replaceAll("\\D", "");
    }

    public static <E extends Enum<E>> E enumValue(Map<String, String> row, String key, Class<E> type) {
        String value = text(row, key);
        if (value == null) {
            return null;
        }
        try {
            return Enum.valueOf(type, value.trim().toUpperCase(Locale.ROOT).replace(' ', '_').replace('-', '_'));
        } catch (Exception ex) {
            throw DataImportException.rowError("Enum invalido em " + key + ": " + value);
        }
    }

    public static <E extends Enum<E>> E requiredEnum(Map<String, String> row, String key, Class<E> type) {
        E value = enumValue(row, key, type);
        if (value == null) {
            throw DataImportException.rowError("Campo obrigatorio ausente: " + key);
        }
        return value;
    }

    public static int rowNumber(Map<String, String> row) {
        String value = row.get("__rowNumber");
        if (value == null) {
            return 0;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ex) {
            return 0;
        }
    }

    public static String snapshot(Map<String, String> row) {
        StringBuilder sb = new StringBuilder();
        row.forEach((k, v) -> {
            if ("__rowNumber".equals(k)) {
                return;
            }
            if (!sb.isEmpty()) {
                sb.append(" | ");
            }
            sb.append(k).append('=').append(v == null ? "" : v);
        });
        return sb.toString();
    }
}
