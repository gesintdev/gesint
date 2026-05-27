package br.com.gommo.admin.modules.clientuser.repository;

import br.com.gommo.admin.core.base.repository.IBaseRepository;
import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.clientuser.entity.ClientUser;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClientUserRepository extends IBaseRepository<ClientUser> {

    List<ClientUser> findAllByClientIdAndStatusNot(UUID clientId, StatusEnum status);

    Optional<ClientUser> findByAppUserIdAndStatusNot(UUID appUserId, StatusEnum status);
}
