package br.com.gommo.admin.modules.assistanterrorlog.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.gommo.admin.modules.assistanterrorlog.entity.AssistantErrorLog;

public interface AssistantErrorLogRepository extends JpaRepository<AssistantErrorLog, UUID> {

    @Query(
            """
            SELECT e FROM AssistantErrorLog e
            WHERE (:q IS NULL OR :q = ''
                OR LOWER(e.summary) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(COALESCE(e.clientName, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(COALESCE(e.userName, '')) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(COALESCE(e.errorClass, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<AssistantErrorLog> search(@Param("q") String q, Pageable pageable);
}
