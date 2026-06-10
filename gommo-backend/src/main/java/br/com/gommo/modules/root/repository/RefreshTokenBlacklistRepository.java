package br.com.gommo.modules.root.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gommo.modules.root.entity.RefreshTokenBlacklist;

public interface RefreshTokenBlacklistRepository extends JpaRepository<RefreshTokenBlacklist, UUID> {

    boolean existsByTokenHash(String tokenHash);
}
