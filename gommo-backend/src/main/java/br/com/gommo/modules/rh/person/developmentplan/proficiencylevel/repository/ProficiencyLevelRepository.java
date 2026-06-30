package br.com.gommo.modules.rh.person.developmentplan.proficiencylevel.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.developmentplan.proficiencylevel.entity.ProficiencyLevel;

@Repository
public interface ProficiencyLevelRepository extends IBaseRepository<ProficiencyLevel> {

    List<ProficiencyLevel> findAllByStatusNotOrderByLevelOrderAsc(StatusEnum status);
}
