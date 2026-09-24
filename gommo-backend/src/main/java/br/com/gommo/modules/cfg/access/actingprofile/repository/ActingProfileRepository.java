package br.com.gommo.modules.cfg.access.actingprofile.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.access.actingprofile.entity.ActingProfile;
import br.com.gommo.modules.cfg.access.entity.SystemScopeEnum;

@Repository
public interface ActingProfileRepository extends IBaseRepository<ActingProfile> {

    List<ActingProfile> findAllByStatusNotOrderByNameAsc(StatusEnum status);

    List<ActingProfile> findAllBySystemAndStatusNotOrderByNameAsc(SystemScopeEnum system, StatusEnum status);

    boolean existsByNameIgnoreCaseAndSystemAndStatusNotAndIdNot(
            String name, SystemScopeEnum system, StatusEnum status, UUID id);

    boolean existsByNameIgnoreCaseAndSystemAndStatusNot(String name, SystemScopeEnum system, StatusEnum status);

    Optional<ActingProfile> findByIdAndStatusNot(UUID id, StatusEnum status);
}
