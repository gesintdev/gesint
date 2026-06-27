package br.com.gommo.modules.dp.payment.pdf;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class PaymentReceiptPdfParser {

    private static final Logger log = LoggerFactory.getLogger(PaymentReceiptPdfParser.class);
    private static final int MIN_TEXT_CHARS = 24;
    private static final int MAX_NAME_WORDS = 10;
    private static final int MAX_HEADER_LINES = 18;

    private static final Set<String> NAME_PARTICLES = Set.of("DA", "DE", "DO", "DOS", "DAS", "E", "DEL", "VON", "VAN");

    private static final Pattern[] INLINE_NAME_PATTERNS = {
        Pattern.compile("(?i)nome\\s+(?:do\\s+)?funcion\\w*\\s*:?\\s+(.+)"),
        Pattern.compile("(?i)\\bfunc\\.\\s*:?\\s+(.+)"),
        Pattern.compile("(?i)\\bempregado\\s*:?\\s+(.+)"),
        Pattern.compile("(?i)\\bcolaborador\\s*:?\\s+(.+)"),
    };

    private static final Pattern[] FULLTEXT_NAME_PATTERNS = {
        Pattern.compile(
                "(?i)nome\\s+(?:do\\s+)?funcion\\w*\\s*:?\\s+(.+?)(?=\\s+(?:cbo|departamento|filial|admiss|cargo|codigo|cod\\b|\\d{2}/)|$)"),
        Pattern.compile(
                "(?i)\\bfunc\\.\\s*:?\\s+(.+?)(?=\\s+(?:cbo|departamento|filial|admiss|cargo|codigo|cod\\b|\\d{2}/)|$)"),
        Pattern.compile(
                "(?i)funcion\\w*\\s*:?\\s+([A-Z\u00c1\u00c9\u00cd\u00d3\u00da\u00c3\u00d5\u00c2\u00ca\u00d4\u00c7][A-Z\u00c1\u00c9\u00cd\u00d3\u00da\u00c3\u00d5\u00c2\u00ea\u00d4\u00c7\\s'\\-]{4,60})"),
    };

    private static final Pattern EMPLOYEE_LABEL_ONLY =
            Pattern.compile("(?i)^(?:\\d+\\s+)?nome\\s+(?:do\\s+)?funcion\\w*\\s*:?\\s*$");

    private static final Pattern UPPERCASE_NAME_PATTERN = Pattern.compile(
            "([A-Z\u00c1\u00c9\u00cd\u00d3\u00da\u00c3\u00d5\u00c2\u00ea\u00d4\u00c7][A-Z\u00c1\u00c9\u00cd\u00d3\u00da\u00c3\u00d5\u00c2\u00ea\u00d4\u00c7'\\-]{1,}(?:\\s+[A-Z\u00c1\u00c9\u00cd\u00d3\u00da\u00c3\u00d5\u00c2\u00ea\u00d4\u00c7][A-Z\u00c1\u00c9\u00cd\u00d3\u00da\u00c3\u00d5\u00c2\u00ea\u00d4\u00c7'\\-]{1,}){1,7})");

    private static final String[] HEADER_STOP_MARKERS = {
        "VENCIMENTOS", "DESCRICAO", "DESCRI", "PROVENTOS", "DESCONTOS",
        "SALARIO BASE", "SAL. BASE", "SALARIO", "PARABEN", "ANIVERS",
        "TOTAIS", "LIQUIDO", "BRUTO", "REFERENCIA"
    };

    private static final String[] PAYROLL_KEYWORDS = {
        "SALARIO",
        "SALAR",
        "SAL.",
        "BASE",
        "INSS",
        "FGTS",
        "IRRF",
        "CALC",
        "CALCULO",
        "CONTR",
        "CONTR.",
        "FAIXA",
        "VENCIMENT",
        "DESCONT",
        "PROVENT",
        "LIQUIDO",
        "BRUTO",
        "FERIAS",
        "MENSAL",
        "DEPEND",
        "PIS",
        "PASEP",
        "REFEREN",
        "HORAS",
        "VALOR",
        "TOTAL",
        "LIQUID",
        "PROVENTO",
        "DESCONTO",
        "CONTRIB",
        "PREVID",
        "IMPOSTO",
        "F.G.T.S",
        "F G T S",
        "I.N.S.S",
        "I.R.R.F"
    };

    private static final String[] JOB_TITLE_WORDS = {
        "ARMADOR", "ENCARREGADO", "PEDREIRO", "MOTORISTA", "AJUDANTE", "SERVENTE",
        "OPERADOR", "AUXILIAR", "TECNICO", "ANALISTA", "SUPERVISOR", "GERENTE",
        "COORDENADOR", "DIRETOR", "ESTAGIARIO", "APRENDIZ", "MECANICO", "ELETRICISTA",
        "SOLDADOR", "CARPINTEIRO", "PINTOR", "ZELADOR", "PORTEIRO", "VIGILANTE"
    };

    private final PaymentReceiptPdfOcr ocr;

    public PaymentReceiptPdfParser(PaymentReceiptPdfOcr ocr) {
        this.ocr = ocr;
    }

    public int countPages(byte[] pdfBytes) {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            return document.getNumberOfPages();
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to read payment PDF", ex);
        }
    }

    public List<ParsedPaymentPage> parse(byte[] pdfBytes) {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            int pageCount = document.getNumberOfPages();
            List<ParsedPaymentPage> pages = new ArrayList<>(pageCount);
            for (int pageIndex = 0; pageIndex < pageCount; pageIndex++) {
                pages.add(parsePage(document, pageIndex));
            }
            return pages;
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to read payment PDF", ex);
        }
    }

    public ParsedPaymentPage parsePage(byte[] pdfBytes, int pageIndex) {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            return parsePage(document, pageIndex);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to read payment PDF page " + (pageIndex + 1), ex);
        }
    }

    public ParsedPaymentPage parsePage(PDDocument document, int pageIndex) throws IOException {
        PDFTextStripper stripper = createTextStripper();
        stripper.setStartPage(pageIndex + 1);
        stripper.setEndPage(pageIndex + 1);
        String text = stripper.getText(document);
        if (!hasEnoughText(text) && ocr.isAvailable()) {
            String ocrText = ocr.extractPageHeaderText(document, pageIndex);
            if (hasEnoughText(ocrText)) {
                text = ocrText;
            }
        }
        String headerText = extractHeaderRegion(normalizePageText(text));
        String extractedName = extractEmployeeName(headerText);
        if (extractedName == null && hasEnoughText(text)) {
            log.debug("Payment PDF page {} name not found. Header sample: {}", pageIndex + 1, textSample(headerText));
        } else if (!hasEnoughText(text)) {
            log.warn(
                    "Payment PDF page {} has no readable text layer. OCR available: {}",
                    pageIndex + 1,
                    ocr.isAvailable());
        }
        byte[] pagePdf = extractSinglePagePdf(document, pageIndex);
        return new ParsedPaymentPage(pageIndex + 1, extractedName, pagePdf);
    }

    private PDFTextStripper createTextStripper() throws IOException {
        PDFTextStripper stripper = new PDFTextStripper();
        stripper.setSortByPosition(true);
        stripper.setSuppressDuplicateOverlappingText(true);
        return stripper;
    }

    private boolean hasEnoughText(String text) {
        if (text == null) {
            return false;
        }
        return text.replaceAll("\\s+", "").length() >= MIN_TEXT_CHARS;
    }

    private String textSample(String text) {
        String normalized = text.replace('\n', ' ');
        return normalized.length() <= 180 ? normalized : normalized.substring(0, 180) + "...";
    }

    private byte[] extractSinglePagePdf(PDDocument source, int pageIndex) throws IOException {
        try (PDDocument singlePage = new PDDocument()) {
            PDPage page = source.getPage(pageIndex);
            singlePage.importPage(page);
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            singlePage.save(output);
            return output.toByteArray();
        }
    }

    String extractEmployeeName(String pageText) {
        if (pageText == null || pageText.isBlank()) {
            return null;
        }
        String normalized = extractHeaderRegion(normalizePageText(pageText));

        String fromLines = extractFromLines(normalized);
        if (fromLines != null) {
            return fromLines;
        }

        String fromFullText = extractFromFullTextPatterns(normalized);
        if (fromFullText != null) {
            return fromFullText;
        }

        return extractFirstUppercaseNameAfterLabel(normalized);
    }

    String extractHeaderRegion(String normalized) {
        if (normalized == null || normalized.isBlank()) {
            return normalized;
        }
        String upper = normalized.toUpperCase(Locale.ROOT);
        int cutIndex = normalized.length();
        for (String marker : HEADER_STOP_MARKERS) {
            int idx = upper.indexOf(marker);
            if (idx > 0 && idx < cutIndex) {
                cutIndex = idx;
            }
        }
        String header = normalized.substring(0, cutIndex).trim();
        String[] lines = header.split("\\R");
        if (lines.length > MAX_HEADER_LINES) {
            header = String.join("\n", Arrays.copyOf(lines, MAX_HEADER_LINES));
        }
        return header;
    }

    private String extractFromLines(String normalized) {
        String[] lines = normalized.split("\\R");
        for (String rawLine : lines) {
            String line = rawLine.trim();
            if (line.isEmpty()) {
                continue;
            }
            String fromInline = extractFromInlinePatterns(line);
            if (fromInline != null) {
                return fromInline;
            }
        }
        for (int index = 0; index < lines.length; index++) {
            String line = lines[index].trim();
            if (!EMPLOYEE_LABEL_ONLY.matcher(line).matches()) {
                continue;
            }
            String fromNextLines = extractFromFollowingLines(lines, index + 1);
            if (fromNextLines != null) {
                return fromNextLines;
            }
        }
        return null;
    }

    private String extractFromFullTextPatterns(String normalized) {
        String singleLine =
                normalized.replace('\n', ' ').replaceAll("\\s+", " ").trim();
        for (Pattern pattern : FULLTEXT_NAME_PATTERNS) {
            Matcher matcher = pattern.matcher(singleLine);
            if (!matcher.find()) {
                continue;
            }
            String candidate = finalizeName(cleanName(matcher.group(1)));
            if (isPlausiblePersonName(candidate)) {
                return candidate;
            }
        }
        return null;
    }

    private String extractFirstUppercaseNameAfterLabel(String normalized) {
        String singleLine =
                normalized.replace('\n', ' ').replaceAll("\\s+", " ").trim();
        int funcionarioIndex = indexOfFuncionarioLabel(singleLine);
        Matcher matcher = UPPERCASE_NAME_PATTERN.matcher(singleLine);
        while (matcher.find()) {
            String candidate = finalizeName(cleanName(matcher.group(1)));
            if (!isPlausiblePersonName(candidate)) {
                continue;
            }
            if (funcionarioIndex < 0 || matcher.start() > funcionarioIndex) {
                return candidate;
            }
        }
        return null;
    }

    private int indexOfFuncionarioLabel(String text) {
        Matcher matcher = Pattern.compile("(?i)funcion\\w*").matcher(text);
        return matcher.find() ? matcher.start() : -1;
    }

    private String extractFromInlinePatterns(String line) {
        for (Pattern pattern : INLINE_NAME_PATTERNS) {
            Matcher matcher = pattern.matcher(line);
            if (!matcher.find()) {
                continue;
            }
            String candidate = finalizeName(cleanName(matcher.group(matcher.groupCount())));
            if (isPlausiblePersonName(candidate)) {
                return candidate;
            }
        }
        return null;
    }

    private String extractFromFollowingLines(String[] lines, int startIndex) {
        StringBuilder accumulated = new StringBuilder();
        for (int index = startIndex; index < lines.length; index++) {
            String line = lines[index].trim();
            if (line.isEmpty()) {
                continue;
            }
            if (containsBlockedToken(line) || containsPayrollKeyword(line)) {
                break;
            }
            if (accumulated.length() > 0) {
                accumulated.append(' ');
            }
            accumulated.append(line);
            String candidate = finalizeName(cleanName(accumulated.toString()));
            if (isPlausiblePersonName(candidate)) {
                return candidate;
            }
            if (accumulated.toString().split("\\s+").length >= MAX_NAME_WORDS) {
                break;
            }
        }
        return null;
    }

    private String normalizePageText(String text) {
        return text.replace('\u00A0', ' ')
                .replace('\u2007', ' ')
                .replace('\u202F', ' ')
                .replaceAll("[ \\t]+", " ")
                .replaceAll(" *\\n *", "\n")
                .trim();
    }

    public static String normalizeName(String value) {
        if (value == null) {
            return "";
        }
        return value.trim().toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
    }

    private String cleanName(String value) {
        if (value == null) {
            return null;
        }
        String cleaned = value.trim().replaceAll("\\s+", " ");
        cleaned = cleaned.replaceAll("(?i)\\s+(cbo|departamento|filial|admiss[a\\u00e3]o|cargo|codigo|cod)\\b.*$", "");
        return cleaned.trim();
    }

    private String finalizeName(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return stripTrailingJobTitle(value.trim().replaceAll("\\s+", " "));
    }

    private String stripTrailingJobTitle(String value) {
        String[] tokens = value.split("\\s+");
        while (tokens.length > 2) {
            String last = tokens[tokens.length - 1].toUpperCase(Locale.ROOT);
            if (isJobTitleWord(last)) {
                tokens = Arrays.copyOf(tokens, tokens.length - 1);
                continue;
            }
            if (tokens.length > 2) {
                String lastTwo = (tokens[tokens.length - 2] + " " + tokens[tokens.length - 1]).toUpperCase(Locale.ROOT);
                if (lastTwo.contains("ENCARREGADO") || lastTwo.contains("AFAST")) {
                    tokens = Arrays.copyOf(tokens, tokens.length - 1);
                    continue;
                }
            }
            break;
        }
        return String.join(" ", tokens).trim();
    }

    private boolean isPlausiblePersonName(String value) {
        if (value == null || value.length() < 5) {
            return false;
        }
        if (value.chars().anyMatch(Character::isDigit)) {
            return false;
        }
        if (containsPayrollKeyword(value) || containsBlockedToken(value)) {
            return false;
        }
        if (isJobTitleOnly(value)) {
            return false;
        }
        String[] parts = value.trim().split("\\s+");
        if (parts.length < 2 || parts.length > MAX_NAME_WORDS) {
            return false;
        }
        int substantiveParts = 0;
        for (String part : parts) {
            if (part.contains(".")) {
                return false;
            }
            String upper = part.toUpperCase(Locale.ROOT);
            if (NAME_PARTICLES.contains(upper)) {
                if (part.length() < 1) {
                    return false;
                }
                continue;
            }
            if (part.length() < 2) {
                return false;
            }
            if (isJobTitleWord(upper)) {
                return false;
            }
            if (!part.chars().allMatch(ch -> Character.isLetter(ch) || ch == '-' || ch == '\'')) {
                return false;
            }
            substantiveParts++;
        }
        if (substantiveParts < 2) {
            return false;
        }
        long letters = value.chars().filter(Character::isLetter).count();
        return letters >= value.length() * 0.85;
    }

    private boolean isJobTitleOnly(String value) {
        String[] parts = value.trim().split("\\s+");
        int substantive = 0;
        int jobTitles = 0;
        for (String part : parts) {
            String upper = part.toUpperCase(Locale.ROOT);
            if (NAME_PARTICLES.contains(upper)) {
                continue;
            }
            substantive++;
            if (isJobTitleWord(upper) || upper.contains("ENCARREGADO") || upper.contains("AFAST")) {
                jobTitles++;
            }
        }
        return substantive > 0 && jobTitles == substantive;
    }

    private boolean isJobTitleWord(String upperWord) {
        for (String word : JOB_TITLE_WORDS) {
            if (word.equals(upperWord)) {
                return true;
            }
        }
        return false;
    }

    private boolean containsPayrollKeyword(String line) {
        String upper = line.toUpperCase(Locale.ROOT);
        for (String keyword : PAYROLL_KEYWORDS) {
            if (upper.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private boolean containsBlockedToken(String line) {
        String upper = line.toUpperCase(Locale.ROOT);
        return upper.contains("LTDA")
                || upper.contains("CNPJ")
                || upper.contains("FOLHA")
                || upper.contains("RECIBO")
                || upper.contains("PAGAMENTO")
                || upper.contains("VENCIMENTOS")
                || upper.contains("DESCONTOS")
                || upper.contains("CODIGO")
                || upper.contains("CBO")
                || upper.contains("MENSALISTA")
                || upper.contains("FUNCIONARIO")
                || upper.contains("NOME DO FUNC")
                || upper.contains("PARABEN")
                || upper.contains("ANIVERS")
                || upper.contains("AFAST")
                || upper.contains("PELO SEU")
                || upper.contains("FELIZ");
    }

    public record ParsedPaymentPage(int pageNumber, String extractedName, byte[] pagePdfBytes) {}
}
