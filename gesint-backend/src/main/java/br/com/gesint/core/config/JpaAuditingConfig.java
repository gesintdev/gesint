package br.com.gesint.core.config;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.domain.AuditorAware;

import br.com.gesint.core.audit.CurrentAuditor;

@Configuration
public class JpaAuditingConfig {

    @Bean
    public DateTimeProvider auditingDateTimeProvider() {
        return () -> Optional.of(OffsetDateTime.now());
    }

    @Bean
    public AuditorAware<UUID> auditorAware() {
        return CurrentAuditor::userId;
    }
}
