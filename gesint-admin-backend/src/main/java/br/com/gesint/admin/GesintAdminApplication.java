package br.com.gesint.admin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing(dateTimeProviderRef = "auditingDateTimeProvider")
@EnableScheduling
public class GesintAdminApplication {

    public static void main(String[] args) {
        SpringApplication.run(GesintAdminApplication.class, args);
    }
}
