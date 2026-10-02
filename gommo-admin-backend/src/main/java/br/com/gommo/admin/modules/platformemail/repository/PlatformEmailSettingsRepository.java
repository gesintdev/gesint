package br.com.gommo.admin.modules.platformemail.repository;

import java.util.Optional;

import org.springframework.stereotype.Repository;

import br.com.gommo.admin.core.base.repository.IBaseRepository;
import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.platformemail.entity.PlatformEmailSettings;

@Repository
public interface PlatformEmailSettingsRepository extends IBaseRepository<PlatformEmailSettings> {

    Optional<PlatformEmailSettings> findFirstByStatusNotOrderByCreatedAtAsc(StatusEnum status);
}
