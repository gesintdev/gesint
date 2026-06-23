package br.com.gommo.modules.rh.person.collaborators.address.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.gommo.modules.rh.person.collaborators.address.entity.State;

public interface StateRepository extends JpaRepository<State, UUID> {

    @Query(
            """
            SELECT s FROM State s
            WHERE LOWER(FUNCTION('unaccent', s.name)) LIKE LOWER(FUNCTION('unaccent', :term))
               OR LOWER(FUNCTION('unaccent', s.abbreviation)) LIKE LOWER(FUNCTION('unaccent', :term))
            """)
    Page<State> searchByTerm(@Param("term") String term, Pageable pageable);
}
