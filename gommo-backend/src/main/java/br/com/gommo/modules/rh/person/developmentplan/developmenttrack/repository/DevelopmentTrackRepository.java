package br.com.gommo.modules.rh.person.developmentplan.developmenttrack.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.developmentplan.developmenttrack.entity.DevelopmentTrack;

@Repository
public interface DevelopmentTrackRepository extends IBaseRepository<DevelopmentTrack> {

    List<DevelopmentTrack> findAllByStatusNotOrderByNameAsc(StatusEnum status);
}
