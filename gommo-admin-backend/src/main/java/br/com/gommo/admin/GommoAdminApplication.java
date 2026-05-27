package br.com.gommo.admin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing(dateTimeProviderRef = "auditingDateTimeProvider")
public class GommoAdminApplication {

    public static void main(String[] args) {
        SpringApplication.run(GommoAdminApplication.class, args);
    }
}
