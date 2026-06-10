package br.com.gommo.admin.modules.root.controller;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import br.com.gommo.admin.support.AbstractIntegrationTest;

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
}
