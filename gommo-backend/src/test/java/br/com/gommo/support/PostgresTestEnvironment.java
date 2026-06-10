package br.com.gommo.support;

import org.springframework.test.context.DynamicPropertyRegistry;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Usa Testcontainers quando Docker está disponível; caso contrário, {@code application-test.yml}
 * (Postgres do {@code docker compose} em localhost).
 */
public final class PostgresTestEnvironment {

    private static final String DEFAULT_JDBC = "jdbc:postgresql://localhost:5432/gommo";
    private static final String DEFAULT_USER = "gommo";
    private static final String DEFAULT_PASSWORD = "gommo_test";

    @SuppressWarnings("resource")
    private static final PostgreSQLContainer<?> CONTAINER = createContainerIfPossible();

    private static final boolean USING_CONTAINER = CONTAINER != null && CONTAINER.isRunning();

    private PostgresTestEnvironment() {}

    public static boolean usingContainer() {
        return USING_CONTAINER;
    }

    public static void registerSpringProperties(DynamicPropertyRegistry registry) {
        if (USING_CONTAINER) {
            registry.add("spring.datasource.url", CONTAINER::getJdbcUrl);
            registry.add("spring.datasource.username", CONTAINER::getUsername);
            registry.add("spring.datasource.password", CONTAINER::getPassword);
        }
    }

    public static String jdbcUrl() {
        return USING_CONTAINER ? CONTAINER.getJdbcUrl() : resolveLocalJdbcUrl();
    }

    public static String username() {
        return USING_CONTAINER ? CONTAINER.getUsername() : resolveLocalUser();
    }

    public static String password() {
        return USING_CONTAINER ? CONTAINER.getPassword() : resolveLocalPassword();
    }

    private static PostgreSQLContainer<?> createContainerIfPossible() {
        if (!DockerClientFactory.instance().isDockerAvailable()) {
            return null;
        }
        PostgreSQLContainer<?> container = new PostgreSQLContainer<>("postgres:16-alpine")
                .withDatabaseName("gommo")
                .withUsername(DEFAULT_USER)
                .withPassword(DEFAULT_PASSWORD);
        container.start();
        return container;
    }

    private static String resolveLocalJdbcUrl() {
        String host = System.getenv().getOrDefault("DB_HOST", "localhost");
        String port = System.getenv().getOrDefault("DB_PORT", "5432");
        String name = System.getenv().getOrDefault("DB_NAME", "gommo");
        return "jdbc:postgresql://%s:%s/%s".formatted(host, port, name);
    }

    private static String resolveLocalUser() {
        return System.getenv().getOrDefault("DB_USER", DEFAULT_USER);
    }

    private static String resolveLocalPassword() {
        String fromEnv = System.getenv("DB_PASSWORD");
        if (fromEnv != null && !fromEnv.isBlank()) {
            return fromEnv;
        }
        return DEFAULT_PASSWORD;
    }
}
