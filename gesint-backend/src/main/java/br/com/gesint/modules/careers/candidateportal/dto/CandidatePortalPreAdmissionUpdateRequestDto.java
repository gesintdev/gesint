package br.com.gesint.modules.careers.candidateportal.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CandidatePortalPreAdmissionUpdateRequestDto {

    @Size(max = 200)
    private String fullName;

    @Size(max = 20)
    private String phone;

    private LocalDate birthDate;

    @Size(max = 10)
    private String bankCode;

    @Size(max = 20)
    private String bankAgency;

    @Size(max = 30)
    private String bankAccount;

    @Size(max = 5)
    private String bankAccountDigit;

    @Size(max = 20)
    private String bankAccountType;

    @Size(max = 120)
    private String pixKey;

    /** Autodeclaração PCD — só quando a vaga for afirmativa. Null = não altera. */
    private Boolean pcdSelfDeclared;
}
