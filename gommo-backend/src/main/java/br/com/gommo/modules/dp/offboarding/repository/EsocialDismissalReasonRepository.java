package br.com.gommo.modules.dp.offboarding.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.offboarding.entity.EsocialDismissalReason;

@Repository
public interface EsocialDismissalReasonRepository extends IBaseRepository<EsocialDismissalReason> {

    List<EsocialDismissalReason> findAllByActiveTrueAndStatusNotOrderByReasonCodeAsc(StatusEnum status);

    Optional<EsocialDismissalReason> findByReasonCodeAndStatusNot(String reasonCode, StatusEnum status);
}
