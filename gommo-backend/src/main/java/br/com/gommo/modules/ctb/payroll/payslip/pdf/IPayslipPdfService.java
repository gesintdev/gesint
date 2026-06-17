package br.com.gommo.modules.ctb.payroll.payslip.pdf;

import java.util.UUID;

public interface IPayslipPdfService {

    byte[] generatePdf(UUID payslipId);

    String buildFilename(UUID payslipId, Integer payslipCode);
}
