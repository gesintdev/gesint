package br.com.gommo.modules.rh.person.developmentplan.competency.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.developmentplan.competency.entity.Competency;

@Repository
public interface CompetencyRepository extends IBaseRepository<Competency> {

    List<Competency> findAllByStatusNotOrderByNameAsc(StatusEnum status);
}
