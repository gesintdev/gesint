package br.com.gesint.admin.modules.client.repository;

import java.util.Optional;

import br.com.gesint.admin.core.base.repository.IBaseRepository;
import br.com.gesint.admin.core.entity.StatusEnum;
import br.com.gesint.admin.modules.client.entity.Client;

public interface ClientRepository extends IBaseRepository<Client> {

    Optional<Client> findBySlugAndStatusNot(String slug, StatusEnum status);

    boolean existsByMobileLoginCodeAndStatusNot(String mobileLoginCode, StatusEnum status);
}
