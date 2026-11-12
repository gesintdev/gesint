package br.com.gesint.core.report;

import java.io.InputStream;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JRParameter;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;

@Service
public class JasperReportGenerator implements ReportGenerator {

    private static final TimeZone SAO_PAULO = TimeZone.getTimeZone(ZoneId.of("America/Sao_Paulo"));

    private final ConcurrentMap<String, JasperReport> compiledReports = new ConcurrentHashMap<>();
    private final ReportHeaderParameters headerParameters;

    public JasperReportGenerator(ReportHeaderParameters headerParameters) {
        this.headerParameters = headerParameters;
    }

    @Override
    public <F, R> GeneratedReport generate(ReportDefinition<F, R> definition, F filter) {
        List<R> rows = definition.load(filter);
        Map<String, Object> parameters = headerParameters.current();
        parameters.putAll(definition.parameters(filter, rows));
        parameters.put(JRParameter.REPORT_LOCALE, reportLocale());
        parameters.put(JRParameter.REPORT_TIME_ZONE, SAO_PAULO);

        try {
            JasperPrint print = JasperFillManager.fillReport(
                    compiled(definition.templatePath()), parameters, new JRBeanCollectionDataSource(rows));
            return new GeneratedReport(
                    JasperExportManager.exportReportToPdf(print), definition.filename(filter), rows.size());
        } catch (JRException ex) {
            throw new ReportGenerationException("Falha ao gerar o relatório " + definition.title(), ex);
        }
    }

    private JasperReport compiled(String templatePath) {
        return compiledReports.computeIfAbsent(templatePath, this::compile);
    }

    private JasperReport compile(String templatePath) {
        ClassPathResource resource = new ClassPathResource(templatePath);
        try (InputStream input = resource.getInputStream()) {
            return JasperCompileManager.compileReport(input);
        } catch (Exception ex) {
            throw new ReportGenerationException("Template de relatório inválido: " + templatePath, ex);
        }
    }
}
