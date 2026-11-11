package br.com.gesint.core.report;

import org.springframework.stereotype.Component;

import br.com.gesint.core.audit.trail.AuditActionEnum;
import br.com.gesint.core.audit.trail.AuditTrailEntry;
import br.com.gesint.core.audit.trail.AuditTrailRecorder;

@Component
public class ReportExporter {

    private final ReportGenerator reportGenerator;
    private final AuditTrailRecorder auditTrail;

    public ReportExporter(ReportGenerator reportGenerator, AuditTrailRecorder auditTrail) {
        this.reportGenerator = reportGenerator;
        this.auditTrail = auditTrail;
    }

    public <F, R> GeneratedReport export(ReportDefinition<F, R> definition, F filter) {
        GeneratedReport report = reportGenerator.generate(definition, filter);
        auditTrail.recordIsolated(AuditTrailEntry.of(AuditActionEnum.EXPORT, GeneratedReport.class, null)
                .recordLabel(report.filename())
                .detail(definition.title() + " (" + report.recordCount() + " registros)")
                .reason("Exportação de relatório em PDF"));
        return report;
    }
}
