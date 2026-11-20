package br.com.gesint.modules.storage.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.storage.entity.StorageObjectLink;

@Repository
public interface StorageObjectLinkRepository extends IBaseRepository<StorageObjectLink> {

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
            value = """
                    UPDATE storage_object o
                       SET company_id = :branchId
                      FROM storage_object_link l
                     WHERE l.storage_object_id = o.id
                       AND l.entity_type = :entityType
                       AND l.entity_id = :entityId
                       AND o.company_id IS NULL
                    """,
            nativeQuery = true)
    int claimObjectsWithoutBranch(
            @Param("branchId") UUID branchId,
            @Param("entityType") String entityType,
            @Param("entityId") UUID entityId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
            value = """
                    UPDATE storage_object_link
                       SET company_id = :branchId
                     WHERE entity_type = :entityType
                       AND entity_id = :entityId
                       AND company_id IS NULL
                       AND status <> 'DELETED'
                    """,
            nativeQuery = true)
    int claimLinksWithoutBranch(
            @Param("branchId") UUID branchId,
            @Param("entityType") String entityType,
            @Param("entityId") UUID entityId);

    List<StorageObjectLink> findAllByEntityTypeAndEntityIdAndStatusNot(
            String entityType, UUID entityId, StatusEnum status);

    List<StorageObjectLink> findAllByEntityTypeAndEntityIdInAndStatusNot(
            String entityType, List<UUID> entityIds, StatusEnum status);

    List<StorageObjectLink> findAllByStorageObjectIdAndStatusNot(UUID storageObjectId, StatusEnum status);
}
