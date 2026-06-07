package br.com.gommo.core.tenant;

import javax.sql.DataSource;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(prefix = "gommo.multi-tenant", name = "enabled", havingValue = "true")
public class MultiTenantDataSourceConfiguration {

    @Bean
    public static BeanPostProcessor tenantSchemaDataSourcePostProcessor() {
        return new BeanPostProcessor() {
            @Override
            public Object postProcessAfterInitialization(Object bean, String beanName) {
                if (bean instanceof DataSource dataSource
                        && "dataSource".equals(beanName)
                        && !(dataSource instanceof TenantSchemaDataSource)) {
                    return new TenantSchemaDataSource(dataSource);
                }
                return bean;
            }
        };
    }
}
