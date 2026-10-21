package br.com.gesint.core.config;

import java.util.concurrent.Executor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import br.com.gesint.core.tenant.TenantContextTaskDecorator;

@Configuration
public class RecruitingAiAsyncConfig {

    @Bean(name = "recruitingAiExecutor")
    public Executor recruitingAiExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);
        executor.setMaxPoolSize(3);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("recruiting-ai-");
        executor.setTaskDecorator(new TenantContextTaskDecorator());
        executor.initialize();
        return executor;
    }
}
