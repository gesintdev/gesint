package br.com.gommo.modules.person.collaborators.people.repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.person.collaborators.people.entity.Collaborator;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface CollaboratorRepository extends IBaseRepository<Collaborator> {

    Optional<Collaborator> findByCpfAndStatusNot(String cpf, StatusEnum status);
}
