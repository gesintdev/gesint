package br.com.gommo.modules.storage.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.storage.entity.StorageObjectLink;

@Repository
public interface StorageObjectLinkRepository extends IBaseRepository<StorageObjectLink> {

    List<StorageObjectLink> findAllByEntityTypeAndEntityIdAndStatusNot(
            String entityType, UUID entityId, StatusEnum status);

    List<StorageObjectLink> findAllByEntityTypeAndEntityIdInAndStatusNot(
            String entityType, List<UUID> entityIds, StatusEnum status);
}
