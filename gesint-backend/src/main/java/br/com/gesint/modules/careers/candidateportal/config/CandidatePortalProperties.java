package br.com.gesint.modules.careers.candidateportal.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "gesint.candidate-portal")
public class CandidatePortalProperties {

    /** Client ID OAuth do Google (GIS / ID token). Vazio = login Google desabilitado. */
    private String googleClientId = "";

    /** Reservado para fluxo server-side; permanece opcional no GIS. */
    private String googleClientSecret = "";

    public String getGoogleClientId() {
        return googleClientId;
    }

    public void setGoogleClientId(String googleClientId) {
        this.googleClientId = googleClientId == null ? "" : googleClientId.trim();
    }

    public String getGoogleClientSecret() {
        return googleClientSecret;
    }

    public void setGoogleClientSecret(String googleClientSecret) {
        this.googleClientSecret = googleClientSecret == null ? "" : googleClientSecret.trim();
    }

    public boolean isGoogleConfigured() {
        return !googleClientId.isBlank();
    }
}
