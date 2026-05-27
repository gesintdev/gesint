package br.com.gommo.admin.modules.client.repository;

import br.com.gommo.admin.core.base.repository.IBaseRepository;
import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.client.entity.Client;
import java.util.Optional;

public interface ClientRepository extends IBaseRepository<Client> {

    Optional<Client> findBySlugAndStatusNot(String slug, StatusEnum status);
}
