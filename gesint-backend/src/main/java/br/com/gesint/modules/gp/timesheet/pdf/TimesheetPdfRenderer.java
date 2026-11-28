package br.com.gesint.modules.gp.timesheet.pdf;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Component;

import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.ColumnText;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;

import br.com.gesint.modules.gp.attendance.domain.AttendanceAlertEnum;
import br.com.gesint.modules.gp.attendance.domain.AttendanceTimeFormat;
import br.com.gesint.modules.gp.attendance.dto.AttendanceDayResponseDto;
import br.com.gesint.modules.gp.attendance.service.AttendanceEvaluationService;
import br.com.gesint.modules.gp.timesheet.dto.TimesheetResponseDto;

/**
 * Espelho de ponto em PDF (modelo Gesint). Le so o que a apuracao ja calculou; nao recalcula.
 */
@Component
public class TimesheetPdfRenderer {

    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("dd/MM");
    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");

    // Paleta da marca (mesmos tons dos tokens --gesint-* do frontend).
    private static final Color PRIMARY = new Color(0, 123, 255);
    private static final Color PRIMARY_SOFT = new Color(232, 242, 255);
    private static final Color INK = new Color(30, 41, 59);
    private static final Color MUTED = new Color(100, 116, 139);
    private static final Color BORDER = new Color(226, 232, 240);
    private static final Color SURFACE = new Color(248, 250, 252);
    private static final Color REST_ROW = new Color(244, 246, 249);
    private static final Color SUCCESS = new Color(22, 163, 74);
    private static final Color WARNING = new Color(217, 119, 6);
    private static final Color ERROR = new Color(220, 38, 38);
    private static final Color INFO = new Color(45, 168, 247);

    private static final Font TITLE = font(FontFactory.HELVETICA_BOLD, 17, INK);
    private static final Font SUBTITLE = font(FontFactory.HELVETICA, 9.5f, MUTED);
    private static final Font LABEL = font(FontFactory.HELVETICA, 7, MUTED);
    private static final Font VALUE = font(FontFactory.HELVETICA_BOLD, 9, INK);
    private static final Font BODY = font(FontFactory.HELVETICA, 8, INK);
    private static final Font BODY_MUTED = font(FontFactory.HELVETICA, 8, MUTED);
    private static final Font HEAD = font(FontFactory.HELVETICA_BOLD, 7, MUTED);
    private static final Font SECTION = font(FontFactory.HELVETICA_BOLD, 9.5f, INK);
    private static final Font SMALL = font(FontFactory.HELVETICA, 7, MUTED);

    public byte[] render(TimesheetResponseDto.Detail detail, TimesheetCompanyInfo company) {
        try {
            return doRender(detail, company != null ? company : TimesheetCompanyInfo.empty());
        } catch (DocumentException ex) {
            throw new IllegalStateException("Falha ao gerar o espelho de ponto", ex);
        }
    }

    private byte[] doRender(TimesheetResponseDto.Detail detail, TimesheetCompanyInfo company) throws DocumentException {
        Document document = new Document(PageSize.A4, 30, 30, 30, 40);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        PdfWriter writer = PdfWriter.getInstance(document, output);
        String generatedAt = OffsetDateTime.now(AttendanceEvaluationService.BUSINESS_ZONE).format(DATE_TIME);
        writer.setPageEvent(new Footer("Gerado pelo Gesint em " + generatedAt));
        document.addTitle("Espelho de ponto");
        document.open();

        document.add(header(detail, company));
        document.add(gap(8));
        document.add(identification(detail, company));
        document.add(gap(10));
        document.add(kpis(detail));
        document.add(gap(12));
        document.add(daysTable(detail));
        document.add(gap(12));
        document.add(summaries(detail));
        document.add(gap(10));
        Paragraph note = new Paragraph(
                "Saldo do dia = horas trabalhadas menos a jornada prevista na escala. Variações de até 10 minutos no dia "
                        + "não entram no saldo (CLT, art. 58, § 1º). Dias de férias, afastamento e atestado contam como "
                        + "jornada cumprida.",
                SMALL);
        note.setLeading(9.5f);
        document.add(note);
        document.add(gap(26));
        document.add(signatures());

        document.close();
        return output.toByteArray();
    }

