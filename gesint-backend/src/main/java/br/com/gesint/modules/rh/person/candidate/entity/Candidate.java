package br.com.gesint.modules.rh.person.candidate.entity;

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

import java.time.LocalDate;

import br.com.gesint.core.branch.BranchScopedEntity;

@Entity
@Audited
@Table(name = "candidate")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class Candidate extends BranchScopedEntity {
    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    /** Opcional: candidatura publica nao pede CPF (RN-02); ele entra na pre-admissao. */
    @Column(length = 14)
    private String cpf;

    @Column(length = 200)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(length = 120)
    private String city;

    @Column(name = "state_code", length = 2)
    private String stateCode;

    @Column(name = "linkedin_url", length = 300)
    private String linkedinUrl;

    @Column(name = "portfolio_url", length = 300)
    private String portfolioUrl;
}
