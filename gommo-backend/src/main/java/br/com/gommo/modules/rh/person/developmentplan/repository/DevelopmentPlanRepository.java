package br.com.gommo.modules.rh.person.developmentplan.repository;

import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.modules.rh.person.developmentplan.entity.DevelopmentPlan;

@Repository
public interface DevelopmentPlanRepository extends IBaseRepository<DevelopmentPlan> {}