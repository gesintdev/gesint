package br.com.gommo.modules.rh.person.candidate.repository;

import java.util.Optional;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.candidate.entity.Candidate;

public interface CandidateRepository extends IBaseRepository<Candidate> {
    Optional<Candidate> findByCpfAndStatusNot(String cpf, StatusEnum status);
}
