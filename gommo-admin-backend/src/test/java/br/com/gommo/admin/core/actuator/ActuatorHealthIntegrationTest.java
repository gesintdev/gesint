package br.com.gommo.admin.core.actuator;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.gommo.admin.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;

class ActuatorHealthIntegrationTest extends AbstractIntegrationTest {

    @Test
    void health_shouldBePublic() throws Exception {
        var response = get("/actuator/health", null);

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("UP");
    }
}
