package br.com.gommo.admin.modules.root.repository;

import br.com.gommo.admin.modules.root.entity.AdminRefreshTokenBlacklist;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRefreshTokenBlacklistRepository extends JpaRepository<AdminRefreshTokenBlacklist, UUID> {

    boolean existsByTokenHash(String tokenHash);
}
