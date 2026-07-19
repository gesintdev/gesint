package br.com.gommo.admin.modules.clientcontractedsystem.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gommo.admin.core.base.repository.IBaseRepository;
import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.clientcontractedsystem.entity.ClientContractedSystem;

@Repository
public interface ClientContractedSystemRepository extends IBaseRepository<ClientContractedSystem> {

    List<ClientContractedSystem> findAllByClientIdAndStatusNotOrderByCreatedAtDesc(UUID clientId, StatusEnum status);

    boolean existsByClientIdAndProductSystemIdAndStatusNot(UUID clientId, UUID productSystemId, StatusEnum status);

    boolean existsByClientIdAndProductSystemIdAndStatusNotAndIdNot(
            UUID clientId, UUID productSystemId, StatusEnum status, UUID id);
}

