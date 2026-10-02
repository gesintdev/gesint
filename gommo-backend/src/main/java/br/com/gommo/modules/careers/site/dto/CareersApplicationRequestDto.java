package br.com.gommo.modules.careers.site.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import br.com.gommo.modules.careers.integration.CareersExperience;

/** Dado minimo da candidatura publica (RN-02): sem CPF e sem data de nascimento. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareersApplicationRequestDto {
    @Size(max = 200)
    private String fullName;

    @Size(max = 200)
    private String email;

    @Size(max = 20)
    private String phone;

    @Size(max = 120)
    private String city;

    @Size(max = 2)
    private String stateCode;

    @Size(max = 300)
    private String linkedinUrl;

    @Size(max = 300)
    private String portfolioUrl;

    @Size(max = 5000)
    private String coverLetter;

    @Size(max = 80)
    private String referralSource;

    @Valid
    @Size(max = 20)
    @Builder.Default
    private List<CareersExperience> experiences = new ArrayList<>();

    private BigDecimal salaryExpectation;

    /** Aviso de privacidade deste processo (obrigatorio). */
    private Boolean privacyConsent;

    /** Banco de talentos pelo prazo configurado (opcional, separado). */
    private Boolean talentPoolConsent;
}
