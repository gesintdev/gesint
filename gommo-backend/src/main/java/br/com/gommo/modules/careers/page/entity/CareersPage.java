package br.com.gommo.modules.careers.page.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.envers.Audited;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.entity.AuditEntity;

/** Pagina de carreiras do tenant. As colunas sao o rascunho; {@code publishedSnapshot} e o publicado. */
@Entity
@Audited
@Table(name = "careers_page")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CareersPage extends AuditEntity {

    @Column(name = "display_name", length = 200)
    private String displayName;

    @Column(name = "logo_object_id")
    private UUID logoObjectId;

    @Column(name = "primary_color", length = 7)
    private String primaryColor;

    @Column(name = "accent_color", length = 7)
    private String accentColor;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "font_style", nullable = false, length = 16)
    private CareersFontStyleEnum fontStyle = CareersFontStyleEnum.MODERN;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "corner_style", nullable = false, length = 16)
    private CareersCornerStyleEnum cornerStyle = CareersCornerStyleEnum.ROUNDED;

    @Builder.Default
    @Column(name = "show_salary", nullable = false)
    private Boolean showSalary = true;

    @Column(name = "seo_title", length = 70)
    private String seoTitle;

    @Column(name = "seo_description", length = 160)
    private String seoDescription;

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "social_links", columnDefinition = "jsonb", nullable = false)
    private Map<String, String> socialLinks = new LinkedHashMap<>();

    @Column(name = "privacy_notice", columnDefinition = "TEXT")
    private String privacyNotice;

    @Builder.Default
    @Column(name = "privacy_notice_version", nullable = false)
    private Integer privacyNoticeVersion = 1;

    @Builder.Default
    @Column(name = "talent_pool_months", nullable = false)
    private Integer talentPoolMonths = 12;

    @Builder.Default
    @Column(name = "draft_revision", nullable = false)
    private Integer draftRevision = 1;

    @Column(name = "published_revision")
    private Integer publishedRevision;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "published_snapshot", columnDefinition = "jsonb")
    private Map<String, Object> publishedSnapshot;

    @Column(name = "published_at")
    private OffsetDateTime publishedAt;

    @Column(name = "published_by")
    private UUID publishedBy;
}
