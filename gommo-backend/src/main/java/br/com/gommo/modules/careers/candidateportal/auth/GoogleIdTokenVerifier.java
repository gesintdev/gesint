package br.com.gommo.modules.careers.candidateportal.auth;

import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import br.com.gommo.modules.careers.candidateportal.config.CandidatePortalProperties;
import br.com.gommo.modules.careers.candidateportal.exception.CandidatePortalException;

/**
 * Valida ID tokens do Google Identity Services via tokeninfo.
 * Sem dependencia Maven extra; client id vem de {@link CandidatePortalProperties}.
 */
@Component
public class GoogleIdTokenVerifier {

    private static final Logger log = LoggerFactory.getLogger(GoogleIdTokenVerifier.class);
    private static final String TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo";

    private final CandidatePortalProperties properties;
    private final RestClient restClient;

    public GoogleIdTokenVerifier(CandidatePortalProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.create();
    }

    public GoogleIdentity verify(String idToken) {
        if (!properties.isGoogleConfigured()) {
            throw CandidatePortalException.googleNotConfigured();
        }
        if (idToken == null || idToken.isBlank()) {
            throw CandidatePortalException.googleTokenInvalid();
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = restClient
                    .get()
                    .uri(TOKENINFO_URL + "?id_token={token}", idToken.trim())
                    .retrieve()
                    .body(Map.class);
            if (payload == null) {
                throw CandidatePortalException.googleTokenInvalid();
            }
            String audience = stringValue(payload.get("aud"));
            if (!properties.getGoogleClientId().equals(audience)) {
                log.warn("Google ID token audience mismatch");
                throw CandidatePortalException.googleTokenInvalid();
            }
            String emailVerified = stringValue(payload.get("email_verified"));
            if (!"true".equalsIgnoreCase(emailVerified)) {
                throw CandidatePortalException.googleTokenInvalid();
            }
            String sub = stringValue(payload.get("sub"));
            String email = stringValue(payload.get("email"));
            if (sub.isBlank() || email.isBlank()) {
                throw CandidatePortalException.googleTokenInvalid();
            }
            String name = Optional.ofNullable(stringValue(payload.get("name")))
                    .filter(value -> !value.isBlank())
                    .orElse(email);
            return new GoogleIdentity(sub, email.toLowerCase(), name);
        } catch (RestClientException ex) {
            log.debug("Google tokeninfo failed: {}", ex.toString());
            throw CandidatePortalException.googleTokenInvalid();
        }
    }

    private static String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    public record GoogleIdentity(String subject, String email, String fullName) {}
}
