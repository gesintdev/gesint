package br.com.gesint.modules.rh.person.developmentplan.planorigin.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.developmentplan.planorigin.entity.DevelopmentPlanOrigin;

@Repository
public interface DevelopmentPlanOriginRepository extends IBaseRepository<DevelopmentPlanOrigin> {

    List<DevelopmentPlanOrigin> findAllByStatusNotOrderByNameAsc(StatusEnum status);
}
