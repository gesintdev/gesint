package br.com.gesint.modules.rh.person.recruiting.ai;

import java.io.InputStream;
import java.util.Locale;

import org.apache.tika.Tika;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class ResumeTextExtractor {

    private static final Logger log = LoggerFactory.getLogger(ResumeTextExtractor.class);
    private static final int MAX_CHARS = 12_000;

    private final Tika tika = new Tika();

    public String extract(InputStream inputStream, String fileName) {
        if (inputStream == null) {
            return "";
        }
        try {
            String text = tika.parseToString(inputStream);
            return normalize(text);
        } catch (Exception ex) {
            log.warn("Falha ao extrair texto do currículo {}: {}", safeName(fileName), ex.getMessage());
            return "";
        }
    }

    private static String normalize(String text) {
        if (!StringUtils.hasText(text)) {
            return "";
        }
        String cleaned = text.replace('\u0000', ' ').replaceAll("[ \\t\\x0B\\f\\r]+", " ").replaceAll("\\n{3,}", "\n\n")
                .trim();
        if (cleaned.length() <= MAX_CHARS) {
            return cleaned;
        }
        return cleaned.substring(0, MAX_CHARS);
    }

    private static String safeName(String fileName) {
        if (!StringUtils.hasText(fileName)) {
            return "arquivo";
        }
        return fileName.trim().toLowerCase(Locale.ROOT);
    }
}
