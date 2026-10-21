package br.com.gesint.modules.rh.person.developmentplan.evidencetype.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.developmentplan.evidencetype.entity.EvidenceType;

@Repository
public interface EvidenceTypeRepository extends IBaseRepository<EvidenceType> {

    List<EvidenceType> findAllByStatusNotOrderByNameAsc(StatusEnum status);
}
