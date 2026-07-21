package br.com.gommo.modules.dp.organization.cbo.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.organization.cbo.entity.CboOccupation;

public interface CboOccupationRepository extends JpaRepository<CboOccupation, UUID> {

    Optional<CboOccupation> findByCboCode(String cboCode);

    @Query(
            """
            SELECT c FROM CboOccupation c
            WHERE c.status = :status
              AND (
                    LOWER(FUNCTION('unaccent', c.name)) LIKE LOWER(FUNCTION('unaccent', :term))
                 OR c.cboCode LIKE :codeTerm
              )
            """)
    Page<CboOccupation> searchByTerm(
            @Param("status") StatusEnum status,
            @Param("term") String term,
            @Param("codeTerm") String codeTerm,
            Pageable pageable);
}
