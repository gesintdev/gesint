package br.com.gesint.admin.modules.clientbranch.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import br.com.gesint.admin.core.base.repository.IBaseRepository;
import br.com.gesint.admin.core.entity.StatusEnum;
import br.com.gesint.admin.modules.clientbranch.entity.ClientBranch;

public interface ClientBranchRepository extends IBaseRepository<ClientBranch> {

    List<ClientBranch> findAllByClientIdAndStatusNotOrderBySortOrderAscLegalNameAsc(UUID clientId, StatusEnum status);

    boolean existsByClientIdAndCnpjAndStatusNotAndIdNot(UUID clientId, String cnpj, StatusEnum status, UUID id);
}
