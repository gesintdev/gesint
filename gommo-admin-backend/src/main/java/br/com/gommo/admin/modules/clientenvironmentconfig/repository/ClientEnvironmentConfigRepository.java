package br.com.gommo.admin.modules.clientenvironmentconfig.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gommo.admin.core.base.repository.IBaseRepository;
import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.clientenvironmentconfig.entity.ClientEnvironmentConfig;

@Repository
public interface ClientEnvironmentConfigRepository extends IBaseRepository<ClientEnvironmentConfig> {

    Optional<ClientEnvironmentConfig> findByClientIdAndStatusNot(UUID clientId, StatusEnum status);
}
