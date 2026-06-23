package br.com.gommo.modules.rh.person.collaborators.address.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.gommo.modules.rh.person.collaborators.address.entity.City;

public interface CityRepository extends JpaRepository<City, UUID> {
    Optional<City> findByIbgeCode(Integer ibgeCode);

    @Query(
            """
            SELECT c FROM City c
            WHERE c.state.id = :stateId
              AND LOWER(FUNCTION('unaccent', c.name)) LIKE LOWER(FUNCTION('unaccent', :term))
            """)
    Page<City> searchByStateAndTerm(
            @Param("stateId") UUID stateId, @Param("term") String term, Pageable pageable);
}
