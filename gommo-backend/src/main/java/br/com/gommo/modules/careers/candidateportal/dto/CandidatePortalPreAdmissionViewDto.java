package br.com.gommo.modules.careers.candidateportal.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CandidatePortalPreAdmissionViewDto {
    private final UUID admissionProcessId;
    private final UUID applicationId;
    private final String jobTitle;
    private final String fullName;
    private final String email;
    private final String phone;
    private final LocalDate birthDate;
    private final String cpf;
    private final String bankCode;
    private final String bankAgency;
    private final String bankAccount;
    private final String bankAccountDigit;
    private final String bankAccountType;
    private final String pixKey;
    private final boolean affirmativePcd;
    private final Boolean pcdSelfDeclared;
    private final boolean completed;
    private final OffsetDateTime completedAt;
    private final OffsetDateTime linkSentAt;

    @Builder.Default
    private final List<CandidatePortalPreAdmissionItemDto> pendingItems = new ArrayList<>();

    @Builder.Default
    private final List<CandidatePortalPreAdmissionDocumentDto> documents = new ArrayList<>();
}
