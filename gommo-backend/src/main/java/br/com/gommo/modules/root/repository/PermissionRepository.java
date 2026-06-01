package br.com.gommo.modules.root.repository;

import br.com.gommo.modules.root.entity.Permission;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, UUID> {

    List<Permission> findAllByModuleInOrderByAuthorityAsc(Collection<String> modules);

    List<Permission> findAllByOrderByModuleAscAuthorityAsc();
}
