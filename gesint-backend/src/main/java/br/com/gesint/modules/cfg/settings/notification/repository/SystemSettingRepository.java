package br.com.gesint.modules.cfg.settings.notification.repository;

import java.util.Optional;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.cfg.settings.notification.entity.SystemSetting;

@Repository
public interface SystemSettingRepository extends IBaseRepository<SystemSetting> {

    Optional<SystemSetting> findBySettingKeyAndStatusNot(String settingKey, StatusEnum status);
}
