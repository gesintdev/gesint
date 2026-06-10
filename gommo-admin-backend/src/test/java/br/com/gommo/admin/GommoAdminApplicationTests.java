package br.com.gommo.admin;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import br.com.gommo.admin.support.PostgresTestEnvironment;

@SpringBootTest
@ActiveProfiles("test")
class GommoAdminApplicationTests {

    @BeforeAll
    static void migrateHrSchema() {
        PostgresTestEnvironment.migrateHrSchema();
    }

    @DynamicPropertySource
    static void registerDataSource(DynamicPropertyRegistry registry) {
        PostgresTestEnvironment.registerSpringProperties(registry);
    }

    @Test
    void contextLoads() {}
}
