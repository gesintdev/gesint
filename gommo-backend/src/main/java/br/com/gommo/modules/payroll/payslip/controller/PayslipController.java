package br.com.gommo.modules.payroll.payslip.controller;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.payroll.payslip.dto.PayslipRequestDto;
import br.com.gommo.modules.payroll.payslip.dto.PayslipResponseDto;
import br.com.gommo.modules.payroll.payslip.pdf.IPayslipPdfService;
import br.com.gommo.modules.payroll.payslip.service.IPayslipService;
import java.util.UUID;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payslips")
public class PayslipController extends BaseController<PayslipRequestDto, PayslipResponseDto> {

    private final IPayslipPdfService payslipPdfService;
    private final IPayslipService payslipService;

    public PayslipController(IPayslipService service, IPayslipPdfService payslipPdfService) {
        super(service);
        this.payslipService = service;
        this.payslipPdfService = payslipPdfService;
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable UUID id) {
        PayslipResponseDto payslip = payslipService.findById(id);
        byte[] pdf = payslipPdfService.generatePdf(id);
        String filename = payslipPdfService.buildFilename(id, payslip.getCode());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
