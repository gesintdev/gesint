package br.com.gesint.modules.careers.page.repository;

import java.util.Optional;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.careers.page.entity.CareersPage;

@Repository
public interface CareersPageRepository extends IBaseRepository<CareersPage> {
    Optional<CareersPage> findFirstByStatusNotOrderByCreatedAtAsc(StatusEnum status);
}
