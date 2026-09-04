package br.com.gommo.admin.modules.clientcontact.repository;

import java.util.List;
import java.util.UUID;

import br.com.gommo.admin.core.base.repository.IBaseRepository;
import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.clientcontact.entity.ClientContact;

public interface ClientContactRepository extends IBaseRepository<ClientContact> {

    List<ClientContact> findAllByClientIdAndStatusNotOrderBySortOrderAscCreatedAtAsc(
            UUID clientId, StatusEnum status);

    List<ClientContact> findAllByClientIdInAndStatusNotOrderBySortOrderAscCreatedAtAsc(
            List<UUID> clientIds, StatusEnum status);
}