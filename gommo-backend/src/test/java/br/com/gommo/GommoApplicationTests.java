package br.com.gommo;

import br.com.gommo.support.PostgresTestEnvironment;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest
@ActiveProfiles("test")
class GommoApplicationTests {

    @DynamicPropertySource
    static void registerDataSource(DynamicPropertyRegistry registry) {
        PostgresTestEnvironment.registerSpringProperties(registry);
    }

    @Test
    void contextLoads() {}
}
