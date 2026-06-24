package br.com.gommo.modules.cfg.settings.notification.repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.settings.notification.entity.SystemSetting;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemSettingRepository extends IBaseRepository<SystemSetting> {

    Optional<SystemSetting> findBySettingKeyAndStatusNot(String settingKey, StatusEnum status);
}
