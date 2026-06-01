package br.com.gommo.admin.core.base.repository;

import br.com.gommo.admin.core.entity.AuditEntity;
import br.com.gommo.admin.core.entity.StatusEnum;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface IBaseRepository<T extends AuditEntity> extends JpaRepository<T, UUID> {

    List<T> findAllByStatusNotOrderByCreatedAtDesc(StatusEnum status);

    Page<T> findAllByStatusNot(StatusEnum status, Pageable pageable);

    Optional<T> findByIdAndStatusNot(UUID id, StatusEnum status);
}
