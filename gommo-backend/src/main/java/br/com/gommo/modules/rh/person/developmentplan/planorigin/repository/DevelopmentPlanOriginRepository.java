package br.com.gommo.modules.rh.person.developmentplan.planorigin.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.developmentplan.planorigin.entity.DevelopmentPlanOrigin;

@Repository
public interface DevelopmentPlanOriginRepository extends IBaseRepository<DevelopmentPlanOrigin> {

    List<DevelopmentPlanOrigin> findAllByStatusNotOrderByNameAsc(StatusEnum status);
}
