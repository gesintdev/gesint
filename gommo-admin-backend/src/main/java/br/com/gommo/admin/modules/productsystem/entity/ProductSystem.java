package br.com.gommo.admin.modules.productsystem.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

import br.com.gommo.admin.core.entity.AuditEntity;

@Entity
@Table(schema = "admin", name = "product_system")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ProductSystem extends AuditEntity {

    @Column(nullable = false, length = 32)
    private String key;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "default_price", precision = 12, scale = 2)
    private BigDecimal defaultPrice;

    @Column(name = "with_ai_available", nullable = false)
    private boolean withAiAvailable;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
