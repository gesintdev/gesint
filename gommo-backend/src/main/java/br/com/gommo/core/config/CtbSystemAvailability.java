package br.com.gommo.core.config;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import br.com.gommo.modules.cfg.access.entity.SystemScopeEnum;

/**
 * Contabilidade (CTB) permanece em desenvolvimento e so fica disponivel quando
 * {@code gommo.systems.ctb.enabled=true} (perfil dev / ambiente local).
 */
@Component
public class CtbSystemAvailability {

  public static final String PRODUCT_KEY = "CTB";

  private final boolean enabled;

  public CtbSystemAvailability(@Value("${gommo.systems.ctb.enabled:false}") boolean enabled) {
    this.enabled = enabled;
  }

  public boolean isEnabled() {
    return enabled;
  }

  public boolean isCommercialProductKey(String key) {
    if (key == null || key.isBlank()) {
      return true;
    }
    String normalized = key.trim().toUpperCase(Locale.ROOT);
    if (PRODUCT_KEY.equals(normalized) || "CONTABILIDADE".equals(normalized)) {
      return enabled;
    }
    return true;
  }

  public boolean isSystemScopeAvailable(SystemScopeEnum system) {
    if (system == SystemScopeEnum.CONTABILIDADE) {
      return enabled;
    }
    return true;
  }
}
