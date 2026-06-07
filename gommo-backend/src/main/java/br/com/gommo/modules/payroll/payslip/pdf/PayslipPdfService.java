package br.com.gommo.modules.payroll.payslip.pdf;

import br.com.gommo.modules.payroll.event.entity.PayrollEventTypeEnum;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Service
public class PayslipPdfService implements IPayslipPdfService {

    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");
    private static final NumberFormat CURRENCY = NumberFormat.getCurrencyInstance(PT_BR);
    private static final NumberFormat QUANTITY = NumberFormat.getNumberInstance(PT_BR);
    private static final DateTimeFormatter GENERATED_AT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withLocale(PT_BR);

    private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
    private static final Font HEADER_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
    private static final Font BODY_FONT = FontFactory.getFont(FontFactory.HELVETICA, 9);
    private static final Font SMALL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 8);

    private final PayslipPdfDataLoader dataLoader;

    public PayslipPdfService(PayslipPdfDataLoader dataLoader) {
        this.dataLoader = dataLoader;
    }

    @Override
    @PreAuthorize("hasAuthority('payslip:read')")
    public byte[] generatePdf(UUID payslipId) {
        PayslipPdfDocument document = dataLoader.load(payslipId);
        try {
            return render(document);
        } catch (DocumentException ex) {
            throw new IllegalStateException("Falha ao gerar PDF do holerite", ex);
        }
    }

    @Override
    public String buildFilename(UUID payslipId, Integer payslipCode) {
        String code = payslipCode != null ? String.valueOf(payslipCode) : payslipId.toString();
        return "holerite-" + code + ".pdf";
    }

    private byte[] render(PayslipPdfDocument data) throws DocumentException {
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, output);
        document.open();

        document.add(new Paragraph("Demonstrativo de Pagamento", TITLE_FONT));
        document.add(spacedParagraph("Recibo de pagamento de salario (CLT)", BODY_FONT));
        document.add(spacedParagraph(" ", BODY_FONT));

        document.add(spacedParagraph("Empresa: " + safe(data.companyName()), HEADER_FONT));
        document.add(spacedParagraph("CNPJ: " + formatCnpj(data.companyCnpj()), BODY_FONT));
        document.add(spacedParagraph("Competencia: " + safe(data.competenceLabel()), BODY_FONT));
        document.add(spacedParagraph("Colaborador: " + safe(data.collaboratorName()), HEADER_FONT));
        document.add(spacedParagraph("CPF: " + formatCpf(data.collaboratorCpf()), BODY_FONT));
        document.add(spacedParagraph(
                "Holerite nº "
                        + (data.payslipCode() != null ? data.payslipCode() : "-")
                        + (data.generatedAt() != null
                                ? " — Gerado em " + GENERATED_AT.format(data.generatedAt())
                                : ""),
                SMALL_FONT));
        document.add(spacedParagraph(" ", BODY_FONT));

        document.add(buildEntriesTable(data));
        document.add(spacedParagraph(" ", BODY_FONT));
        document.add(buildTotalsTable(data));

        document.add(spacedParagraph(" ", BODY_FONT));
        document.add(spacedParagraph(
                "Documento gerado eletronicamente pelo Gommo ERP. Validade sujeita a conferencia da folha processada.",
                SMALL_FONT));

        document.close();
        return output.toByteArray();
    }

    private PdfPTable buildEntriesTable(PayslipPdfDocument data) throws DocumentException {
        PdfPTable table = new PdfPTable(new float[] {1.2f, 3.4f, 1.2f, 1.6f, 1.6f});
        table.setWidthPercentage(100);
        addHeaderCell(table, "Codigo");
        addHeaderCell(table, "Descricao");
        addHeaderCell(table, "Ref.");
        addHeaderCell(table, "Proventos");
        addHeaderCell(table, "Descontos");

        if (data.lines().isEmpty()) {
            addBodyCell(table, "-", Element.ALIGN_LEFT);
            addBodyCell(table, "Sem lancamentos calculados", Element.ALIGN_LEFT);
            addBodyCell(table, "-", Element.ALIGN_RIGHT);
            addBodyCell(table, formatMoney(BigDecimal.ZERO), Element.ALIGN_RIGHT);
            addBodyCell(table, formatMoney(BigDecimal.ZERO), Element.ALIGN_RIGHT);
            return table;
        }

        for (PayslipPdfLineItem line : data.lines()) {
            addBodyCell(table, safe(line.eventCode()), Element.ALIGN_LEFT);
            addBodyCell(table, safe(line.description()), Element.ALIGN_LEFT);
            addBodyCell(table, formatQuantity(line.quantity()), Element.ALIGN_RIGHT);

            if (line.eventType() == PayrollEventTypeEnum.INFORMATIVE) {
                addBodyCell(table, formatMoney(line.earnings()), Element.ALIGN_RIGHT);
                addBodyCell(table, "(inf.)", Element.ALIGN_CENTER);
            } else {
                addBodyCell(table, formatMoney(line.earnings()), Element.ALIGN_RIGHT);
                addBodyCell(table, formatMoney(line.deductions()), Element.ALIGN_RIGHT);
            }
        }
        return table;
    }

    private PdfPTable buildTotalsTable(PayslipPdfDocument data) throws DocumentException {
        PdfPTable table = new PdfPTable(new float[] {2f, 1f});
        table.setWidthPercentage(60);
        table.setHorizontalAlignment(Element.ALIGN_RIGHT);

        addTotalRow(table, "Salario base", formatMoney(data.baseSalary()));
        addTotalRow(table, "Total proventos", formatMoney(data.grossAmount()));
        addTotalRow(table, "Total descontos", formatMoney(data.deductionsAmount()));
        addTotalRow(table, "Liquido a receber", formatMoney(data.netAmount()));
        return table;
    }

    private static void addHeaderCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, HEADER_FONT));
        cell.setBackgroundColor(new Color(230, 230, 230));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5f);
        table.addCell(cell);
    }

    private static void addBodyCell(PdfPTable table, String text, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, BODY_FONT));
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(4f);
        table.addCell(cell);
    }

    private static void addTotalRow(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, HEADER_FONT));
        labelCell.setBorder(PdfPCell.NO_BORDER);
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        labelCell.setPadding(4f);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, HEADER_FONT));
        valueCell.setBorder(PdfPCell.NO_BORDER);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valueCell.setPadding(4f);
        table.addCell(valueCell);
    }

    private static Paragraph spacedParagraph(String text, Font font) {
        Paragraph paragraph = new Paragraph(text, font);
        paragraph.setSpacingAfter(4f);
        return paragraph;
    }

    private static String safe(String value) {
        return value != null ? value : "";
    }

    private static String formatMoney(BigDecimal value) {
        if (value == null) {
            return CURRENCY.format(0);
        }
        return CURRENCY.format(value);
    }

    private static String formatQuantity(BigDecimal value) {
        if (value == null) {
            return "-";
        }
        QUANTITY.setMinimumFractionDigits(0);
        QUANTITY.setMaximumFractionDigits(4);
        return QUANTITY.format(value);
    }

    private static String formatCpf(String cpf) {
        if (cpf == null || cpf.length() != 11) {
            return safe(cpf);
        }
        return cpf.substring(0, 3) + "." + cpf.substring(3, 6) + "." + cpf.substring(6, 9) + "-" + cpf.substring(9);
    }

    private static String formatCnpj(String cnpj) {
        String digits = cnpj != null ? cnpj.replaceAll("\\D", "") : "";
        if (digits.length() != 14) {
            return safe(cnpj);
        }
        return digits.substring(0, 2) + "." + digits.substring(2, 5) + "." + digits.substring(5, 8) + "/"
                + digits.substring(8, 12) + "-" + digits.substring(12);
    }
}
