package br.com.gesint.core.report;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import java.io.InputStream;
import java.util.List;

import org.junit.jupiter.api.Test;

import net.sf.jasperreports.engine.JasperCompileManager;

class JasperTemplatesCompilationTest {

    private static final List<String> TEMPLATES = List.of(
            "reports/dp/employees/employee-roster.jrxml",
            "reports/rh/admissions/admissions-by-period.jrxml",
            "reports/rh/leaves/leaves-by-period.jrxml");

    @Test
    void shouldCompileAllTemplates() {
        for (String template : TEMPLATES) {
            assertDoesNotThrow(
                    () -> {
                        try (InputStream input =
                                Thread.currentThread().getContextClassLoader().getResourceAsStream(template)) {
                            if (input == null) {
                                throw new IllegalStateException("Template não encontrado: " + template);
                            }
                            JasperCompileManager.compileReport(input);
                        }
                    },
                    template);
        }
    }
}
