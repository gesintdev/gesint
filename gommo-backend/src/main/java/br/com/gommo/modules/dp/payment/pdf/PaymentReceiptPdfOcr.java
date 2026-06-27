package br.com.gommo.modules.dp.payment.pdf;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class PaymentReceiptPdfOcr {

    private static final Logger log = LoggerFactory.getLogger(PaymentReceiptPdfOcr.class);
    private static final int HEADER_DPI = 150;
    private static final double HEADER_HEIGHT_RATIO = 0.35;

    private final String configuredTessDataPath;
    private final Tesseract tesseract;

    public PaymentReceiptPdfOcr(@Value("${gommo.payment.ocr.tessdata-path:}") String configuredTessDataPath) {
        this.configuredTessDataPath = configuredTessDataPath == null ? "" : configuredTessDataPath.trim();
        this.tesseract = createTesseract();
    }

    public boolean isAvailable() {
        return tesseract != null;
    }

    public String extractPageHeaderText(PDDocument document, int pageIndex) {
        if (tesseract == null) {
            return "";
        }
        try {
            PDFRenderer renderer = new PDFRenderer(document);
            BufferedImage image = renderer.renderImageWithDPI(pageIndex, HEADER_DPI, ImageType.RGB);
            int headerHeight = Math.max(1, (int) (image.getHeight() * HEADER_HEIGHT_RATIO));
            BufferedImage header = image.getSubimage(0, 0, image.getWidth(), headerHeight);
            String text = tesseract.doOCR(header);
            return text == null ? "" : text;
        } catch (IOException | TesseractException ex) {
            log.warn("OCR failed for payment PDF page {} header: {}", pageIndex + 1, ex.getMessage());
            return "";
        }
    }

    private Tesseract createTesseract() {
        String dataPath = resolveTessDataPath();
        if (dataPath == null) {
            log.warn(
                    "Tesseract tessdata not found. Run scripts/download-tesseract-por.ps1, use Docker image with tesseract-ocr, install Tesseract (por), or set TESSDATA_PREFIX / gommo.payment.ocr.tessdata-path.");
            return null;
        }
        try {
            Tesseract instance = new Tesseract();
            instance.setDatapath(dataPath);
            instance.setLanguage("por");
            instance.setPageSegMode(6);
            log.info("Payment PDF OCR enabled (tessdata: {})", dataPath);
            return instance;
        } catch (Exception ex) {
            log.warn("Failed to initialize Tesseract for payment PDF OCR: {}", ex.getMessage());
            return null;
        }
    }

    private String resolveTessDataPath() {
        List<String> candidates = new ArrayList<>();
        if (!configuredTessDataPath.isBlank()) {
            candidates.add(resolvePath(configuredTessDataPath));
        }
        String fromEnv = System.getenv("TESSDATA_PREFIX");
        if (fromEnv != null && !fromEnv.isBlank()) {
            candidates.add(resolvePath(fromEnv));
        }
        candidates.add(resolvePath("./data/tessdata"));
        candidates.add(resolvePath("../data/tessdata"));
        candidates.addAll(List.of(
                "/usr/share/tesseract-ocr/tessdata",
                "/usr/share/tessdata",
                "/usr/share/tesseract-ocr/5/tessdata",
                "/usr/share/tesseract-ocr/4.00/tessdata",
                "C:\\Program Files\\Tesseract-OCR\\tessdata",
                "C:\\Program Files (x86)\\Tesseract-OCR\\tessdata"));
        for (String candidate : candidates) {
            if (isTessDataDir(candidate)) {
                return candidate;
            }
        }
        return findPortugueseTessDataUnder(Path.of("/usr/share"));
    }

    private String resolvePath(String pathValue) {
        Path path = Path.of(pathValue);
        if (!path.isAbsolute()) {
            path = Path.of(System.getProperty("user.dir")).resolve(path).normalize();
        }
        return path.toString();
    }

    private String findPortugueseTessDataUnder(Path root) {
        if (!Files.isDirectory(root)) {
            return null;
        }
        try (Stream<Path> files = Files.walk(root, 6)) {
            return files.filter(
                            path -> "por.traineddata".equals(path.getFileName().toString()))
                    .map(path -> path.getParent().toString())
                    .findFirst()
                    .orElse(null);
        } catch (IOException ex) {
            throw new UncheckedIOException(ex);
        }
    }

    private boolean isTessDataDir(String pathValue) {
        if (pathValue == null || pathValue.isBlank()) {
            return false;
        }
        Path porData = Path.of(pathValue, "por.traineddata");
        return Files.isRegularFile(porData);
    }
}
