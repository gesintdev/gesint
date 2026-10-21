package br.com.gesint.modules.rh.person.candidate.repository;

import java.util.Optional;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.candidate.entity.Candidate;

public interface CandidateRepository extends IBaseRepository<Candidate> {
    Optional<Candidate> findByCpfAndStatusNot(String cpf, StatusEnum status);

    Optional<Candidate> findFirstByEmailIgnoreCaseAndStatusNotOrderByCreatedAtAsc(String email, StatusEnum status);
}
