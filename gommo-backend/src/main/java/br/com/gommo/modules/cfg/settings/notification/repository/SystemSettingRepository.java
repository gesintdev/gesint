package br.com.gommo.modules.cfg.settings.notification.repository;

import java.util.Optional;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.settings.notification.entity.SystemSetting;

@Repository
public interface SystemSettingRepository extends IBaseRepository<SystemSetting> {

    Optional<SystemSetting> findBySettingKeyAndStatusNot(String settingKey, StatusEnum status);
}
