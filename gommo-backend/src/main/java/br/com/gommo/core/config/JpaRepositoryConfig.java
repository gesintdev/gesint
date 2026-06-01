package br.com.gommo.core.config;

import br.com.gommo.core.base.repository.BaseRepositoryImpl;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "br.com.gommo", repositoryBaseClass = BaseRepositoryImpl.class)
public class JpaRepositoryConfig {}
