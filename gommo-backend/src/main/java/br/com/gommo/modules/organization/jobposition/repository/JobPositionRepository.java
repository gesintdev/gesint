package br.com.gommo.modules.organization.jobposition.repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.modules.organization.jobposition.entity.JobPosition;
import org.springframework.stereotype.Repository;


@Repository
public interface JobPositionRepository extends IBaseRepository<JobPosition> {
}
