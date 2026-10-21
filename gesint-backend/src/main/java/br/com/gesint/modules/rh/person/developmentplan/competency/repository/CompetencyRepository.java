package br.com.gesint.modules.rh.person.developmentplan.competency.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.developmentplan.competency.entity.Competency;

@Repository
public interface CompetencyRepository extends IBaseRepository<Competency> {

    List<Competency> findAllByStatusNotOrderByNameAsc(StatusEnum status);
}
