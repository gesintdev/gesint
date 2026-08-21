package br.com.gommo.modules.root.controller;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.junit.jupiter.api.Test;

import br.com.gommo.support.AbstractIntegrationTest;

class AuthControllerIntegrationTest extends AbstractIntegrationTest {

    @Test
    void login_shouldReturnTokensForAdmin() throws Exception {
        var body = "{\"username\":\"%s\",\"password\":\"%s\"}".formatted(TEST_ADMIN_USERNAME, testAdminPassword);
        var response = postJson("/api/v1/auth/login", body, null);

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("accessToken").contains("refreshToken");
    }

    @Test
    void login_shouldRejectInvalidCredentials() throws Exception {
        var response = postJson("/api/v1/auth/login", "{\"username\":\"admin\",\"password\":\"wrong\"}", null);

        assertThat(response.statusCode()).isEqualTo(401);
    }

    @Test
    void refresh_shouldRotateTokens() throws Exception {
        var tokens = obtainTokens();

        var response =
                postJson("/api/v1/auth/refresh", "{\"refreshToken\":\"%s\"}".formatted(tokens.refreshToken()), null);

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("accessToken").contains("refreshToken");
        assertThat(jsonField(response.body(), "accessToken")).isNotEqualTo(tokens.accessToken());
    }

    @Test
    void refresh_shouldRejectInvalidToken() throws Exception {
        var response = postJson("/api/v1/auth/refresh", "{\"refreshToken\":\"invalid\"}", null);

        assertThat(response.statusCode()).isEqualTo(401);
    }

    /**
     * Cada emissao de refresh token insere em refresh_token, cujo code vinha de MAX(code)+1 sem
     * lock: dois inserts simultaneos colidiam no unique index e devolviam 500. Em producao isso
     * fazia /auth/refresh falhar e a sessao cair no meio do uso.
     */
    @Test
    void tokenIssuing_shouldNotFailUnderConcurrency() throws Exception {
        int concurrency = 8;
        String body = "{\"username\":\"%s\",\"password\":\"%s\"}".formatted(TEST_ADMIN_USERNAME, testAdminPassword);
        Callable<Integer> issueTokens =
                () -> postJson("/api/v1/auth/login", body, null).statusCode();

        List<Integer> statuses;
        try (var executor = Executors.newFixedThreadPool(concurrency)) {
            statuses = executor.invokeAll(Collections.nCopies(concurrency, issueTokens)).stream()
                    .map(AuthControllerIntegrationTest::join)
                    .toList();
        }

        assertThat(statuses).containsOnly(200);
    }

    private static Integer join(Future<Integer> future) {
        try {
            return future.get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(e);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
