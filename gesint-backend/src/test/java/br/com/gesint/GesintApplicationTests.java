package br.com.gesint;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import br.com.gesint.support.PostgresTestEnvironment;

@SpringBootTest
@ActiveProfiles("test")
class GesintApplicationTests {

    @DynamicPropertySource
    static void registerDataSource(DynamicPropertyRegistry registry) {
        PostgresTestEnvironment.registerSpringProperties(registry);
    }

    @Test
    void contextLoads() {}
}
