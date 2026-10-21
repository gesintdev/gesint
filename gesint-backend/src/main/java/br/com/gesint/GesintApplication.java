package br.com.gesint;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing(dateTimeProviderRef = "auditingDateTimeProvider")
@EnableScheduling
public class GesintApplication {

    public static void main(String[] args) {
        SpringApplication.run(GesintApplication.class, args);
    }
}
