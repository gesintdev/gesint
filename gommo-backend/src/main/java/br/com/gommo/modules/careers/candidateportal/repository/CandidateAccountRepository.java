package br.com.gommo.modules.careers.candidateportal.repository;

import java.util.Optional;
import java.util.UUID;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.careers.candidateportal.entity.CandidateAccount;

public interface CandidateAccountRepository extends IBaseRepository<CandidateAccount> {

    Optional<CandidateAccount> findByEmailIgnoreCaseAndStatusNot(String email, StatusEnum status);

    Optional<CandidateAccount> findByGoogleSubAndStatusNot(String googleSub, StatusEnum status);

    Optional<CandidateAccount> findByCandidateIdAndStatusNot(UUID candidateId, StatusEnum status);

    Optional<CandidateAccount> findByIdAndStatusNot(UUID id, StatusEnum status);
}
