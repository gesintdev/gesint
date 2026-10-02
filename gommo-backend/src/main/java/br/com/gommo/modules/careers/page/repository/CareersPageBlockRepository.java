package br.com.gommo.modules.careers.page.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.careers.page.entity.CareersPageBlock;

@Repository
public interface CareersPageBlockRepository extends IBaseRepository<CareersPageBlock> {
    List<CareersPageBlock> findAllByPageIdAndStatusNotOrderByDisplayOrderAsc(UUID pageId, StatusEnum status);

    List<CareersPageBlock> findAllByPageId(UUID pageId);
}
