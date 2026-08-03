package br.com.gommo.modules.rh.person.occupationalexam.procedure.repository;

import java.util.Optional;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.modules.rh.person.occupationalexam.procedure.entity.EsocialTable27Procedure;

@Repository
public interface EsocialTable27ProcedureRepository extends IBaseRepository<EsocialTable27Procedure> {

    Optional<EsocialTable27Procedure> findByProcedureCode(String procedureCode);
}