    private PdfPTable header(TimesheetResponseDto.Detail detail, TimesheetCompanyInfo company) {
        PdfPTable table = new PdfPTable(new float[] {1.25f, 1f});
        table.setWidthPercentage(100);

        PdfPCell left = new PdfPCell();
        left.setBorder(Rectangle.BOTTOM);
        left.setBorderColor(PRIMARY);
        left.setBorderWidth(2f);
        left.setPaddingBottom(10);
        left.addElement(new Paragraph("Espelho de ponto", TITLE));
        Paragraph period = new Paragraph(
                DATE.format(detail.getPeriodStart()) + " a " + DATE.format(detail.getPeriodEnd()), SUBTITLE);
        period.setSpacingBefore(2);
        left.addElement(period);
        table.addCell(left);

        PdfPCell right = new PdfPCell();
        right.setBorder(Rectangle.BOTTOM);
        right.setBorderColor(PRIMARY);
        right.setBorderWidth(2f);
        right.setPaddingBottom(10);
        right.setHorizontalAlignment(Element.ALIGN_RIGHT);
        Paragraph companyName = new Paragraph(safe(company.companyName(), "Empregador"), VALUE);
        companyName.setAlignment(Element.ALIGN_RIGHT);
        right.addElement(companyName);
        if (company.companyCnpj() != null) {
            Paragraph cnpj = new Paragraph("CNPJ " + formatCnpj(company.companyCnpj()), BODY_MUTED);
            cnpj.setAlignment(Element.ALIGN_RIGHT);
            right.addElement(cnpj);
        }
        boolean closed = "CLOSED".equals(detail.getClosingStatus());
        Color tone = closed ? SUCCESS : WARNING;
        String badge = closed && detail.getClosedAt() != null
                ? "Fechado em " + detail.getClosedAt().atZoneSameInstant(AttendanceEvaluationService.BUSINESS_ZONE).format(DATE_TIME)
                : "Prévia: período aberto para ajustes";
        Paragraph status = new Paragraph(new Chunk("  " + badge + "  ", font(FontFactory.HELVETICA_BOLD, 7.5f, tone))
                .setBackground(tint(tone, 0.12f), 0, 2, 0, 2));
        status.setAlignment(Element.ALIGN_RIGHT);
        status.setSpacingBefore(5);
        right.addElement(status);
        table.addCell(right);
        return table;
    }

    private PdfPTable identification(TimesheetResponseDto.Detail detail, TimesheetCompanyInfo company) {
        PdfPTable table = new PdfPTable(new float[] {2.2f, 1f, 1.2f, 1.6f});
        table.setWidthPercentage(100);
        field(table, "Colaborador", detail.getCollaboratorName());
        field(table, "Matrícula", detail.getCollaboratorCode() != null ? String.valueOf(detail.getCollaboratorCode()) : null);
        field(table, "CPF", company.collaboratorCpf() != null ? formatCpf(company.collaboratorCpf()) : null);
        field(table, "Admissão", detail.getAdmissionDate() != null ? DATE.format(detail.getAdmissionDate()) : null);
        field(table, "Cargo", detail.getJobTitle());
        field(table, "Departamento", detail.getDepartmentName());
        PdfPCell schedule = fieldCell("Escala de trabalho", detail.getWorkScheduleName());
        schedule.setColspan(2);
        table.addCell(schedule);
        return table;
    }

    private PdfPTable kpis(TimesheetResponseDto.Detail detail) {
        boolean bank = detail.isHourBankEnabled();
        boolean overtime = detail.isOvertimeEnabled();
        int columns = 3 + (overtime ? 1 : 0) + (bank ? 2 : 0);
        PdfPTable table = new PdfPTable(columns);
        table.setWidthPercentage(100);
        table.getDefaultCell().setBorder(Rectangle.NO_BORDER);
        kpi(table, "Jornada prevista", AttendanceTimeFormat.duration(detail.getExpectedMinutes()), INK);
        kpi(table, "Horas trabalhadas", AttendanceTimeFormat.duration(detail.getWorkedMinutes()), INK);
        if (overtime) {
            kpi(table, "Horas extras", AttendanceTimeFormat.duration(detail.getOvertimeMinutes()), INK);
        }
        if (bank) {
            kpi(table, "Banco no período", AttendanceTimeFormat.signed(detail.getHourBankMinutes()), signColor(detail.getHourBankMinutes()));
            kpi(table, "Saldo do banco", AttendanceTimeFormat.signed(detail.getTotalBalanceMinutes()), signColor(detail.getTotalBalanceMinutes()));
        }
        kpi(table, "Pendências", detail.getPendingCount() == 0 ? "Nenhuma" : String.valueOf(detail.getPendingCount()),
                detail.getPendingCount() == 0 ? SUCCESS : WARNING);
        return table;
    }

