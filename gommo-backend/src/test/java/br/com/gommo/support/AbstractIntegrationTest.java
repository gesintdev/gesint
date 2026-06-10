package br.com.gommo.support;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Integração HTTP com PostgreSQL (Testcontainers se Docker disponível, senão localhost). Perfil {@code test}.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Tag("integration")
public abstract class AbstractIntegrationTest {

    protected static final String TEST_ADMIN_USERNAME = "admin";

    private static final ObjectMapper JSON = new ObjectMapper();

    @Value("${gommo.dev.admin-password}")
    private String configuredAdminPassword;

    protected String testAdminPassword;

    @LocalServerPort
    protected int port;

    @Autowired(required = false)
    private HttpClient injectedClient;

    protected HttpClient httpClient;
    protected String baseUrl;

    @DynamicPropertySource
    static void registerDataSource(DynamicPropertyRegistry registry) {
        PostgresTestEnvironment.registerSpringProperties(registry);
    }

    @BeforeEach
    void setupHttp() {
        httpClient = injectedClient != null ? injectedClient : HttpClient.newHttpClient();
        baseUrl = "http://localhost:" + port;
        testAdminPassword = configuredAdminPassword;
    }

    protected String obtainAccessToken() throws Exception {
        return obtainTokens().accessToken();
    }

    protected TokenPair obtainTokens() throws Exception {
        var body = "{\"username\":\"%s\",\"password\":\"%s\"}".formatted(TEST_ADMIN_USERNAME, testAdminPassword);
        var response = postJson("/api/v1/auth/login", body, null);
        if (response.statusCode() != 200) {
            throw new IllegalStateException("Login failed: HTTP " + response.statusCode() + " " + response.body());
        }
        JsonNode node = JSON.readTree(response.body());
        return new TokenPair(
                node.get("accessToken").asText(), node.get("refreshToken").asText());
    }

    protected static String jsonField(String body, String field) throws Exception {
        return JSON.readTree(body).get(field).asText();
    }

    protected HttpResponse<String> postJson(String path, String json, String bearerToken) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + path))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json));

        if (bearerToken != null) {
            builder.header("Authorization", "Bearer " + bearerToken);
        }

        return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    protected HttpResponse<String> post(String path, String bearerToken) throws Exception {
        HttpRequest.Builder builder =
                HttpRequest.newBuilder().uri(URI.create(baseUrl + path)).POST(HttpRequest.BodyPublishers.noBody());

        if (bearerToken != null) {
            builder.header("Authorization", "Bearer " + bearerToken);
        }

        return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    protected HttpResponse<String> get(String path, String bearerToken) throws Exception {
        HttpRequest.Builder builder =
                HttpRequest.newBuilder().uri(URI.create(baseUrl + path)).GET();

        if (bearerToken != null) {
            builder.header("Authorization", "Bearer " + bearerToken);
        }

        return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    protected HttpResponse<String> putJson(String path, String json, String bearerToken) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + path))
                .header("Content-Type", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString(json));

        if (bearerToken != null) {
            builder.header("Authorization", "Bearer " + bearerToken);
        }

        return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    protected HttpResponse<String> delete(String path, String bearerToken) throws Exception {
        HttpRequest.Builder builder =
                HttpRequest.newBuilder().uri(URI.create(baseUrl + path)).DELETE();

        if (bearerToken != null) {
            builder.header("Authorization", "Bearer " + bearerToken);
        }

        return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    protected record TokenPair(String accessToken, String refreshToken) {}
}
