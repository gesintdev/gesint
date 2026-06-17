package br.com.gommo.modules.ctb.payroll.payslip.pdf;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.ctb.payroll.entity.PayrollRun;
import br.com.gommo.modules.ctb.payroll.event.entity.PayrollEvent;
import br.com.gommo.modules.ctb.payroll.event.entity.PayrollEventTypeEnum;
import br.com.gommo.modules.ctb.payroll.event.repository.PayrollEventRepository;
import br.com.gommo.modules.ctb.payroll.integration.CollaboratorDisplayProvider;
import br.com.gommo.modules.ctb.payroll.integration.CollaboratorDisplaySnapshot;
import br.com.gommo.modules.ctb.payroll.integration.CompanyDisplayProvider;
import br.com.gommo.modules.ctb.payroll.integration.CompanyDisplaySnapshot;
import br.com.gommo.modules.ctb.payroll.payslip.entity.Payslip;
import br.com.gommo.modules.ctb.payroll.payslip.entry.entity.PayslipEntry;
import br.com.gommo.modules.ctb.payroll.payslip.entry.repository.PayslipEntryRepository;
import br.com.gommo.modules.ctb.payroll.payslip.exception.PayslipException;
import br.com.gommo.modules.ctb.payroll.payslip.repository.PayslipRepository;
import br.com.gommo.modules.ctb.payroll.repository.PayrollRunRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class PayslipPdfDataLoader {

    private final PayslipRepository payslipRepository;
    private final PayslipEntryRepository payslipEntryRepository;
    private final PayrollRunRepository payrollRunRepository;
    private final PayrollEventRepository payrollEventRepository;
    private final CollaboratorDisplayProvider collaboratorDisplayProvider;
    private final CompanyDisplayProvider companyDisplayProvider;

    public PayslipPdfDataLoader(
            PayslipRepository payslipRepository,
            PayslipEntryRepository payslipEntryRepository,
            PayrollRunRepository payrollRunRepository,
            PayrollEventRepository payrollEventRepository,
            CollaboratorDisplayProvider collaboratorDisplayProvider,
            CompanyDisplayProvider companyDisplayProvider) {
        this.payslipRepository = payslipRepository;
        this.payslipEntryRepository = payslipEntryRepository;
        this.payrollRunRepository = payrollRunRepository;
        this.payrollEventRepository = payrollEventRepository;
        this.collaboratorDisplayProvider = collaboratorDisplayProvider;
        this.companyDisplayProvider = companyDisplayProvider;
    }

    public PayslipPdfDocument load(UUID payslipId) {
        Payslip payslip = payslipRepository
                .findByIdAndStatusNot(payslipId, StatusEnum.DELETED)
                .orElseThrow(PayslipException::notFound);

        PayrollRun payrollRun = payrollRunRepository
                .findByIdAndStatusNot(payslip.getPayrollRunId(), StatusEnum.DELETED)
                .orElseThrow(PayslipException::notFound);

        CollaboratorDisplaySnapshot collaborator = collaboratorDisplayProvider
                .findById(payslip.getCollaboratorId())
                .orElse(CollaboratorDisplaySnapshot.empty(payslip.getCollaboratorId()));

        CompanyDisplaySnapshot company = companyDisplayProvider
                .findPrimary()
                .orElse(new CompanyDisplaySnapshot(null, "Empresa", "", "", "", ""));

        Map<UUID, PayrollEvent> eventsById = payrollEventRepository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED)
                .stream()
                .collect(Collectors.toMap(PayrollEvent::getId, Function.identity(), (left, right) -> left));

        List<PayslipEntry> entries =
                payslipEntryRepository.findAllByPayslipIdAndStatusNot(payslip.getId(), StatusEnum.DELETED);

        List<PayslipPdfLineItem> lines = new ArrayList<>();
        for (PayslipEntry entry : entries) {
            PayrollEvent event = eventsById.get(entry.getPayrollEventId());
            if (event == null) {
                continue;
            }
            BigDecimal total = entry.getTotalValue() != null ? entry.getTotalValue() : BigDecimal.ZERO;
            BigDecimal earnings = event.getEventType() == PayrollEventTypeEnum.EARNING ? total : BigDecimal.ZERO;
            BigDecimal deductions = event.getEventType() == PayrollEventTypeEnum.DEDUCTION ? total : BigDecimal.ZERO;
            lines.add(new PayslipPdfLineItem(
                    event.getEventCode(),
                    event.getDescription(),
                    event.getEventType(),
                    entry.getQuantity(),
                    earnings,
                    deductions));
        }

        lines.sort(Comparator.comparing(PayslipPdfLineItem::eventCode));

        String competence = String.format(
                "%02d/%d",
                payrollRun.getReferenceDate().getMonthValue(),
                payrollRun.getReferenceDate().getYear());

        return new PayslipPdfDocument(
                payslip.getId(),
                payslip.getCode(),
                competence,
                company.displayName(),
                company.cnpj() != null ? company.cnpj() : "",
                collaborator.fullName(),
                collaborator.cpf(),
                payslip.getBaseSalary(),
                payslip.getGrossAmount(),
                payslip.getDeductionsAmount(),
                payslip.getNetAmount(),
                payslip.getGeneratedAt(),
                lines);
    }
}
