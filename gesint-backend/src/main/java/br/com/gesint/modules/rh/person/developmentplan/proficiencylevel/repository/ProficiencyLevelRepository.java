package br.com.gesint.modules.rh.person.developmentplan.proficiencylevel.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.developmentplan.proficiencylevel.entity.ProficiencyLevel;

@Repository
public interface ProficiencyLevelRepository extends IBaseRepository<ProficiencyLevel> {

    List<ProficiencyLevel> findAllByStatusNotOrderByLevelOrderAsc(StatusEnum status);
}
