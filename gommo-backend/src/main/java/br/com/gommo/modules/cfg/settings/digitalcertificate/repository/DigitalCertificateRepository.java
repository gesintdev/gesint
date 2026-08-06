package br.com.gommo.modules.cfg.settings.digitalcertificate.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.settings.digitalcertificate.entity.DigitalCertificate;

public interface DigitalCertificateRepository extends IBaseRepository<DigitalCertificate> {

    Optional<DigitalCertificate> findByThumbprintAndStatusNot(String thumbprint, StatusEnum status);

    @Modifying
    @Query(
            """
            update DigitalCertificate c
               set c.isDefault = false
             where c.status <> :deleted
               and c.isDefault = true
               and (:excludeId is null or c.id <> :excludeId)
            """)
    void clearDefaultFlags(@Param("deleted") StatusEnum deleted, @Param("excludeId") UUID excludeId);
}
