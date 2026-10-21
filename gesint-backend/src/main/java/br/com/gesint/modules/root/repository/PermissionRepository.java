package br.com.gesint.modules.root.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.gesint.modules.root.entity.Permission;

public interface PermissionRepository extends JpaRepository<Permission, UUID> {

    List<Permission> findAllByModuleInOrderByAuthorityAsc(Collection<String> modules);

    List<Permission> findAllByOrderByModuleAscAuthorityAsc();
}
