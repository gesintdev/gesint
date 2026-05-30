package br.com.gommo.core.api;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.gommo.support.AbstractIntegrationTest;
import java.util.stream.Stream;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

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
                Arguments.of("/api/v1/companies"),
                Arguments.of("/api/v1/departments"),
                Arguments.of("/api/v1/job-positions"),
                Arguments.of("/api/v1/collaborators"),
                Arguments.of("/api/v1/collaborators/admitted"),
                Arguments.of("/api/v1/admissions"),
                Arguments.of("/api/v1/leave-requests"),
                Arguments.of("/api/v1/benefit-plans"),
                Arguments.of("/api/v1/benefit-enrollments"),
                Arguments.of("/api/v1/attendance-records"),
                Arguments.of("/api/v1/contracts"),
                Arguments.of("/api/v1/payroll-runs"),
                Arguments.of("/api/v1/payslips"),
                Arguments.of("/api/v1/tax-obligations"),
                Arguments.of("/api/v1/performance-reviews"),
                Arguments.of("/api/v1/offboardings"),
                Arguments.of("/api/v1/exit-interviews"),
                Arguments.of("/api/v1/dashboard/summary"),
                Arguments.of(
                        "/api/v1/storage/links?entityType=company&entityId=00000000-0000-0000-0000-000000000099"));
    }
}
