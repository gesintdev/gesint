package br.com.gommo.modules.rh.person.collaborators.people.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.collaborators.people.entity.Collaborator;

@Repository
public interface CollaboratorRepository extends IBaseRepository<Collaborator> {

    Optional<Collaborator> findByCpfAndStatusNot(String cpf, StatusEnum status);

    List<Collaborator> findByStatusNotOrderByFullNameAsc(StatusEnum status);
}
