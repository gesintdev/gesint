package br.com.gommo.admin.modules.clientuser.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import br.com.gommo.admin.core.base.repository.IBaseRepository;
import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.clientuser.entity.ClientUser;

public interface ClientUserRepository extends IBaseRepository<ClientUser> {

    List<ClientUser> findAllByClientIdAndStatusNot(UUID clientId, StatusEnum status);

    List<ClientUser> findAllByClientIdAndTenantAppUserIdIsNullAndStatusNot(UUID clientId, StatusEnum status);

    Optional<ClientUser> findByTenantAppUserIdAndStatusNot(UUID tenantAppUserId, StatusEnum status);

    boolean existsByUsernameIgnoreCaseAndStatusNot(String username, StatusEnum status);

    boolean existsByEmailIgnoreCaseAndStatusNot(String email, StatusEnum status);

    boolean existsByClientIdAndUsernameIgnoreCaseAndStatusNotAndIdNot(
            UUID clientId, String username, StatusEnum status, UUID id);

    boolean existsByEmailIgnoreCaseAndStatusNotAndIdNot(String email, StatusEnum status, UUID id);
}
