package br.com.gommo.admin.modules.root.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gommo.admin.modules.root.entity.AdminRefreshTokenBlacklist;

public interface AdminRefreshTokenBlacklistRepository extends JpaRepository<AdminRefreshTokenBlacklist, UUID> {

    boolean existsByTokenHash(String tokenHash);
}
