package br.com.gommo.modules.rh.person.developmentplan.evidencetype.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.developmentplan.evidencetype.entity.EvidenceType;

@Repository
public interface EvidenceTypeRepository extends IBaseRepository<EvidenceType> {

    List<EvidenceType> findAllByStatusNotOrderByNameAsc(StatusEnum status);
}
