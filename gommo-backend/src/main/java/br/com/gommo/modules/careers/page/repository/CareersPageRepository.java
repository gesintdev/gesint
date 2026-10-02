package br.com.gommo.modules.careers.page.repository;

import java.util.Optional;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.careers.page.entity.CareersPage;

@Repository
public interface CareersPageRepository extends IBaseRepository<CareersPage> {
    Optional<CareersPage> findFirstByStatusNotOrderByCreatedAtAsc(StatusEnum status);
}
