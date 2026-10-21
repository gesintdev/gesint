package br.com.gesint.core.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import br.com.gesint.core.base.repository.BaseRepositoryImpl;

@Configuration
@EnableJpaRepositories(basePackages = "br.com.gesint", repositoryBaseClass = BaseRepositoryImpl.class)
public class JpaRepositoryConfig {}
