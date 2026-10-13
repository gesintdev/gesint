package br.com.gommo.modules.root.assistant.knowledge;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

import jakarta.annotation.PostConstruct;

import org.springframework.core.io.ClassPathResource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import br.com.gommo.core.security.AuthorityWildcards;

/**
 * Catálogo estruturado Sistema → Menu → Tópico → Ação. Filtrado pelas authorities da sessão.
 */
@Component
public class AssistantKnowledgeCatalogLoader {

    private static final String CATALOG_PATH = "assistant/knowledge-catalog.json";

    private final ObjectMapper objectMapper;
    private volatile List<AssistantCatalogItem> items = List.of();

    public AssistantKnowledgeCatalogLoader(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    void load() {
        ClassPathResource resource = new ClassPathResource(CATALOG_PATH);
        if (!resource.exists()) {
            throw new IllegalStateException("Catálogo do assistente não encontrado: " + CATALOG_PATH);
        }
        try (InputStream input = resource.getInputStream()) {
            JsonNode root = objectMapper.readTree(input);
            List<AssistantCatalogItem> parsed = new ArrayList<>();
            JsonNode array = root.path("items");
            if (array.isArray()) {
                for (JsonNode node : array) {
                    parsed.add(mapItem(node));
                }
            }
            items = List.copyOf(parsed);
        } catch (IOException ex) {
            throw new IllegalStateException("Falha ao ler catálogo do assistente", ex);
        }
    }

    public List<AssistantCatalogItem> allItems() {
        return items;
    }

    /** Itens visíveis para o usuário autenticado (sem permissão = público autenticado). */
    public List<AssistantCatalogItem> visibleForCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Collection<? extends GrantedAuthority> authorities =
                authentication != null ? authentication.getAuthorities() : List.of();
        return items.stream().filter(item -> isAllowed(item, authorities)).toList();
    }

    public List<AssistantCatalogItem> search(String query, int limit) {
        String normalized = normalize(query);
        List<AssistantCatalogItem> visible = visibleForCurrentUser();
        if (!StringUtils.hasText(normalized)) {
            return visible.stream().limit(Math.max(1, limit)).toList();
        }
        List<Scored> scored = new ArrayList<>();
        for (AssistantCatalogItem item : visible) {
            int score = score(item, normalized);
            if (score > 0) {
                scored.add(new Scored(item, score));
            }
        }
        scored.sort((a, b) -> Integer.compare(b.score(), a.score()));
        return scored.stream().limit(Math.max(1, limit)).map(Scored::item).toList();
    }

    public AssistantCatalogItem findById(String id) {
        if (!StringUtils.hasText(id)) {
            return null;
        }
        return visibleForCurrentUser().stream()
                .filter(item -> id.equals(item.getId()))
                .findFirst()
                .orElse(null);
    }

    private boolean isAllowed(AssistantCatalogItem item, Collection<? extends GrantedAuthority> authorities) {
        if (!StringUtils.hasText(item.getPermission())) {
            return true;
        }
        return AuthorityWildcards.allows(authorities, item.getPermission());
    }

    private static int score(AssistantCatalogItem item, String query) {
        int score = 0;
        score += containsScore(item.getTopic(), query, 8);
        score += containsScore(item.getAction(), query, 6);
        score += containsScore(item.getMenu(), query, 4);
        score += containsScore(item.getSystem(), query, 2);
        score += containsScore(item.getId(), query, 3);
        if (item.getKeywords() != null) {
            for (String keyword : item.getKeywords()) {
                score += containsScore(keyword, query, 10);
                if (query.contains(normalize(keyword))) {
                    score += 12;
                }
            }
        }
        return score;
    }

    private static int containsScore(String field, String query, int weight) {
        if (!StringUtils.hasText(field)) {
            return 0;
        }
        String normalized = normalize(field);
        if (normalized.equals(query)) {
            return weight * 3;
        }
        if (normalized.contains(query) || query.contains(normalized)) {
            return weight;
        }
        return 0;
    }

    private static String normalize(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        String lower = value.trim().toLowerCase(Locale.ROOT);
        // Comparação sem acento: "admissão" ↔ "admissao"
        return java.text.Normalizer.normalize(lower, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");
    }

    private AssistantCatalogItem mapItem(JsonNode node) {
        List<String> keywords = readStringList(node.path("keywords"));
        List<String> steps = readStringList(node.path("steps"));
        String complexityRaw = text(node, "complexity");
        AssistantCatalogComplexity complexity = "EXECUTABLE".equalsIgnoreCase(complexityRaw)
                ? AssistantCatalogComplexity.EXECUTABLE
                : AssistantCatalogComplexity.GUIDE_ONLY;
        return AssistantCatalogItem.builder()
                .id(text(node, "id"))
                .system(text(node, "system"))
                .menu(text(node, "menu"))
                .topic(text(node, "topic"))
                .action(text(node, "action"))
                .href(nullableText(node, "href"))
                .routeId(nullableText(node, "routeId"))
                .permission(nullableText(node, "permission"))
                .complexity(complexity)
                .keywords(keywords)
                .steps(steps)
                .build();
    }

    private static List<String> readStringList(JsonNode node) {
        if (node == null || !node.isArray()) {
            return List.of();
        }
        List<String> values = new ArrayList<>();
        for (JsonNode item : node) {
            String value = item.asString(null);
            if (StringUtils.hasText(value)) {
                values.add(value.trim());
            }
        }
        return List.copyOf(values);
    }

    private static String text(JsonNode node, String field) {
        return Objects.requireNonNullElse(nullableText(node, field), "");
    }

    private static String nullableText(JsonNode node, String field) {
        JsonNode value = node.path(field);
        if (value.isMissingNode() || value.isNull()) {
            return null;
        }
        String text = value.asString(null);
        return StringUtils.hasText(text) ? text.trim() : null;
    }

    private record Scored(AssistantCatalogItem item, int score) {}
}
