package br.com.gommo.modules.dp.occupationalexam.physician.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gommo.modules.dp.occupationalexam.physician.entity.OccupationalPhysicianClinic;

@Repository
public interface OccupationalPhysicianClinicRepository extends JpaRepository<OccupationalPhysicianClinic, UUID> {

    List<OccupationalPhysicianClinic> findByPhysicianId(UUID physicianId);

    List<OccupationalPhysicianClinic> findByPhysicianIdIn(Collection<UUID> physicianIds);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("delete from OccupationalPhysicianClinic l where l.physicianId = :physicianId")
    void deleteByPhysicianId(@Param("physicianId") UUID physicianId);
}
