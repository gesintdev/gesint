package br.com.gesint.core.tenant;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class TenantHostParserTest {

    private final TenantHostParser parser = new TenantHostParser();

    @Test
    void extractsSubdomainFromLocalhostHost() {
        assertThat(parser.extractSubdomain("empresa-a.localhost:3000", "localhost", "gesint.com.br"))
                .contains("empresa-a");
    }

    @Test
    void extractsSubdomainFromProductionDomain() {
        assertThat(parser.extractSubdomain("empresa-a.gesint.com.br", "localhost", "gesint.com.br"))
                .contains("empresa-a");
    }

    @Test
    void bareLocalhostHasNoSubdomain() {
        assertThat(parser.extractSubdomain("localhost:8081", "localhost", "gesint.com.br"))
                .isEmpty();
    }

    @Test
    void ignoresNestedSubdomain() {
        assertThat(parser.extractSubdomain("a.b.localhost", "localhost", "gesint.com.br"))
                .isEmpty();
    }
}
