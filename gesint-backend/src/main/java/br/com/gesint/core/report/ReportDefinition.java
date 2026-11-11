package br.com.gesint.core.report;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Contrato tipado de um relatorio Jasper.
 *
 * @param <F> filtro recebido pelo relatorio
 * @param <R> linha exposta ao template
 */
public interface ReportDefinition<F, R> {

    String templatePath();

    String title();

    String filename(F filter);

    List<R> load(F filter);

    default Map<String, Object> parameters(F filter, List<R> rows) {
        Map<String, Object> parameters = new LinkedHashMap<>();
        parameters.put("REPORT_TITLE", title());
        parameters.put("TOTAL_RECORDS", rows.size());
        return parameters;
    }

    default String auditDetail(List<R> rows) {
        return title() + " (" + rows.size() + " registros)";
    }
}
