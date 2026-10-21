package br.com.gesint.modules.dp.offboarding.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.offboarding.entity.EsocialDismissalReason;

@Repository
public interface EsocialDismissalReasonRepository extends IBaseRepository<EsocialDismissalReason> {

    List<EsocialDismissalReason> findAllByActiveTrueAndStatusNotOrderByReasonCodeAsc(StatusEnum status);

    Optional<EsocialDismissalReason> findByReasonCodeAndStatusNot(String reasonCode, StatusEnum status);
}