    private PdfPTable daysTable(TimesheetResponseDto.Detail detail) {
        PdfPTable table = new PdfPTable(new float[] {0.9f, 0.6f, 0.75f, 1.35f, 0.75f, 0.85f, 0.95f, 0.85f, 1.9f});
        table.setWidthPercentage(100);
        table.setHeaderRows(1);
        for (String head : List.of("Data", "Dia", "Entrada", "Intervalo", "Saída", "Previsto", "Trabalhado", "Saldo", "Situação")) {
            PdfPCell cell = new PdfPCell(new Phrase(head, HEAD));
            cell.setBorder(Rectangle.BOTTOM);
            cell.setBorderColor(BORDER);
            cell.setBackgroundColor(SURFACE);
            cell.setPaddingTop(6);
            cell.setPaddingBottom(6);
            cell.setHorizontalAlignment(head.equals("Situação") || head.equals("Data") || head.equals("Dia")
                    ? Element.ALIGN_LEFT : Element.ALIGN_CENTER);
            table.addCell(cell);
        }
        for (AttendanceDayResponseDto day : detail.getDays()) {
            boolean rest = isRest(day.getStatus());
            Color background = rest ? REST_ROW : Color.WHITE;
            int balance = day.getHourBankMinutes() + day.getOvertimeMinutes() - day.getDebitMinutes();
            String weekday = day.getDate().getDayOfWeek().getDisplayName(TextStyle.SHORT, PT_BR).replace(".", "");
            dayCell(table, DAY.format(day.getDate()), BODY, background, Element.ALIGN_LEFT);
            dayCell(table, weekday, BODY_MUTED, background, Element.ALIGN_LEFT);
            dayCell(table, AttendanceTimeFormat.clock(day.getClockIn()), BODY, background, Element.ALIGN_CENTER);
            String interval = day.getBreakStart() != null || day.getBreakEnd() != null
                    ? AttendanceTimeFormat.clock(day.getBreakStart()) + " – " + AttendanceTimeFormat.clock(day.getBreakEnd())
                    : "";
            dayCell(table, interval, BODY, background, Element.ALIGN_CENTER);
            dayCell(table, AttendanceTimeFormat.clock(day.getClockOut()), BODY, background, Element.ALIGN_CENTER);
            dayCell(table, day.getExpectedMinutes() > 0 ? AttendanceTimeFormat.duration(day.getExpectedMinutes()) : "",
                    BODY_MUTED, background, Element.ALIGN_CENTER);
            dayCell(table, day.getWorkedMinutes() > 0 ? AttendanceTimeFormat.duration(day.getWorkedMinutes()) : "",
                    BODY, background, Element.ALIGN_CENTER);
            dayCell(table, balance != 0 ? AttendanceTimeFormat.signed(balance) : "",
                    font(FontFactory.HELVETICA_BOLD, 8, signColor(balance)), background, Element.ALIGN_CENTER);
            table.addCell(situationCell(day, background));
        }
        return table;
    }

    private PdfPTable summaries(TimesheetResponseDto.Detail detail) {
        PdfPTable table = new PdfPTable(detail.isHourBankEnabled() ? new float[] {1f, 0.06f, 1f} : new float[] {1f});
        table.setWidthPercentage(100);
        table.getDefaultCell().setBorder(Rectangle.NO_BORDER);
        if (detail.isHourBankEnabled()) {
            PdfPTable bank = card("Banco de horas");
            line(bank, "Saldo anterior", AttendanceTimeFormat.signed(detail.getPreviousBalanceMinutes()), signColor(detail.getPreviousBalanceMinutes()));
            line(bank, "Gerado no período", AttendanceTimeFormat.signed(detail.getHourBankMinutes()), signColor(detail.getHourBankMinutes()));
            line(bank, "Saldo final", AttendanceTimeFormat.signed(detail.getTotalBalanceMinutes()), signColor(detail.getTotalBalanceMinutes()));
            table.addCell(wrap(bank));
            PdfPCell spacer = new PdfPCell();
            spacer.setBorder(Rectangle.NO_BORDER);
            table.addCell(spacer);
        }
        PdfPTable limits = card("Limites da CLT no período");
        line(limits, "Dias acima de 10 horas", count(detail, AttendanceAlertEnum.OVER_10_HOURS), INK);
        line(limits, "Dias sem intervalo", count(detail, AttendanceAlertEnum.NO_BREAK), INK);
        line(limits, "Intervalo menor que 1 hora", count(detail, AttendanceAlertEnum.SHORT_BREAK), INK);
        line(limits, "Descanso menor que 11 horas", count(detail, AttendanceAlertEnum.SHORT_INTERJOURNEY), INK);
        line(limits, "Atrasos", count(detail, AttendanceAlertEnum.LATE_ARRIVAL), INK);
        table.addCell(wrap(limits));
        return table;
    }

