package br.com.gesint.modules.rh.person.developmentplan.actiontemplate.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.developmentplan.actiontemplate.entity.DevelopmentActionTemplate;

@Repository
public interface DevelopmentActionTemplateRepository extends IBaseRepository<DevelopmentActionTemplate> {

    List<DevelopmentActionTemplate> findAllByStatusNotOrderByTitleAsc(StatusEnum status);

    List<DevelopmentActionTemplate> findAllByCompetencyIdAndStatusNot(UUID competencyId, StatusEnum status);
}
