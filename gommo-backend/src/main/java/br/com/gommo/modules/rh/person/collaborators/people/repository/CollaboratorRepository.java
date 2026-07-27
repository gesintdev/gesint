package br.com.gommo.modules.rh.person.collaborators.people.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.collaborators.people.entity.Collaborator;

@Repository
public interface CollaboratorRepository extends IBaseRepository<Collaborator> {

    Optional<Collaborator> findByCpfAndStatusNot(String cpf, StatusEnum status);

    List<Collaborator> findByStatusNotOrderByFullNameAsc(StatusEnum status);

    List<Collaborator> findByStatusOrderByFullNameAsc(StatusEnum status);

    @Query(
            """
            SELECT c FROM Collaborator c
            WHERE c.status <> :deleted
              AND (
                   LOWER(FUNCTION('unaccent', c.fullName)) LIKE LOWER(FUNCTION('unaccent', :pattern))
                OR (c.socialName IS NOT NULL AND LOWER(FUNCTION('unaccent', c.socialName)) LIKE LOWER(FUNCTION('unaccent', :pattern)))
                OR LOWER(c.cpf) LIKE LOWER(:pattern)
              )
            ORDER BY c.fullName ASC
            """)
    List<Collaborator> searchForGlobal(
            @Param("deleted") StatusEnum deleted, @Param("pattern") String pattern, Pageable pageable);
}
