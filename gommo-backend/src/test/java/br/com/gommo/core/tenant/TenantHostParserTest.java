package br.com.gommo.core.tenant;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class TenantHostParserTest {

    private final TenantHostParser parser = new TenantHostParser();

    @Test
    void extractsSubdomainFromLocalhostHost() {
        assertThat(parser.extractSubdomain("empresa-a.localhost:3000", "localhost", "gommo.com.br"))
                .contains("empresa-a");
    }

    @Test
    void extractsSubdomainFromProductionDomain() {
        assertThat(parser.extractSubdomain("empresa-a.gommo.com.br", "localhost", "gommo.com.br"))
                .contains("empresa-a");
    }

    @Test
    void bareLocalhostHasNoSubdomain() {
        assertThat(parser.extractSubdomain("localhost:8081", "localhost", "gommo.com.br"))
                .isEmpty();
    }

    @Test
    void ignoresNestedSubdomain() {
        assertThat(parser.extractSubdomain("a.b.localhost", "localhost", "gommo.com.br"))
                .isEmpty();
    }
}
