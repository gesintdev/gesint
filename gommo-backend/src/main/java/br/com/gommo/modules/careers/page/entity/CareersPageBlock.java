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

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.envers.Audited;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Audited
@Table(name = "careers_page_block")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CareersPageBlock extends AuditEntity {

    @Column(name = "page_id", nullable = false)
    private UUID pageId;

    @Enumerated(EnumType.STRING)
    @Column(name = "block_type", nullable = false, length = 32)
    private CareersBlockTypeEnum blockType;

    @Column(length = 200)
    private String title;

    @Column(length = 400)
    private String subtitle;

    /** Campos especificos do tipo (itens, textos, ids de imagem). Formato definido no frontend. */
    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> content = new LinkedHashMap<>();

    @Builder.Default
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Builder.Default
    @Column(nullable = false)
    private Boolean visible = true;

    @Builder.Default
    @Column(name = "system_block", nullable = false)
    private Boolean systemBlock = false;
}
