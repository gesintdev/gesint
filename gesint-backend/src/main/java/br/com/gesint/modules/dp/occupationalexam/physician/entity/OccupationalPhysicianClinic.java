package br.com.gesint.modules.dp.occupationalexam.physician.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.envers.Audited;

@Entity
@Audited
@Table(name = "occupational_physician_clinic")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupationalPhysicianClinic {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "physician_id", nullable = false)
    private UUID physicianId;

    @Column(name = "clinic_id", nullable = false)
    private UUID clinicId;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
