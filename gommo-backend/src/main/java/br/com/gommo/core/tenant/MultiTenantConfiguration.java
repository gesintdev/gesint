package br.com.gommo.core.tenant;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(MultiTenantProperties.class)
public class MultiTenantConfiguration {}
