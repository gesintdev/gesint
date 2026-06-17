package br.com.gommo.modules.rh.person.collaborators.people.controller;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import br.com.gommo.support.AbstractIntegrationTest;

class CollaboratorControllerIntegrationTest extends AbstractIntegrationTest {

    private static final String TEST_CPF = "529.982.247-25";

    private String accessToken;

    private void authenticate() throws Exception {
        accessToken = obtainAccessToken();
    }

    @Test
    void directCreate_shouldBeRejected() throws Exception {
        authenticate();

        var created = postJson(
                "/api/v1/collaborators",
                """
                {"fullName":"Maria Silva","cpf":"%s","birthDate":"1990-05-15"}
                """
                        .formatted(TEST_CPF),
                accessToken);

        assertThat(created.statusCode()).isEqualTo(400);
        assertThat(jsonField(created.body(), "code")).isEqualTo("COLLABORATOR_DIRECT_CREATE_NOT_ALLOWED");
    }

    @Test
    void findAdmitted_shouldReturnOk() throws Exception {
        authenticate();

        var admitted = get("/api/v1/collaborators/admitted", accessToken);
        assertThat(admitted.statusCode()).isEqualTo(200);
    }

    @Test
    void findAll_shouldRequireAuthentication() throws Exception {
        var response = get("/api/v1/collaborators", null);
        assertThat(response.statusCode()).isEqualTo(403);
    }
}