    private PdfPTable signatures() {
        PdfPTable table = new PdfPTable(new float[] {1f, 0.15f, 1f});
        table.setWidthPercentage(100);
        signature(table, "Colaborador", "Declaro que as marcações acima correspondem à minha jornada.");
        PdfPCell spacer = new PdfPCell();
        spacer.setBorder(Rectangle.NO_BORDER);
        table.addCell(spacer);
        signature(table, "Responsável pela empresa", "Conferido e aprovado.");
        return table;
    }

    private static void signature(PdfPTable table, String role, String text) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.TOP);
        cell.setBorderColor(INK);
        cell.setBorderWidth(0.6f);
        cell.setPaddingTop(5);
        cell.addElement(new Paragraph(role, VALUE));
        cell.addElement(new Paragraph(text, SMALL));
        table.addCell(cell);
    }

    private static PdfPCell situationCell(AttendanceDayResponseDto day, Color background) {
        String label = situation(day);
        Color tone = situationTone(day);
        Phrase phrase = new Phrase();
        if (label != null) {
            phrase.add(new Chunk(label, font(FontFactory.HELVETICA_BOLD, 7.5f, tone)));
        }
        String alerts = alertText(day);
        if (!alerts.isEmpty()) {
            phrase.add(new Chunk((label != null ? "  " : "") + alerts, SMALL));
        }
        PdfPCell cell = new PdfPCell(phrase);
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(BORDER);
        cell.setBackgroundColor(background);
        cell.setPaddingTop(4.5f);
        cell.setPaddingBottom(4.5f);
        return cell;
    }

    static String situation(AttendanceDayResponseDto day) {
        return switch (day.getStatus()) {
            case "MISSING" -> "Sem registro";
            case "INCOMPLETE" -> "Incompleto";
            case "DAY_OFF" -> day.getWorkedMinutes() > 0 ? "Trabalho na folga" : "Folga";
            case "HOLIDAY" -> day.getWorkedMinutes() > 0 ? "Trabalho no feriado" : "Feriado";
            case "VACATION" -> "Férias";
            case "LEAVE" -> "Afastamento";
            case "UNJUSTIFIED_ABSENCE" -> "Falta";
            case "IN_PROGRESS" -> "Em andamento";
            case "PENDING_START", "NOT_EMPLOYED" -> null;
            default -> origin(day);
        };
    }

    private static String origin(AttendanceDayResponseDto day) {
        if ("TIME_ADJUSTMENT".equals(day.getOccurrenceType())) {
            return "Ajustado";
        }
        if ("MANUAL".equals(day.getOccurrenceOrigin())) {
            return "Lançado pelo RH";
        }
        return null;
    }

    private static Color situationTone(AttendanceDayResponseDto day) {
        return switch (day.getStatus()) {
            case "MISSING", "UNJUSTIFIED_ABSENCE" -> ERROR;
            case "INCOMPLETE" -> WARNING;
            case "VACATION", "LEAVE" -> INFO;
            case "HOLIDAY", "DAY_OFF" -> day.getWorkedMinutes() > 0 ? PRIMARY : MUTED;
            default -> MUTED;
        };
    }

    private static String alertText(AttendanceDayResponseDto day) {
        StringBuilder text = new StringBuilder();
        for (String alert : day.getAlerts()) {
            String label = switch (alert) {
                case "OVER_10_HOURS" -> "+10h";
                case "NO_BREAK" -> "sem intervalo";
                case "SHORT_BREAK" -> "intervalo curto";
                case "SHORT_INTERJOURNEY" -> "interjornada";
                case "LATE_ARRIVAL" -> "atraso " + AttendanceTimeFormat.duration(day.getLateMinutes());
                case "PENDING_REQUEST" -> "ajuste pendente";
                default -> null;
            };
            if (label != null) {
                if (!text.isEmpty()) {
                    text.append(" · ");
                }
                text.append(label);
            }
        }
        return text.toString();
    }

    private static String count(TimesheetResponseDto.Detail detail, AttendanceAlertEnum alert) {
        long count = detail.getDays().stream().filter(day -> day.getAlerts().contains(alert.name())).count();
        return count == 0 ? "Nenhum" : String.valueOf(count);
    }

    private static boolean isRest(String status) {
        return "DAY_OFF".equals(status) || "HOLIDAY".equals(status) || "VACATION".equals(status)
                || "LEAVE".equals(status) || "NOT_EMPLOYED".equals(status);
    }

    private static void field(PdfPTable table, String label, String value) {
        table.addCell(fieldCell(label, value));
    }

    private static PdfPCell fieldCell(String label, String value) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPaddingBottom(6);
        cell.addElement(new Paragraph(label, LABEL));
        Paragraph content = new Paragraph(safe(value, "-"), VALUE);
        content.setSpacingBefore(1);
        cell.addElement(content);
        return cell;
    }

    private static void kpi(PdfPTable table, String label, String value, Color color) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.BOX);
        cell.setBorderColor(BORDER);
        cell.setBackgroundColor(SURFACE);
        cell.setPadding(7);
        cell.addElement(new Paragraph(label, LABEL));
        Paragraph content = new Paragraph(value, font(FontFactory.HELVETICA_BOLD, 13, color));
        content.setSpacingBefore(2);
        cell.addElement(content);
        table.addCell(cell);
    }

    private static void dayCell(PdfPTable table, String text, Font font, Color background, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(BORDER);
        cell.setBackgroundColor(background);
        cell.setHorizontalAlignment(alignment);
        cell.setPaddingTop(4.5f);
        cell.setPaddingBottom(4.5f);
        table.addCell(cell);
    }

    private static PdfPTable card(String title) {
        PdfPTable card = new PdfPTable(new float[] {1.6f, 1f});
        card.setWidthPercentage(100);
        PdfPCell head = new PdfPCell(new Phrase(title, SECTION));
        head.setColspan(2);
        head.setBorder(Rectangle.LEFT);
        head.setBorderColor(PRIMARY);
        head.setBorderWidthLeft(2.5f);
        head.setBackgroundColor(PRIMARY_SOFT);
        head.setPadding(6);
        card.addCell(head);
        return card;
    }

    private static void line(PdfPTable card, String label, String value, Color color) {
        PdfPCell left = new PdfPCell(new Phrase(label, BODY));
        left.setBorder(Rectangle.BOTTOM);
        left.setBorderColor(BORDER);
        left.setPadding(5);
        card.addCell(left);
        PdfPCell right = new PdfPCell(new Phrase(value, font(FontFactory.HELVETICA_BOLD, 8.5f, color)));
        right.setBorder(Rectangle.BOTTOM);
        right.setBorderColor(BORDER);
        right.setHorizontalAlignment(Element.ALIGN_RIGHT);
        right.setPadding(5);
        card.addCell(right);
    }

    private static PdfPCell wrap(PdfPTable inner) {
        PdfPCell cell = new PdfPCell(inner);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(0);
        return cell;
    }

    private static Paragraph gap(float height) {
        Paragraph paragraph = new Paragraph(" ", font(FontFactory.HELVETICA, 2, INK));
        paragraph.setSpacingAfter(height);
        return paragraph;
    }

    private static Color signColor(int minutes) {
        return minutes > 0 ? SUCCESS : minutes < 0 ? ERROR : INK;
    }

    private static Color tint(Color color, float alpha) {
        int r = Math.round(255 - (255 - color.getRed()) * alpha);
        int g = Math.round(255 - (255 - color.getGreen()) * alpha);
        int b = Math.round(255 - (255 - color.getBlue()) * alpha);
        return new Color(r, g, b);
    }

    private static Font font(String name, float size, Color color) {
        Font font = FontFactory.getFont(name, size);
        font.setColor(color);
        return font;
    }

    private static String safe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private static String formatCpf(String cpf) {
        String digits = cpf.replaceAll("\\D", "");
        return digits.length() == 11
                ? digits.substring(0, 3) + "." + digits.substring(3, 6) + "." + digits.substring(6, 9) + "-" + digits.substring(9)
                : cpf;
    }

    private static String formatCnpj(String cnpj) {
        String digits = cnpj.replaceAll("\\D", "");
        return digits.length() == 14
                ? digits.substring(0, 2) + "." + digits.substring(2, 5) + "." + digits.substring(5, 8) + "/"
                        + digits.substring(8, 12) + "-" + digits.substring(12)
                : cnpj;
    }

    /** Rodape fixo com a origem do documento e a pagina. */
    private static final class Footer extends PdfPageEventHelper {
        private final String text;

        private Footer(String text) {
            this.text = text;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte canvas = writer.getDirectContent();
            float y = document.bottom() - 18;
            ColumnText.showTextAligned(canvas, Element.ALIGN_LEFT, new Phrase(text, SMALL), document.left(), y, 0);
            ColumnText.showTextAligned(canvas, Element.ALIGN_RIGHT,
                    new Phrase("Página " + writer.getPageNumber(), SMALL), document.right(), y, 0);
        }
    }

}
