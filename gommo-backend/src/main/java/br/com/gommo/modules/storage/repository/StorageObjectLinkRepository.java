package br.com.gommo.modules.storage.repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.storage.entity.StorageObjectLink;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public interface StorageObjectLinkRepository extends IBaseRepository<StorageObjectLink> {

    List<StorageObjectLink> findAllByEntityTypeAndEntityIdAndStatusNot(
            String entityType, UUID entityId, StatusEnum status);

    List<StorageObjectLink> findAllByEntityTypeAndEntityIdInAndStatusNot(
            String entityType, List<UUID> entityIds, StatusEnum status);
}
