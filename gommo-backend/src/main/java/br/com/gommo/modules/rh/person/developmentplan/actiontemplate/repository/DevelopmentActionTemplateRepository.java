package br.com.gommo.modules.rh.person.developmentplan.actiontemplate.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.developmentplan.actiontemplate.entity.DevelopmentActionTemplate;

@Repository
public interface DevelopmentActionTemplateRepository extends IBaseRepository<DevelopmentActionTemplate> {

    List<DevelopmentActionTemplate> findAllByStatusNotOrderByTitleAsc(StatusEnum status);

    List<DevelopmentActionTemplate> findAllByCompetencyIdAndStatusNot(UUID competencyId, StatusEnum status);
}
