package br.com.gommo.admin.modules.client.controller;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.gommo.admin.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;

class ClientControllerIntegrationTest extends AbstractIntegrationTest {

    @Test
    void create_shouldPersistClient() throws Exception {
        var token = obtainAccessToken();
        var slug = "test-tenant-" + System.currentTimeMillis();

        var created = postJson(
                "/api/v1/clients",
                """
                {"name":"Empresa Teste","slug":"%s"}
                """
                        .formatted(slug),
                token);

        assertThat(created.statusCode()).isEqualTo(201);
        assertThat(jsonField(created.body(), "slug")).isEqualTo(slug);
    }

    @Test
    void create_duplicateSlug_shouldReturnConflict() throws Exception {
        var token = obtainAccessToken();
        var slug = "dup-slug-" + System.currentTimeMillis();
        var body =
                """
                {"name":"Empresa A","slug":"%s"}
                """
                        .formatted(slug);

        assertThat(postJson("/api/v1/clients", body, token).statusCode()).isEqualTo(201);
        var duplicate = postJson("/api/v1/clients", body, token);

        assertThat(duplicate.statusCode()).isEqualTo(409);
        assertThat(jsonField(duplicate.body(), "code")).isEqualTo("CLIENT_SLUG_EXISTS");
    }

    @Test
    void testDatabaseConnection_withoutHost_shouldReturnBadRequest() throws Exception {
        var token = obtainAccessToken();
        var slug = "db-test-" + System.currentTimeMillis();

        var created = postJson(
                "/api/v1/clients",
                """
                {"name":"Sem host","slug":"%s"}
                """
                        .formatted(slug),
                token);
        assertThat(created.statusCode()).isEqualTo(201);

        var clientId = jsonField(created.body(), "id");
        var test = post("/api/v1/clients/" + clientId + "/actions/test-database-connection", token);

        assertThat(test.statusCode()).isEqualTo(400);
        assertThat(jsonField(test.body(), "code")).isEqualTo("CLIENT_DB_CONFIG_INCOMPLETE");
    }
}
