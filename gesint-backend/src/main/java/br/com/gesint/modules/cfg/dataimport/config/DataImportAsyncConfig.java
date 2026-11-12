package br.com.gesint.modules.cfg.dataimport.config;

import java.util.concurrent.Executor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import br.com.gesint.core.tenant.TenantContextTaskDecorator;

@Configuration
@EnableAsync
public class DataImportAsyncConfig {

    @Bean(name = "dataImportExecutor")
    public Executor dataImportExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);
        executor.setMaxPoolSize(2);
        executor.setQueueCapacity(8);
        executor.setThreadNamePrefix("data-import-");
        executor.setTaskDecorator(new TenantContextTaskDecorator());
        executor.initialize();
        return executor;
    }
}
