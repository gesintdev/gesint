package br.com.gesint.modules.cfg.settings.agenda.entity;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.Filter;
import org.hibernate.envers.Audited;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import br.com.gesint.core.branch.BranchScopedEntity;

@Entity
@Audited
@Table(name = "agenda_event")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class AgendaEvent extends BranchScopedEntity {

    @Column(name = "owner_user_id", nullable = false)
    private UUID ownerUserId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "starts_at", nullable = false)
    private OffsetDateTime startsAt;

    @Column(name = "ends_at", nullable = false)
    private OffsetDateTime endsAt;

    @Column(length = 255)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;
}
