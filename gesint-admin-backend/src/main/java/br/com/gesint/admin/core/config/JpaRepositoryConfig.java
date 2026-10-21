package br.com.gesint.admin.core.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import br.com.gesint.admin.core.base.repository.BaseRepositoryImpl;

@Configuration
@EnableJpaRepositories(basePackages = "br.com.gesint.admin", repositoryBaseClass = BaseRepositoryImpl.class)
public class JpaRepositoryConfig {}
