package br.com.gommo.modules.rh.person.developmentplan.developmenttrack.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * Expected competency of a development track. Relational child of {@link DevelopmentTrack}
 * (cascade + orphanRemoval), persisted together with the track.
 */
@Entity
@Table(name = "development_track_competency")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DevelopmentTrackCompetency {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id", nullable = false)
    private DevelopmentTrack track;

    @Column(name = "competency_id", nullable = false)
    private UUID competencyId;

    @Column(name = "competency_name", length = 200)
    private String competencyName;

    @Column(name = "expected_level_id")
    private UUID expectedLevelId;

    @Column(name = "expected_level_order")
    private Integer expectedLevelOrder;

    @Column(name = "required", nullable = false)
    private Boolean required;

    @Column
    private Integer weight;
}
