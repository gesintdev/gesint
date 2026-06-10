package br.com.gommo.admin.core.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import br.com.gommo.admin.core.base.repository.BaseRepositoryImpl;

@Configuration
@EnableJpaRepositories(basePackages = "br.com.gommo.admin", repositoryBaseClass = BaseRepositoryImpl.class)
public class JpaRepositoryConfig {}
