package br.com.gommo.admin.modules.root.repository;

import br.com.gommo.admin.modules.root.entity.AdminRefreshToken;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRefreshTokenRepository extends JpaRepository<AdminRefreshToken, UUID> {

    Optional<AdminRefreshToken> findByTokenHashAndRevokedFalse(String tokenHash);
}
