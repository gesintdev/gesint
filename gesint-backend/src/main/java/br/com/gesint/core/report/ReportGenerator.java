package br.com.gesint.core.report;

import java.util.Locale;

public interface ReportGenerator {

    <F, R> GeneratedReport generate(ReportDefinition<F, R> definition, F filter);

    default Locale reportLocale() {
        return Locale.forLanguageTag("pt-BR");
    }
}
