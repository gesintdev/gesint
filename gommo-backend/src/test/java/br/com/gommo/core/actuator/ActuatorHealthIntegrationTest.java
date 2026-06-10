package br.com.gommo.core.actuator;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import br.com.gommo.support.AbstractIntegrationTest;

class ActuatorHealthIntegrationTest extends AbstractIntegrationTest {

    @Test
    void health_shouldBePublic() throws Exception {
        var response = get("/actuator/health", null);

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("UP");
    }
}
