package br.com.gommo.modules.root.assistant.knowledge;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

/**
 * Carrega prompts/conhecimento do assistente a partir de arquivos em classpath
 * ({@code resources/assistant/*.md}). Assim o conteúdo evolui sem hardcode em Java.
 */
@Component
public class AssistantKnowledgeLoader {

    private static final String SYSTEM_PROMPT_PATH = "assistant/system-prompt.md";
    private static final String ROUTE_GUIDE_PATH = "assistant/route-guide.md";

    private final ConcurrentHashMap<String, String> cache = new ConcurrentHashMap<>();

    public String systemPrompt() {
        return load(SYSTEM_PROMPT_PATH).trim();
    }

    public String routeGuide() {
        return load(ROUTE_GUIDE_PATH).trim();
    }

    /**
     * Monta a instrução de sistema. O mapa de rotas só entra quando necessário.
     */
    public String systemInstruction(boolean includeRouteGuide) {
        if (!includeRouteGuide) {
            return systemPrompt();
        }
        return systemPrompt()
                + "\n\n## MAPA DE NAVEGAÇÃO (use somente o que for relevante)\n\n"
                + routeGuide();
    }

    private String load(String classpathLocation) {
        return cache.computeIfAbsent(classpathLocation, this::readClasspath);
    }

    private String readClasspath(String classpathLocation) {
        ClassPathResource resource = new ClassPathResource(classpathLocation);
        if (!resource.exists()) {
            throw new IllegalStateException(
                    "Arquivo de conhecimento do assistente não encontrado: " + classpathLocation);
        }
        try (InputStream input = resource.getInputStream()) {
            return StreamUtils.copyToString(input, StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new IllegalStateException(
                    "Falha ao ler conhecimento do assistente: " + classpathLocation, ex);
        }
    }
}
