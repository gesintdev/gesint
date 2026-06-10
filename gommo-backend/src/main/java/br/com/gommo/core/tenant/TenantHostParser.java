package br.com.gommo.core.tenant;

import java.util.Locale;
import java.util.Optional;

import org.springframework.stereotype.Component;

@Component
public class TenantHostParser {

    public String normalizeHost(String host) {
        if (host == null || host.isBlank()) {
            return "";
        }
        String normalized = host.trim().toLowerCase(Locale.ROOT);
        int colon = normalized.indexOf(':');
        if (colon > 0) {
            normalized = normalized.substring(0, colon);
        }
        return normalized;
    }

    public boolean isBareLocalHost(String host) {
        String normalized = normalizeHost(host);
        return "localhost".equals(normalized) || "127.0.0.1".equals(normalized);
    }

    public Optional<String> extractSubdomain(String host, String baseDomain, String productionBaseDomain) {
        String normalized = normalizeHost(host);
        if (normalized.isBlank() || isBareLocalHost(normalized)) {
            return Optional.empty();
        }

        if (normalized.endsWith(".localhost")) {
            return singleLabelPrefix(normalized, ".localhost");
        }

        Optional<String> fromBase = extractFromSuffix(normalized, baseDomain);
        if (fromBase.isPresent()) {
            return fromBase;
        }

        return extractFromSuffix(normalized, productionBaseDomain);
    }

    private Optional<String> extractFromSuffix(String host, String domain) {
        if (domain == null || domain.isBlank()) {
            return Optional.empty();
        }
        String suffix = "." + domain.trim().toLowerCase(Locale.ROOT);
        if (!host.endsWith(suffix)) {
            return Optional.empty();
        }
        return singleLabelPrefix(host, suffix);
    }

    private Optional<String> singleLabelPrefix(String host, String suffix) {
        String prefix = host.substring(0, host.length() - suffix.length());
        if (prefix.isBlank() || prefix.contains(".")) {
            return Optional.empty();
        }
        return Optional.of(prefix);
    }
}
