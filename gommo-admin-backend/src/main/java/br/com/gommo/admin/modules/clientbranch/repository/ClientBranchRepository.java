package br.com.gommo.admin.modules.clientbranch.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import br.com.gommo.admin.core.base.repository.IBaseRepository;
import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.clientbranch.entity.ClientBranch;

public interface ClientBranchRepository extends IBaseRepository<ClientBranch> {

    List<ClientBranch> findAllByClientIdAndStatusNotOrderBySortOrderAscLegalNameAsc(UUID clientId, StatusEnum status);

    boolean existsByClientIdAndCnpjAndStatusNotAndIdNot(UUID clientId, String cnpj, StatusEnum status, UUID id);
}
