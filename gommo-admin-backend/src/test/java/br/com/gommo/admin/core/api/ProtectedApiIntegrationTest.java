package br.com.gommo.admin.core.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.stream.Stream;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import br.com.gommo.admin.support.AbstractIntegrationTest;

class ProtectedApiIntegrationTest extends AbstractIntegrationTest {

    @ParameterizedTest
    @MethodSource("protectedGetEndpoints")
    void get_withoutAuth_shouldReturnForbidden(String path) throws Exception {
        assertThat(get(path, null).statusCode()).isEqualTo(403);
    }

    @ParameterizedTest
    @MethodSource("protectedGetEndpoints")
    void get_withAuth_shouldReturnOk(String path) throws Exception {
        assertThat(get(path, obtainAccessToken()).statusCode()).isEqualTo(200);
    }

    static Stream<Arguments> protectedGetEndpoints() {
        return Stream.of(
                Arguments.of("/api/v1/clients"),
                Arguments.of("/api/v1/client-subscriptions"),
                Arguments.of("/api/v1/client-payments"),
                Arguments.of("/api/v1/admin-users"),
                Arguments.of("/api/v1/client-users"));
    }
}
